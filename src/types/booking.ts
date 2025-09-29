/**
 * Booking system data contracts
 * Defines types for brands, stores, professionals, and services
 */

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  tagline?: string;
  featuredServices?: Service[];
}

export interface Store {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  address?: string;
  phone?: string;
  professionals: Professional[];
  services?: Service[];
}

export interface Professional {
  id: string;
  slug: string;
  brandId?: string;
  storeId?: string;
  displayName: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  services: Service[];
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  durationMin: number;
  price: number;
  description?: string;
}

export interface BookingSelection {
  service?: Service;
  date?: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
}

export interface CalendarSlot {
  date: string;
  time: string;
  available: boolean;
  booked?: boolean;
}
