/**
 * Mock data for booking system
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  durationMin: number; // in minutes
  price: number;
  slug: string;
}

export interface Professional {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  services: Service[];
  brandId?: string;
  storeId?: string;
}

export const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Haircut',
    description: 'Professional haircut and styling',
    duration: 60,
    durationMin: 60,
    price: 50,
    slug: 'haircut',
  },
  {
    id: 'service-2',
    name: 'Hair Color',
    description: 'Full hair coloring service',
    duration: 120,
    durationMin: 120,
    price: 120,
    slug: 'hair-color',
  },
  {
    id: 'service-3',
    name: 'Blowout',
    description: 'Professional blowout styling',
    duration: 45,
    durationMin: 45,
    price: 35,
    slug: 'blowout',
  },
  {
    id: 'service-4',
    name: 'Updo',
    description: 'Elegant updo styling for special occasions',
    duration: 90,
    durationMin: 90,
    price: 80,
    slug: 'updo',
  },
];

export const mockProfessionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'John Doe',
    displayName: 'John Doe',
    slug: 'john-doe-hair',
    services: mockServices,
    brandId: 'brand-1',
    storeId: 'store-1',
  },
  {
    id: 'prof-2',
    name: 'Jane Smith',
    displayName: 'Jane Smith',
    slug: 'jane-smith-hair',
    services: mockServices.slice(0, 2),
    brandId: 'brand-1',
    storeId: 'store-1',
  },
];

export function getProfessionalBySlug(slug: string): Professional | null {
  return mockProfessionals.find(prof => prof.slug === slug) || null;
}

export function getServiceBySlug(professionalSlug: string, serviceSlug: string): Service | null {
  const professional = getProfessionalBySlug(professionalSlug);
  if (!professional) return null;
  
  return professional.services.find(service => service.slug === serviceSlug) || null;
}

export function getBrandBySlug(slug: string): any {
  // Mock brand data
  return {
    id: 'brand-1',
    name: 'Glow Beauty Studio',
    slug: slug,
    description: 'Professional beauty services',
  };
}

export function getStoreBySlug(_brandSlug: string, storeSlug: string): any {
  // Mock store data
  return {
    id: 'store-1',
    name: 'Downtown Location',
    slug: storeSlug,
    brandId: 'brand-1',
    address: '123 Main St, Downtown',
  };
}

export const bookingMockData = {
  services: mockServices,
  professionals: mockProfessionals,
  getProfessionalBySlug,
  getServiceBySlug,
  getBrandBySlug,
  getStoreBySlug,
};