/**
 * Public resolver with LRU cache and telemetry
 * Resolves public URLs to Firestore entities with proper precedence and validation
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { createLRUCache, createCacheKey } from './lruCache';
import {
  validatePublicLink,
  type PublicLink,
  type DisplayModel,
  type ResolverSlugs,
  type ResolverResult,
} from './publicTypes';
// import {
//   // trackResolverHit,
//   // trackMismatchCorrected,
//   // trackNotFound,
//   // trackError,
// } from './telemetry';
import { findRedirectRule } from './redirects';

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_OPTIONS = {
  maxSize: 1000,
  defaultTTL: 60000, // 60 seconds
};

// ============================================================================
// CACHE INSTANCES
// ============================================================================

const publicLinksCache = createLRUCache<PublicLink>(CACHE_OPTIONS);
const displayModelsCache = createLRUCache<DisplayModel>(CACHE_OPTIONS);

// ============================================================================
// RESOLVER IMPLEMENTATION
// ============================================================================

/**
 * Resolve public context from slugs
 * @param slugs - Object containing brand, store, pro, and soloPro slugs
 * @returns Resolver result with context or error
 */
export async function resolvePublicContext(
  slugs: ResolverSlugs
): Promise<ResolverResult> {
  try {
    // Check for redirects first
    const path = buildPathFromSlugs(slugs);
    const redirectRule = findRedirectRule(path);

    if (redirectRule) {
      return {
        success: false,
        error: 'not_found',
        redirect: {
          to: redirectRule.to,
          type: redirectRule.type,
          reason: redirectRule.reason,
        },
      };
    }

    // Resolve based on precedence: pro → store → brand
    if (slugs.pro) {
      return await resolveProfessional(slugs);
    }

    if (slugs.soloPro) {
      return await resolveSoloProfessional(slugs.soloPro);
    }

    if (slugs.store) {
      return await resolveStore(slugs);
    }

    if (slugs.brand) {
      return await resolveBrand(slugs.brand);
    }

    // No valid slugs provided
    return {
      success: false,
      error: 'invalid_slug',
    };
  } catch (error) {
    console.error('Public resolver error:', error);
    // trackError(
    //   buildPathFromSlugs(slugs),
    //   error instanceof Error ? error.message : 'Unknown error'
    // );

    return {
      success: false,
      error: 'not_found',
    };
  }
}

/**
 * Resolve professional (under brand/store)
 */
async function resolveProfessional(
  slugs: ResolverSlugs
): Promise<ResolverResult> {
  if (!slugs.brand || !slugs.store || !slugs.pro) {
    return {
      success: false,
      error: 'invalid_slug',
    };
  }

  const cacheKey = createCacheKey([slugs.brand, slugs.store, slugs.pro]);

  // Check cache first
  let proLink = publicLinksCache.get(cacheKey);
  if (!proLink) {
    proLink = await fetchPublicLink('professional', slugs.pro);
    if (proLink) {
      publicLinksCache.set(cacheKey, proLink);
    }
  }

  if (!proLink || proLink.status !== 'active') {
    // trackNotFound(buildPathFromSlugs(slugs), 'professional');
    return {
      success: false,
      error: proLink?.status === 'disabled' ? 'disabled' : 'not_found',
    };
  }

  // Verify professional belongs to the specified store and brand
  const storeLink = await resolveStoreLink(slugs.brand, slugs.store);
  if (!storeLink) {
    // trackNotFound(buildPathFromSlugs(slugs), 'store');
    return {
      success: false,
      error: 'not_found',
    };
  }

  // Check for mismatch
  const isMismatch =
    proLink.target.storeId !== storeLink.target.storeId ||
    proLink.target.orgId !== storeLink.target.orgId;

  if (isMismatch) {
    // Find correct store for this professional
    const correctStore = await findCorrectStoreForProfessional(proLink);
    if (correctStore) {
      // trackMismatchCorrected(
      //   buildPathFromSlugs(slugs),
      //   `${slugs.brand}/${slugs.store}`,
      //   `${correctStore.slug}/${correctStore.slug}`,
      //   proLink.target.orgId,
      //   correctStore.target.storeId,
      //   proLink.target.proId
      // );

      return {
        success: true,
        context: {
          type: 'professional',
          entity: proLink,
          display: await getDisplayModel(proLink),
          parent: {
            brand: (await resolveBrandLink(correctStore.slug)) || undefined,
            store: correctStore,
          },
          isMismatch: true,
        },
      };
    }
  }

  // Get display model and parent context
  const display = await getDisplayModel(proLink);
  const brandLink = await resolveBrandLink(slugs.brand);
  const storeLinkResolved = await resolveStoreLink(slugs.brand, slugs.store);

  // trackResolverHit(
  //   buildPathFromSlugs(slugs),
  //   'professional',
  //   proLink.target.orgId,
  //   proLink.target.storeId,
  //   proLink.target.proId
  // );

  return {
    success: true,
    context: {
      type: 'professional',
      entity: proLink,
      display,
      parent: {
        brand: brandLink || undefined,
        store: storeLinkResolved || undefined,
      },
    },
  };
}

/**
 * Resolve solo professional (canonical personal link)
 */
