/**
 * Booking flow types and interfaces
 * Defines data contracts for the booking wizard
 */

export interface BookingContext {
  brandId: string;
  brandSlug: string;
  storeId?: string;
  storeSlug?: string;
  professionalId?: string;
  professionalSlug?: string;
}

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  available: boolean;
  professionalId?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingDraft {
  id: string;
  context: BookingContext;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  selectedSlot: AvailabilitySlot;
  customer: CustomerInfo;
  status: 'draft' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  confirmationCode?: string;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationCode: string;
  icsFileUrl: string;
  customerEmail: string;
  professionalName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  location?: string;
}

export interface AvailabilityProvider {
  getAvailableSlots(
    professionalId: string,
    serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]>;
}

export interface BookingService {
  createBookingDraft(
    draft: Omit<BookingDraft, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BookingDraft>;
  confirmBooking(bookingId: string): Promise<BookingConfirmation>;
  sendConfirmationEmail(confirmation: BookingConfirmation): Promise<void>;
  generateICSFile(booking: BookingDraft): Promise<string>;
}
