/**
 * ICS (iCalendar) file generator
 * Creates calendar files for booking confirmations
 */

import { Request, Response } from 'express';

interface BookingData {
  id: string;
  serviceName: string;
  professionalName: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  duration: number; // minutes
  location?: string;
  description?: string;
}

export function generateICSContent(booking: BookingData): string {
  const startDate = new Date(`${booking.appointmentDate}T${booking.appointmentTime}:00`);
  const endDate = new Date(startDate.getTime() + booking.duration * 60000);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  const uid = `booking-${booking.id}@calendado.com`;
  const now = new Date();
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendado//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapeText(booking.serviceName)} - ${escapeText(booking.professionalName)}`,
    `DESCRIPTION:${escapeText(booking.description || `Appointment with ${booking.professionalName} for ${booking.serviceName}`)}`,
    `LOCATION:${escapeText(booking.location || 'Store Location')}`,
    `ORGANIZER:CN=${escapeText(booking.professionalName)}:MAILTO:${escapeText(booking.customerEmail)}`,
    `ATTENDEE:CN=${escapeText(booking.customerName)}:MAILTO:${escapeText(booking.customerEmail)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeText(booking.serviceName)} appointment in 15 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function generateICSFile(booking: BookingData): Buffer {
  const icsContent = generateICSContent(booking);
  return Buffer.from(icsContent, 'utf8');
}

export function getICSFileName(booking: BookingData): string {
  const date = booking.appointmentDate.replace(/-/g, '');
  const time = booking.appointmentTime.replace(':', '');
  return `appointment-${date}-${time}.ics`;
}

// Express route handler
export function handleICSRequest(req: Request, res: Response): void {
  try {
    const { bookingId } = req.params;
    
    // In a real implementation, you would fetch the booking data from Firestore
    // For now, we'll create mock data
    const mockBooking: BookingData = {
      id: bookingId,
      serviceName: 'Haircut & Styling',
      professionalName: 'Maria Silva',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00',
      duration: 60,
      location: 'Glow Beauty Studio - Porto Alegre',
      description: 'Professional haircut and styling service with Maria Silva'
    };

    const icsContent = generateICSFile(mockBooking);
    const fileName = getICSFileName(mockBooking);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(icsContent);
  } catch (error) {
    console.error('Error generating ICS file:', error);
    res.status(500).json({ error: 'Failed to generate calendar file' });
  }
}

