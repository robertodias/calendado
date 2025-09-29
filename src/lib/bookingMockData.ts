/**
 * Mock data for booking system
 * Provides sample data for brands, stores, professionals, and services
 */

import type { Brand, Store, Professional, Service } from '../types/booking';

export const mockServices: Service[] = [
  {
    id: 'service-haircut',
    slug: 'haircut',
    name: 'Haircut & Styling',
    durationMin: 60,
    price: 45,
    description: 'Professional haircut and styling service',
  },
  {
    id: 'service-color',
    slug: 'color',
    name: 'Hair Coloring',
    durationMin: 120,
    price: 85,
    description: 'Full hair coloring service with consultation',
  },
  {
    id: 'service-highlights',
    slug: 'highlights',
    name: 'Hair Highlights',
    durationMin: 90,
    price: 75,
    description: 'Professional hair highlighting service',
  },
  {
    id: 'service-facial',
    slug: 'facial',
    name: 'Facial Treatment',
    durationMin: 75,
    price: 65,
    description: 'Deep cleansing facial treatment',
  },
  {
    id: 'service-manicure',
    slug: 'manicure',
    name: 'Manicure',
    durationMin: 45,
    price: 35,
    description: 'Professional nail care and polish',
  },
  {
    id: 'service-pedicure',
    slug: 'pedicure',
    name: 'Pedicure',
    durationMin: 60,
    price: 45,
    description: 'Professional foot care and polish',
  },
];

export const mockProfessionals: Professional[] = [
  {
    id: 'pro-maria-silva',
    slug: 'maria-silva',
    displayName: 'Maria Silva',
    role: 'Senior Stylist',
    bio: 'Specialized in hair coloring and cutting with 8+ years of experience.',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    services: [mockServices[0], mockServices[1], mockServices[2]], // haircut, color, highlights
  },
  {
    id: 'pro-joao-pereira',
    slug: 'joao-pereira',
    displayName: 'João Pereira',
    role: 'Master Barber',
    bio: "Expert in men's grooming and classic cuts with 10+ years experience.",
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    services: [mockServices[0]], // haircut
  },
  {
    id: 'pro-ana-lima',
    slug: 'ana-lima',
    displayName: 'Ana Lima',
    role: 'Beauty Specialist',
    bio: 'Specialized in facial treatments and nail care with 6+ years experience.',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    services: [mockServices[3], mockServices[4], mockServices[5]], // facial, manicure, pedicure
  },
  {
    id: 'pro-carlos-santos',
    slug: 'carlos-santos',
    displayName: 'Carlos Santos',
    role: 'Color Specialist',
    bio: 'Expert in hair coloring and highlights with 12+ years experience.',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    services: [mockServices[1], mockServices[2]], // color, highlights
  },
];

export const mockStores: Store[] = [
  {
    id: 'store-porto-alegre',
    slug: 'porto-alegre',
    brandId: 'brand-glow',
    name: 'Glow Porto Alegre',
    address: 'Rua da Praia, 123 - Centro, Porto Alegre - RS',
    phone: '+55 51 99999-9999',
    professionals: [mockProfessionals[0], mockProfessionals[1]], // Maria, João
    services: [mockServices[0], mockServices[1], mockServices[2]], // haircut, color, highlights
  },
  {
    id: 'store-centro',
    slug: 'centro',
    brandId: 'brand-glow',
    name: 'Glow Centro',
    address: 'Av. Independência, 456 - Centro, Porto Alegre - RS',
    phone: '+55 51 88888-8888',
    professionals: [mockProfessionals[2], mockProfessionals[3]], // Ana, Carlos
    services: [mockServices[3], mockServices[4], mockServices[5]], // facial, manicure, pedicure
  },
  {
    id: 'store-zona-sul',
    slug: 'zona-sul',
    brandId: 'brand-glow',
    name: 'Glow Zona Sul',
    address: 'Rua Ipiranga, 789 - Zona Sul, Porto Alegre - RS',
    phone: '+55 51 77777-7777',
    professionals: [
      mockProfessionals[0],
      mockProfessionals[2],
      mockProfessionals[3],
    ], // Maria, Ana, Carlos
    services: mockServices, // all services
  },
];

export const mockBrands: Brand[] = [
  {
    id: 'brand-glow',
    slug: 'glow',
    name: 'Glow Beauty Studio',
    logoUrl:
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    colors: {
      primary: '#8B5CF6', // purple
      secondary: '#EC4899', // pink
    },
    tagline: 'Where beauty meets excellence',
    featuredServices: [mockServices[0], mockServices[1], mockServices[3]], // haircut, color, facial
  },
  {
    id: 'brand-chic',
    slug: 'chic',
    name: 'Chic Hair Salon',
    logoUrl:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=100&h=100&fit=crop',
    colors: {
      primary: '#F59E0B', // amber
      secondary: '#EF4444', // red
    },
    tagline: 'Timeless beauty, modern style',
    featuredServices: [mockServices[0], mockServices[2]], // haircut, highlights
  },
];

// Helper functions to get data by slug
export const getBrandBySlug = (slug: string): Brand | undefined => {
  return mockBrands.find(brand => brand.slug === slug);
};

export const getStoreBySlug = (
  brandSlug: string,
  storeSlug: string
): Store | undefined => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;

  return mockStores.find(
    store => store.brandId === brand.id && store.slug === storeSlug
  );
};

export const getProfessionalBySlug = (
  proSlug: string
): Professional | undefined => {
  return mockProfessionals.find(pro => pro.slug === proSlug);
};

export const getServiceBySlug = (serviceSlug: string): Service | undefined => {
  return mockServices.find(service => service.slug === serviceSlug);
};
