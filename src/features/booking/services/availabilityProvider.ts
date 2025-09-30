/**
 * Mock availability provider
 * Simulates availability checking for booking slots
 */

import type { AvailabilitySlot, AvailabilityProvider } from '../types';

export class MockAvailabilityProvider implements AvailabilityProvider {
  async getAvailableSlots(
    professionalId: string,
    _serviceId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const slots: AvailabilitySlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date();

    // Generate slots for the next 30 days
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip past dates
      if (d < currentDate) continue;

      // Skip weekends (optional - remove if you want weekend availability)
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const dateStr = d.toISOString().split('T')[0];

      // Generate time slots (9 AM to 6 PM, every 30 minutes)
      const timeSlots = [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
      ];

      timeSlots.forEach(time => {
        // Randomly make some slots unavailable (70% availability)
        const isAvailable = Math.random() > 0.3;

        slots.push({
          id: `${professionalId}-${dateStr}-${time}`,
          date: dateStr,
          time,
          duration: 30, // Default 30 minutes, will be overridden by service duration
          available: isAvailable,
          professionalId,
        });
      });
    }

    return slots;
  }
}

// Singleton instance
export const availabilityProvider = new MockAvailabilityProvider();
