/**
 * Booking confirmation step
 * Shows booking summary and handles final confirmation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { bookingService } from '../../services/bookingService';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle, Download } from 'lucide-react';

export const ConfirmationStep: React.FC = () => {
  const { state, dispatch } = useBooking();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleConfirmBooking = async () => {
    if (!state.selectedService || !state.selectedSlot || !state.customerInfo) {
      return;
    }

    try {
      setIsConfirming(true);
      dispatch({ type: 'SET_LOADING', payload: true });

      // Create booking draft
      const bookingDraft = await bookingService.createBookingDraft({
        context: state.context!,
        serviceId: state.selectedService.id,
        serviceName: state.selectedService.name,
        serviceDuration: state.selectedService.durationMin,
        servicePrice: state.selectedService.price,
        selectedSlot: state.selectedSlot,
        customer: state.customerInfo,
        status: 'draft',
      });

      dispatch({ type: 'SET_BOOKING_DRAFT', payload: bookingDraft });

      // Confirm booking
      const confirmation = await bookingService.confirmBooking(bookingDraft.id);
      setConfirmationCode(confirmation.confirmationCode);

      // Send confirmation email
      await bookingService.sendConfirmationEmail(confirmation);

      // Navigate to success page with booking data
      navigate('/booking/success', {
        state: {
          bookingData: {
            bookingId: bookingDraft.id,
            confirmationCode: confirmation.confirmationCode,
            serviceName: state.selectedService!.name,
            professionalName: 'Professional Name', // Would come from context
            customerName: `${state.customerInfo!.firstName} ${state.customerInfo!.lastName}`,
            customerEmail: state.customerInfo!.email,
            appointmentDate: state.selectedSlot!.date,
            appointmentTime: state.selectedSlot!.time,
            duration: state.selectedService!.durationMin,
            location: 'Store Location', // Would come from context
            icsFileUrl: confirmation.icsFileUrl,
          }
        }
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to confirm booking. Please try again.' });
    } finally {
      setIsConfirming(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDownloadICS = async () => {
    if (!state.bookingDraft) return;

    try {
      const icsUrl = await bookingService.generateICSFile(state.bookingDraft);
      // In a real implementation, this would trigger a download
      console.log('Downloading ICS file:', icsUrl);
      // For now, just show an alert
      alert('ICS file download would start here');
    } catch (error) {
      console.error('Error downloading ICS file:', error);
    }
  };

  // Removed isConfirmed check since we now navigate to success page
  if (false) { // eslint-disable-line no-constant-condition
    return (
      <div className="text-center">
        <div className="mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-4">
            Your appointment has been successfully booked
          </p>
          {confirmationCode && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Confirmation Code: {confirmationCode}
            </Badge>
          )}
        </div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">
                  {formatDate(state.selectedSlot!.date)} at {formatTime(state.selectedSlot!.time)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">
                  {state.selectedService!.name} • {formatDuration(state.selectedService!.durationMin)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">
                  {state.customerInfo!.firstName} {state.customerInfo!.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{state.customerInfo!.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{state.customerInfo!.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadICS}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Add to Calendar</span>
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2"
          >
            <span>Book Another Appointment</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirm Your Booking
        </h2>
        <p className="text-gray-600">
          Please review your appointment details before confirming
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Service Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{state.selectedService?.name}</h4>
                <p className="text-sm text-gray-600">
                  {formatDuration(state.selectedService?.durationMin || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(state.selectedService?.price || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">
                  {formatDate(state.selectedSlot?.date || '')} at {formatTime(state.selectedSlot?.time || '')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">Store Location</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">
                  {state.customerInfo?.firstName} {state.customerInfo?.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{state.customerInfo?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{state.customerInfo?.phone}</span>
              </div>
              {state.customerInfo?.notes && (
                <div className="pt-2">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {state.customerInfo.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Button */}
        <div className="text-center">
          <Button
            onClick={handleConfirmBooking}
            disabled={isConfirming}
            className="px-8 py-3"
            size="lg"
          >
            {isConfirming ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};
