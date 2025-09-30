/**
 * Booking service
 * Handles booking creation, confirmation, and email sending
 */

import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { BookingDraft, BookingConfirmation, BookingService } from '../types';

export class FirebaseBookingService implements BookingService {
  async createBookingDraft(draft: Omit<BookingDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingDraft> {
    try {
      const bookingData = {
        ...draft,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft' as const,
      };

      if (!db) throw new Error('Firebase not initialized');
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      const bookingDraft: BookingDraft = {
        ...draft,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
      };

      return bookingDraft;
    } catch (error) {
      console.error('Error creating booking draft:', error);
      throw new Error('Failed to create booking draft');
    }
  }

  async confirmBooking(bookingId: string): Promise<BookingConfirmation> {
    try {
      // Update booking status to confirmed
      if (!db) throw new Error('Firebase not initialized');
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'confirmed',
        updatedAt: serverTimestamp(),
        confirmationCode: this.generateConfirmationCode(),
      });

      // In a real implementation, you would fetch the booking data here
      // For now, we'll create a mock confirmation
      const confirmation: BookingConfirmation = {
        bookingId,
        confirmationCode: this.generateConfirmationCode(),
        icsFileUrl: `/api/bookings/${bookingId}/ics`,
        customerEmail: 'customer@example.com', // Would come from booking data
        professionalName: 'Professional Name', // Would come from booking data
        serviceName: 'Service Name', // Would come from booking data
        appointmentDate: '2024-01-15', // Would come from booking data
        appointmentTime: '10:00', // Would come from booking data
        location: 'Store Address', // Would come from booking data
      };

      return confirmation;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw new Error('Failed to confirm booking');
    }
  }

  async sendConfirmationEmail(confirmation: BookingConfirmation): Promise<void> {
    try {
      // In a real implementation, this would call your email service
      console.log('Sending confirmation email:', confirmation);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  async generateICSFile(booking: BookingDraft): Promise<string> {
    try {
      // In a real implementation, this would generate an actual ICS file
      // For now, we'll return a mock URL
      const icsUrl = `/api/bookings/${booking.id}/ics`;
      console.log('Generated ICS file URL:', icsUrl);
      return icsUrl;
    } catch (error) {
      console.error('Error generating ICS file:', error);
      throw new Error('Failed to generate ICS file');
    }
  }

  private generateConfirmationCode(): string {
    // Generate a 6-digit confirmation code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Singleton instance
export const bookingService = new FirebaseBookingService();