async function resolveSoloProfessional(
  proSlug: string
): Promise<ResolverResult> {
  const cacheKey = createCacheKey(['u', proSlug]);

  // Check cache first
  let proLink = publicLinksCache.get(cacheKey);
  if (!proLink) {
    proLink = await fetchPublicLink('professional', proSlug);
    if (proLink) {
      publicLinksCache.set(cacheKey, proLink);
    }
  }

  if (!proLink || proLink.status !== 'active') {
    // trackNotFound(`/u/${proSlug}`, 'professional');
    return {
      success: false,
      error: proLink?.status === 'disabled' ? 'disabled' : 'not_found',
    };
  }

  // Get display model
  const display = await getDisplayModel(proLink);

  // trackResolverHit(
  //   `/u/${proSlug}`,
  //   'professional',
  //   proLink.target.orgId,
  //   proLink.target.storeId,
  //   proLink.target.proId
  // );

  return {
    success: true,
    context: {
      type: 'professional',
      entity: proLink,
      display,
    },
  };
}

/**
 * Resolve store
 */
async function resolveStore(slugs: ResolverSlugs): Promise<ResolverResult> {
  if (!slugs.brand || !slugs.store) {
    return {
      success: false,
      error: 'invalid_slug',
    };
  }

  const storeLink = await resolveStoreLink(slugs.brand, slugs.store);
  if (!storeLink || storeLink.status !== 'active') {
    // trackNotFound(buildPathFromSlugs(slugs), 'store');
    return {
      success: false,
      error: storeLink?.status === 'disabled' ? 'disabled' : 'not_found',
    };
  }

  // Get display model and parent context
  const display = await getDisplayModel(storeLink);
  const brandLink = await resolveBrandLink(slugs.brand);

  // trackResolverHit(
  //   buildPathFromSlugs(slugs),
  //   'store',
  //   storeLink.target.orgId,
  //   storeLink.target.storeId
  // );

  return {
    success: true,
    context: {
      type: 'store',
      entity: storeLink,
      display,
      parent: {
        brand: brandLink || undefined,
      },
    },
  };
}

/**
 * Resolve brand
 */
async function resolveBrand(brandSlug: string): Promise<ResolverResult> {
  const brandLink = await resolveBrandLink(brandSlug);
  if (!brandLink || brandLink.status !== 'active') {
    // trackNotFound(`/${brandSlug}`, 'brand');
    return {
      success: false,
      error: brandLink?.status === 'disabled' ? 'disabled' : 'not_found',
    };
  }

  // Get display model
  const display = await getDisplayModel(brandLink);

  // trackResolverHit(`/${brandSlug}`, 'brand', brandLink.target.orgId);

  return {
    success: true,
    context: {
      type: 'brand',
      entity: brandLink,
      display,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch public link from Firestore
 */
async function fetchPublicLink(
  type: string,
  slug: string
): Promise<PublicLink | null> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const q = query(
      collection(db, 'publicLinks'),
      where('type', '==', type),
      where('slug', '==', slug)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return validatePublicLink({
      id: doc.id,
      ...data,
    });
  } catch (error) {
    console.error(`Error fetching ${type} link:`, error);
    return null;
  }
}

/**
 * Resolve brand link
 */
async function resolveBrandLink(brandSlug: string): Promise<PublicLink | null> {
  const cacheKey = createCacheKey(['brand', brandSlug]);

  let brandLink = publicLinksCache.get(cacheKey);
  if (!brandLink) {
    brandLink = await fetchPublicLink('brand', brandSlug);
    if (brandLink) {
      publicLinksCache.set(cacheKey, brandLink);
    }
  }

  return brandLink;
}

/**
 * Resolve store link
 */
async function resolveStoreLink(
  brandSlug: string,
  storeSlug: string
): Promise<PublicLink | null> {
  const cacheKey = createCacheKey(['store', brandSlug, storeSlug]);

  let storeLink = publicLinksCache.get(cacheKey);
  if (!storeLink) {
    storeLink = await fetchPublicLink('store', storeSlug);
    if (storeLink) {
      publicLinksCache.set(cacheKey, storeLink);
    }
  }

  return storeLink;
}

/**
 * Find correct store for professional
 */
async function findCorrectStoreForProfessional(
  proLink: PublicLink
): Promise<PublicLink | null> {
  if (!proLink.target.storeId) {
    return null;
  }

  // This would need to be implemented based on your data structure
  // For now, return null to indicate no correction available
  return null;
}

/**
 * Get display model for entity
 */
async function getDisplayModel(entity: PublicLink): Promise<DisplayModel> {
  const cacheKey = createCacheKey(['display', entity.id]);

  let display = displayModelsCache.get(cacheKey);
  if (!display) {
    // In a real implementation, this would fetch from Firestore
    // For now, create a basic display model
    display = {
      id: entity.id,
      name: entity.slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      slug: entity.slug,
      status: entity.status,
    };

    displayModelsCache.set(cacheKey, display);
  }

  return display;
}

/**
 * Build path from slugs
 */
function buildPathFromSlugs(slugs: ResolverSlugs): string {
  if (slugs.pro && slugs.store && slugs.brand) {
    return `/${slugs.brand}/${slugs.store}/${slugs.pro}`;
  }

  if (slugs.soloPro) {
    return `/u/${slugs.soloPro}`;
  }

  if (slugs.store && slugs.brand) {
    return `/${slugs.brand}/${slugs.store}`;
  }

  if (slugs.brand) {
    return `/${slugs.brand}`;
  }

  return '/';
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Clear all caches
 */
export function clearCaches(): void {
  publicLinksCache.clear();
  displayModelsCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  publicLinks: ReturnType<typeof publicLinksCache.getStats>;
  displayModels: ReturnType<typeof displayModelsCache.getStats>;
} {
  return {
    publicLinks: publicLinksCache.getStats(),
    displayModels: displayModelsCache.getStats(),
  };
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache(): number {
  const publicLinksCleaned = publicLinksCache.cleanExpired();
  const displayModelsCleaned = displayModelsCache.cleanExpired();

  return publicLinksCleaned + displayModelsCleaned;
}
