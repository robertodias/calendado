/**
 * Mock data for public routing system
 * Provides sample data for testing and development
 */

import type {
  MockData,
  PublicLink,
  DisplayModel,
  RedirectRule,
} from './publicTypes';

// ============================================================================
// MOCK PUBLIC LINKS
// ============================================================================

export const mockBrands: PublicLink[] = [
  {
    id: 'brand-glow',
    type: 'brand',
    slug: 'glow',
    status: 'active',
    target: {
      orgId: 'org-glow',
    },
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockStores: PublicLink[] = [
  {
    id: 'store-porto-alegre',
    type: 'store',
    slug: 'porto-alegre',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-porto-alegre',
    },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'store-centro',
    type: 'store',
    slug: 'centro',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-centro',
    },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'store-zona-sul',
    type: 'store',
    slug: 'zona-sul',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-zona-sul',
    },
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockProfessionals: PublicLink[] = [
  {
    id: 'pro-maria-silva',
    type: 'professional',
    slug: 'maria-silva',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-porto-alegre',
      proId: 'pro-maria-silva',
    },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'pro-joao-pereira',
    type: 'professional',
    slug: 'joao-pereira',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-centro',
      proId: 'pro-joao-pereira',
    },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'pro-ana-lima',
    type: 'professional',
    slug: 'ana-lima',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-zona-sul',
      proId: 'pro-ana-lima',
    },
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockServices: PublicLink[] = [
  {
    id: 'service-hair-cut',
    type: 'service',
    slug: 'hair-cut',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-porto-alegre',
      proId: 'pro-maria-silva',
      serviceId: 'service-hair-cut',
    },
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'service-hair-color',
    type: 'service',
    slug: 'hair-color',
    status: 'active',
    target: {
      orgId: 'org-glow',
      storeId: 'store-porto-alegre',
      proId: 'pro-maria-silva',
      serviceId: 'service-hair-color',
    },
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// MOCK DISPLAY MODELS
// ============================================================================

export const mockDisplayModels: DisplayModel[] = [
  // Brand
  {
    id: 'brand-glow',
    name: 'Glow Beauty',
    slug: 'glow',
    logo: 'https://via.placeholder.com/64x64/6366f1/ffffff?text=G',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
    },
    description: 'Premium beauty services in Porto Alegre',
    status: 'active',
  },

  // Stores
  {
    id: 'store-porto-alegre',
    name: 'Porto Alegre',
    slug: 'porto-alegre',
    logo: 'https://via.placeholder.com/64x64/10b981/ffffff?text=PA',
    description: 'Our flagship store in Porto Alegre',
    status: 'active',
  },
  {
    id: 'store-centro',
    name: 'Centro',
    slug: 'centro',
    logo: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=C',
    description: 'Downtown location in the city center',
    status: 'active',
  },
  {
    id: 'store-zona-sul',
    name: 'Zona Sul',
    slug: 'zona-sul',
    logo: 'https://via.placeholder.com/64x64/ef4444/ffffff?text=ZS',
    description: 'Southern district location',
    status: 'active',
  },

  // Professionals
  {
    id: 'pro-maria-silva',
    name: 'Maria Silva',
    slug: 'maria-silva',
    avatar: 'https://via.placeholder.com/64x64/6366f1/ffffff?text=MS',
    description: 'Expert hair stylist with 5 years of experience',
    status: 'active',
  },
  {
    id: 'pro-joao-pereira',
    name: 'João Pereira',
    slug: 'joao-pereira',
    avatar: 'https://via.placeholder.com/64x64/10b981/ffffff?text=JP',
    description: "Professional barber specializing in men's grooming",
    status: 'active',
  },
  {
    id: 'pro-ana-lima',
    name: 'Ana Lima',
    slug: 'ana-lima',
    avatar: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=AL',
    description: 'Makeup artist and beauty consultant',
    status: 'active',
  },
];

// ============================================================================
// MOCK REDIRECTS
// ============================================================================

