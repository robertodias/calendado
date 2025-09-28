/**
 * Public URL builders
 * Provides utilities for constructing public-facing URLs with proper encoding
 */

import type { ServiceQuery, URLBuilders } from './publicTypes';

// ============================================================================
// URL BUILDERS
// ============================================================================

/**
 * Build brand URL
 * @param brandSlug - Brand slug
 * @returns Brand URL
 */
export function brandUrl(brandSlug: string): string {
  if (!brandSlug || typeof brandSlug !== 'string') {
    throw new Error('Brand slug is required and must be a string');
  }
  
  const encodedSlug = encodeURIComponent(brandSlug);
  return `/${encodedSlug}`;
}

/**
 * Build store URL
 * @param brandSlug - Brand slug
 * @param storeSlug - Store slug
 * @returns Store URL
 */
export function storeUrl(brandSlug: string, storeSlug: string): string {
  if (!brandSlug || typeof brandSlug !== 'string') {
    throw new Error('Brand slug is required and must be a string');
  }
  if (!storeSlug || typeof storeSlug !== 'string') {
    throw new Error('Store slug is required and must be a string');
  }
  
  const encodedBrandSlug = encodeURIComponent(brandSlug);
  const encodedStoreSlug = encodeURIComponent(storeSlug);
  return `/${encodedBrandSlug}/${encodedStoreSlug}`;
}

/**
 * Build professional URL (under brand/store)
 * @param brandSlug - Brand slug
 * @param storeSlug - Store slug
 * @param proSlug - Professional slug
 * @returns Professional URL
 */
export function proUrl(brandSlug: string, storeSlug: string, proSlug: string): string {
  if (!brandSlug || typeof brandSlug !== 'string') {
    throw new Error('Brand slug is required and must be a string');
  }
  if (!storeSlug || typeof storeSlug !== 'string') {
    throw new Error('Store slug is required and must be a string');
  }
  if (!proSlug || typeof proSlug !== 'string') {
    throw new Error('Professional slug is required and must be a string');
  }
  
  const encodedBrandSlug = encodeURIComponent(brandSlug);
  const encodedStoreSlug = encodeURIComponent(storeSlug);
  const encodedProSlug = encodeURIComponent(proSlug);
  return `/${encodedBrandSlug}/${encodedStoreSlug}/${encodedProSlug}`;
}

/**
 * Build solo professional URL (canonical personal link)
 * @param proSlug - Professional slug
 * @returns Solo professional URL
 */
export function soloProUrl(proSlug: string): string {
  if (!proSlug || typeof proSlug !== 'string') {
    throw new Error('Professional slug is required and must be a string');
  }
  
  const encodedSlug = encodeURIComponent(proSlug);
  return `/u/${encodedSlug}`;
}

/**
 * Build service query string
 * @param query - Service query parameters
 * @returns Query string
 */
export function serviceQuery(query: ServiceQuery = {}): string {
  const params = new URLSearchParams();
  
  if (query.service) {
    params.set('service', query.service);
  }
  
  if (query.date) {
    // Validate ISO date format
    const date = new Date(query.date);
    if (!isNaN(date.getTime())) {
      params.set('date', query.date);
    }
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// URL PARSERS
// ============================================================================

/**
 * Parse brand URL to extract slug
 * @param url - Brand URL
 * @returns Brand slug or null if invalid
 */
export function parseBrandUrl(url: string): string | null {
  const match = url.match(/^\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Parse store URL to extract slugs
 * @param url - Store URL
 * @returns Object with brand and store slugs or null if invalid
 */
export function parseStoreUrl(url: string): { brandSlug: string; storeSlug: string } | null {
  const match = url.match(/^\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  
  return {
    brandSlug: decodeURIComponent(match[1]),
    storeSlug: decodeURIComponent(match[2]),
  };
}

/**
 * Parse professional URL to extract slugs
 * @param url - Professional URL
 * @returns Object with brand, store, and pro slugs or null if invalid
 */
export function parseProUrl(url: string): { brandSlug: string; storeSlug: string; proSlug: string } | null {
  const match = url.match(/^\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  
  return {
    brandSlug: decodeURIComponent(match[1]),
    storeSlug: decodeURIComponent(match[2]),
    proSlug: decodeURIComponent(match[3]),
  };
}

/**
 * Parse solo professional URL to extract slug
 * @param url - Solo professional URL
 * @returns Professional slug or null if invalid
 */
export function parseSoloProUrl(url: string): string | null {
  const match = url.match(/^\/u\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ============================================================================
// URL VALIDATORS
// ============================================================================

/**
 * Validate if URL is a valid brand URL
 * @param url - URL to validate
 * @returns True if valid brand URL
 */
export function isValidBrandUrl(url: string): boolean {
  return parseBrandUrl(url) !== null;
}

/**
 * Validate if URL is a valid store URL
 * @param url - URL to validate
 * @returns True if valid store URL
 */
export function isValidStoreUrl(url: string): boolean {
  return parseStoreUrl(url) !== null;
}

/**
 * Validate if URL is a valid professional URL
 * @param url - URL to validate
 * @returns True if valid professional URL
 */
export function isValidProUrl(url: string): boolean {
  return parseProUrl(url) !== null;
}

/**
 * Validate if URL is a valid solo professional URL
 * @param url - URL to validate
 * @returns True if valid solo professional URL
 */
export function isValidSoloProUrl(url: string): boolean {
  return parseSoloProUrl(url) !== null;
}

// ============================================================================
// URL BUILDERS OBJECT
// ============================================================================

export const urlBuilders: URLBuilders = {
  brandUrl,
  storeUrl,
  proUrl,
  soloProUrl,
  serviceQuery,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current pathname from window.location
 * @returns Current pathname
 */
export function getCurrentPathname(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.pathname;
}

/**
 * Get current search params from window.location
 * @returns Current search params
 */
export function getCurrentSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Build full URL with base URL
 * @param path - Path to append
 * @param baseUrl - Base URL (defaults to current origin)
 * @returns Full URL
 */
export function buildFullUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${path}`;
}

/**
 * Normalize URL by removing trailing slashes and ensuring leading slash
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url) return '/';
  
  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = `/${url}`;
  }
  
  // Remove trailing slash (except for root)
  if (url.length > 1 && url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
}
