/**
 * Calendar placeholder component
 * Simple mock availability UI for booking
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import type { CalendarSlot } from '../../types/booking';

interface CalendarPlaceholderProps {
  onDateSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  className?: string;
}

export const CalendarPlaceholder: React.FC<CalendarPlaceholderProps> = ({
  onDateSelect,
  selectedDate,
  selectedTime,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate mock availability data
  const generateMockSlots = (date: Date): CalendarSlot[] => {
    const slots: CalendarSlot[] = [];
    const today = new Date();
    const startDate = new Date(date);
    startDate.setDate(1); // Start of month

    for (let i = 0; i < 30; i++) {
      const slotDate = new Date(startDate);
      slotDate.setDate(startDate.getDate() + i);

      // Skip past dates
      if (slotDate < today) continue;

      // Generate 3-5 time slots per day
      const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];
      const availableSlots = timeSlots.slice(
        0,
        Math.floor(Math.random() * 3) + 3
      );

      availableSlots.forEach(time => {
        slots.push({
          date: slotDate.toISOString().split('T')[0],
          time,
          available: Math.random() > 0.3, // 70% availability
        });
      });
    }

    return slots;
  };

  const slots = generateMockSlots(currentMonth);
  const availableDates = [
    ...new Set(slots.filter(slot => slot.available).map(slot => slot.date)),
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeSlotsForDate = (date: string) => {
    return slots.filter(slot => slot.date === date && slot.available);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === 'next' ? 1 : -1)
    );
    setCurrentMonth(newMonth);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Select Date & Time
      </h3>

      {/* Month Navigation */}
      <div className='flex items-center justify-between mb-6'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className='w-4 h-4' />
        </Button>

        <h4 className='text-lg font-medium text-gray-900'>
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h4>

        <Button
          variant='outline'
          size='sm'
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>

      {/* Available Dates */}
      <div className='space-y-4'>
        {availableDates.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>
            No available dates this month
          </p>
        ) : (
          availableDates.map(date => {
            const timeSlots = getTimeSlotsForDate(date);
            const isSelected = selectedDate === date;

            return (
              <div key={date} className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h5 className='font-medium text-gray-900'>
                    {formatDate(date)}
                  </h5>
                  {isSelected && <Check className='w-5 h-5 text-green-500' />}
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                  {timeSlots.map(slot => (
                    <Button
                      key={`${slot.date}-${slot.time}`}
                      variant={
                        selectedDate === slot.date && selectedTime === slot.time
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => onDateSelect(slot.date, slot.time)}
                      className='text-xs'
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-sm text-green-800'>
            <strong>Selected:</strong> {formatDate(selectedDate)} at{' '}
            {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
};