export const mockRedirects: RedirectRule[] = [
  {
    from: '/old-glow-brand',
    to: '/glow',
    type: '301',
    reason: 'Brand renamed from old-glow-brand to glow',
  },
  {
    from: '/glow/old-centro',
    to: '/glow/centro',
    type: '301',
    reason: 'Store renamed from old-centro to centro',
  },
  {
    from: '/glow/centro/maria-silva-old',
    to: '/glow/centro/maria-silva',
    type: '301',
    reason: 'Professional slug updated',
  },
  {
    from: '/u/maria-silva-old',
    to: '/u/maria-silva',
    type: '301',
    reason: 'Professional slug updated',
  },
  {
    from: '/glow/centro/maria-silva/',
    to: '/glow/centro/maria-silva',
    type: '301',
    reason: 'Remove trailing slash',
  },
  {
    from: '/glow/centro/maria-silva/booking',
    to: '/glow/centro/maria-silva?service=booking',
    type: '301',
    reason: 'Move booking to query parameter',
  },
];

// ============================================================================
// MOCK DATA OBJECT
// ============================================================================

export const mockData: MockData = {
  brands: mockBrands,
  stores: mockStores,
  professionals: mockProfessionals,
  services: mockServices,
  redirects: mockRedirects,
  displayModels: mockDisplayModels,
};

// ============================================================================
// MOCK DATA UTILITIES
// ============================================================================

/**
 * Get mock public link by type and slug
 */
export function getMockPublicLink(
  type: string,
  slug: string
): PublicLink | null {
  const allLinks = [
    ...mockBrands,
    ...mockStores,
    ...mockProfessionals,
    ...mockServices,
  ];
  return (
    allLinks.find(link => link.type === type && link.slug === slug) || null
  );
}

/**
 * Get mock display model by ID
 */
export function getMockDisplayModel(id: string): DisplayModel | null {
  return mockDisplayModels.find(model => model.id === id) || null;
}

/**
 * Get mock redirect rule by from path
 */
export function getMockRedirectRule(from: string): RedirectRule | null {
  return mockRedirects.find(rule => rule.from === from) || null;
}

/**
 * Get all mock public links
 */
export function getAllMockPublicLinks(): PublicLink[] {
  return [...mockBrands, ...mockStores, ...mockProfessionals, ...mockServices];
}

/**
 * Get all mock display models
 */
export function getAllMockDisplayModels(): DisplayModel[] {
  return [...mockDisplayModels];
}

/**
 * Get all mock redirect rules
 */
export function getAllMockRedirectRules(): RedirectRule[] {
  return [...mockRedirects];
}

// ============================================================================
// MOCK DATA VALIDATION
// ============================================================================

/**
 * Validate mock data integrity
 */
export function validateMockData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for duplicate slugs within same type
  const typeSlugMap = new Map<string, Set<string>>();

  for (const link of getAllMockPublicLinks()) {
    const key = link.type;
    if (!typeSlugMap.has(key)) {
      typeSlugMap.set(key, new Set());
    }

    if (typeSlugMap.get(key)!.has(link.slug)) {
      errors.push(`Duplicate slug "${link.slug}" in type "${link.type}"`);
    } else {
      typeSlugMap.get(key)!.add(link.slug);
    }
  }

  // Check for missing display models
  for (const link of getAllMockPublicLinks()) {
    if (!getMockDisplayModel(link.id)) {
      errors.push(`Missing display model for link "${link.id}"`);
    }
  }

  // Check for circular redirects
  for (const rule of mockRedirects) {
    if (rule.from === rule.to) {
      errors.push(`Circular redirect: "${rule.from}" -> "${rule.to}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// MOCK DATA SEEDING
// ============================================================================

/**
 * Seed mock data into Firestore (for development)
 */
export async function seedMockData(): Promise<void> {
  // This would be implemented to seed data into Firestore
  // For now, just log the data
  console.log('Mock data ready for seeding:', mockData);
}

/**
 * Clear mock data from Firestore (for development)
 */
export async function clearMockData(): Promise<void> {
  // This would be implemented to clear data from Firestore
  console.log('Mock data cleared');
}
