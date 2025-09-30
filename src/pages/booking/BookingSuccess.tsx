/**
 * Booking success page
 * Shown after successful booking confirmation
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, MapPin, Download, ArrowLeft } from 'lucide-react';

interface BookingSuccessData {
  bookingId: string;
  confirmationCode: string;
  serviceName: string;
  professionalName: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  location?: string;
  icsFileUrl: string;
}

export const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // In a real implementation, this data would come from the location state or be fetched
  const bookingData: BookingSuccessData = location.state?.bookingData || {
    bookingId: 'demo-booking-123',
    confirmationCode: 'ABC123',
    serviceName: 'Haircut & Styling',
    professionalName: 'Maria Silva',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00',
    duration: 60,
    location: 'Glow Beauty Studio - Porto Alegre',
    icsFileUrl: '/api/bookings/demo-booking-123/ics',
  };

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

  const handleDownloadICS = () => {
    // In a real implementation, this would trigger the ICS file download
    window.open(bookingData.icsFileUrl, '_blank');
  };

  const handleBookAnother = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your appointment has been successfully scheduled
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-3">
            Confirmation Code: {bookingData.confirmationCode}
          </Badge>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Appointment Details */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(bookingData.appointmentDate)}
                    </p>
                    <p className="text-gray-600">
                      {formatTime(bookingData.appointmentTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.serviceName}
                    </p>
                    <p className="text-gray-600">
                      {formatDuration(bookingData.duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <User className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.professionalName}
                    </p>
                    <p className="text-gray-600">Professional</p>
                  </div>
                </div>

                {bookingData.location && (
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">{bookingData.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <User className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.customerName}
                    </p>
                    <p className="text-gray-600">Customer</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.customerEmail}
                    </p>
                    <p className="text-gray-600">Email</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">Provided during booking</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Confirmation Email</h3>
                <p className="text-sm text-gray-600">
                  Check your email for a detailed confirmation with all the details.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add to Calendar</h3>
                <p className="text-sm text-gray-600">
                  Download the calendar file to add this appointment to your calendar.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reminder</h3>
                <p className="text-sm text-gray-600">
                  You'll receive a reminder 15 minutes before your appointment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoBack}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>

          <Button
            onClick={handleDownloadICS}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Add to Calendar</span>
          </Button>

          <Button
            onClick={handleBookAnother}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Another Appointment</span>
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need to make changes to your appointment?
          </p>
          <p className="text-sm text-gray-500">
            Contact us at{' '}
            <a href="mailto:support@calendado.com" className="text-primary-600 hover:text-primary-700">
              support@calendado.com
            </a>{' '}
            or call{' '}
            <a href="tel:+1234567890" className="text-primary-600 hover:text-primary-700">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
