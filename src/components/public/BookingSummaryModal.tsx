/**
 * Booking summary modal component
 * Shows booking details and confirmation
 */

import React from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { Service, Professional } from '../../types/booking';

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service?: Service;
  professional?: Professional;
  selectedDate?: string;
  selectedTime?: string;
  className?: string;
}

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  service,
  professional,
  selectedDate,
  selectedTime,
  className = '',
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minutes` : `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Summary</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-6">
            {/* Service */}
            {service && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDuration(service.durationMin)} • {formatPrice(service.price)}
                  </p>
                </div>
              </div>
            )}

            {/* Professional */}
            {professional && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{professional.displayName}</p>
                  {professional.role && (
                    <p className="text-sm text-gray-500">{professional.role}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date & Time */}
            {selectedDate && selectedTime && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedDate)}
                  </p>
                  <p className="text-sm text-gray-500">at {selectedTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Total Price */}
          {service && (
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            This is a demo booking. In production, this would integrate with your booking system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
