/**
 * Availability selection step
 * Shows available time slots for booking
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { availabilityProvider } from '../../services/availabilityProvider';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Calendar, Clock, Check } from 'lucide-react';
import type { AvailabilitySlot } from '../../types';

export const AvailabilityStep: React.FC = () => {
  const { state, dispatch } = useBooking();
  const [searchParams] = useSearchParams();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    if (state.selectedService && state.context?.professionalId) {
      loadAvailability();
    }
  }, [state.selectedService, state.context?.professionalId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // Next 30 days

      const availableSlots = await availabilityProvider.getAvailableSlots(
        state.context!.professionalId!,
        state.selectedService!.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Update slot duration to match service duration
      const updatedSlots = availableSlots.map(slot => ({
        ...slot,
        duration: state.selectedService!.durationMin,
      }));

      setSlots(updatedSlots);

      // Get unique available dates
      const dates = [...new Set(updatedSlots
        .filter(slot => slot.available)
        .map(slot => slot.date)
      )].sort();

      setAvailableDates(dates);

      if (dates.length > 0) {
        // Check for preselected date from URL
        const preselectedDate = searchParams.get('date');
        if (preselectedDate && dates.includes(preselectedDate)) {
          setSelectedDate(preselectedDate);
        } else {
          setSelectedDate(dates[0]);
        }
      }

      // Handle preselected time slot
      const preselectedDate = searchParams.get('date');
      const preselectedTime = searchParams.get('time');
      
      if (preselectedDate && preselectedTime) {
        const preselectedSlot = updatedSlots.find(
          slot => slot.date === preselectedDate && slot.time === preselectedTime && slot.available
        );
        
        if (preselectedSlot) {
          dispatch({ type: 'SET_SLOT', payload: preselectedSlot });
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load availability' });
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    dispatch({ type: 'SET_SLOT', payload: slot });
  };

  const getTimeSlotsForDate = (date: string) => {
    return slots.filter(slot => slot.date === date && slot.available);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading available times...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Time
        </h2>
        <p className="text-gray-600">
          Select your preferred date and time for {state.selectedService?.name}
        </p>
      </div>

      {availableDates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No available times found for the next 30 days.</p>
          <p className="text-sm text-gray-400">Please try a different service or contact us directly.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableDates.slice(0, 14).map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? 'default' : 'outline'}
                  onClick={() => setSelectedDate(date)}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Times for {formatDate(selectedDate)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {getTimeSlotsForDate(selectedDate).map((slot) => (
                  <Button
                    key={slot.id}
                    variant={state.selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    onClick={() => handleSelectSlot(slot)}
                    className="h-auto p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(slot.time)}</span>
                      {state.selectedSlot?.id === slot.id && (
                        <Check className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {state.selectedSlot && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800">
              <strong>Selected:</strong> {formatDate(state.selectedSlot.date)} at {formatTime(state.selectedSlot.time)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
