/**
 * Professional page component
 * Displays professional information and booking interface
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceCard } from '../../components/public/ServiceCard';
import { CalendarPlaceholder } from '../../components/public/CalendarPlaceholder';
import { BookingSummaryModal } from '../../components/public/BookingSummaryModal';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Star, ArrowLeft, Calendar } from 'lucide-react';
import {
  getProfessionalBySlug,
  getBrandBySlug,
  getStoreBySlug,
} from '../../lib/bookingMockData';
import { telemetry } from '../../lib/telemetry';
import type { Professional, Service, Brand, Store } from '../../types/booking';

const ProPage: React.FC = () => {
  const { brandSlug, storeSlug, proSlug } = useParams<{
    brandSlug?: string;
    storeSlug?: string;
    proSlug: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const isSoloPro = !brandSlug || !storeSlug;

  useEffect(() => {
    if (!proSlug) {
      setError('Professional slug is required');
      setLoading(false);
      return;
    }

    loadProfessional();
  }, [proSlug, brandSlug, storeSlug]);

  // Handle URL parameters for preselection
  useEffect(() => {
    const serviceSlug = searchParams.get('service');
    const date = searchParams.get('date');

    if (serviceSlug && professional) {
      const service = professional.services.find(s => s.slug === serviceSlug);
      if (service) {
        setSelectedService(service);
        telemetry.serviceSelected(service.id, service.slug);
      }
    }

    if (date) {
      setSelectedDate(date);
    }
  }, [searchParams, professional]);

  const loadProfessional = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const proData = getProfessionalBySlug(proSlug!);

      if (!proData) {
        setError('Professional not found');
        return;
      }

      setProfessional(proData);

      // Load brand and store if not solo professional
      if (!isSoloPro && brandSlug && storeSlug) {
        const brandData = getBrandBySlug(brandSlug);
        const storeData = getStoreBySlug(brandSlug, storeSlug);

        if (brandData) setBrand(brandData);
        if (storeData) setStore(storeData);
      }

      // Track page view
      telemetry.pageView({
        type: 'professional',
        id: proData.id,
        slug: proData.slug,
        brandId: proData.brandId,
        storeId: proData.storeId,
        professionalId: proData.id,
      });

      // Track professional view
      telemetry.professionalViewed(proData.id, proData.slug);
    } catch (err) {
      console.error('Error loading professional:', err);
      setError('Failed to load professional');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    telemetry.serviceSelected(service.id, service.slug);
  };

  const handleDateSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    telemetry.dateTimeSelected(date, time);
  };

  const handleBookingStart = () => {
    if (selectedService && selectedDate && selectedTime) {
      telemetry.bookingStart({
        serviceId: selectedService.id,
        serviceSlug: selectedService.slug,
        professionalId: professional?.id,
        professionalSlug: professional?.slug,
        selectedDate,
        selectedTime,
      });
      setShowBookingModal(true);
    }
  };

  const handleBookingConfirm = () => {
    // In production, this would integrate with your booking system
    console.log(
      'Booking confirmed! This is a demo - in production, this would complete the booking.'
    );
    setShowBookingModal(false);
  };

  const canBook = selectedService && selectedDate && selectedTime;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading professional...</p>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Professional Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The professional you're looking for doesn't exist.
          </p>
          <Button
            onClick={() =>
              navigate(isSoloPro ? '/' : `/${brandSlug}/${storeSlug}`)
            }
          >
            {isSoloPro ? 'Go Home' : 'Back to Store'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Breadcrumb */}
          {!isSoloPro && brand && store && (
            <nav className='flex items-center space-x-2 text-sm text-gray-500 mb-4'>
              <button
                onClick={() => navigate(`/${brandSlug}`)}
                className='hover:text-gray-700'
              >
                {brand.name}
              </button>
              <span>/</span>
              <button
                onClick={() => navigate(`/${brandSlug}/${storeSlug}`)}
                className='hover:text-gray-700'
              >
                {store.name}
              </button>
              <span>/</span>
              <span className='text-gray-900'>{professional.displayName}</span>
            </nav>
          )}

          {/* Professional Info */}
          <div className='flex items-start space-x-6'>
            {/* Avatar */}
            <div className='flex-shrink-0'>
              {professional.avatarUrl ? (
                <img
                  src={professional.avatarUrl}
                  alt={`${professional.displayName} avatar`}
                  className='w-20 h-20 rounded-full object-cover'
                />
              ) : (
                <div className='w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center'>
                  <User className='w-10 h-10 text-gray-500' />
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center space-x-3 mb-2'>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {professional.displayName}
                </h1>
                {professional.role && (
                  <Badge variant='secondary'>{professional.role}</Badge>
                )}
              </div>

              {professional.bio && (
                <p className='text-gray-600 mb-4 max-w-2xl'>
                  {professional.bio}
                </p>
              )}

              {/* Rating */}
              <div className='flex items-center space-x-4 text-sm text-gray-500'>
                <div className='flex items-center space-x-1'>
                  <Star className='w-4 h-4 text-yellow-400 fill-current' />
                  <span>4.8</span>
                  <span>(24 reviews)</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <Calendar className='w-4 h-4' />
                  <span>{professional.services.length} services</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <Button
              variant='outline'
              onClick={() =>
                navigate(isSoloPro ? '/' : `/${brandSlug}/${storeSlug}`)
              }
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Services Section */}
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Available Services
            </h2>
            <div className='space-y-4'>
              {professional.services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelectService={handleSelectService}
                  isSelected={selectedService?.id === service.id}
                />
              ))}
            </div>
          </div>

          {/* Calendar Section */}
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Select Date & Time
            </h2>
            <CalendarPlaceholder
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate || undefined}
              selectedTime={selectedTime || undefined}
            />
          </div>
        </div>

        {/* Booking Button */}
        {canBook && (
          <div className='mt-8 text-center'>
            <Button
              size='lg'
              onClick={handleBookingStart}
              className='px-8 py-4 text-lg'
            >
              <Calendar className='w-5 h-5 mr-2' />
              Book with {professional.displayName}
            </Button>
          </div>
        )}

        {/* Instructions */}
        {!canBook && (
          <div className='mt-8 text-center'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Ready to Book?
                </h3>
                <p className='text-gray-600 mb-4'>
                  Select a service and choose your preferred date and time to
                  continue.
                </p>
                <div className='flex items-center justify-center space-x-6 text-sm text-gray-500'>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${selectedService ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Select Service</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${selectedDate && selectedTime ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Choose Date & Time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Booking Summary Modal */}
      <BookingSummaryModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookingConfirm}
        service={selectedService || undefined}
        professional={professional}
        selectedDate={selectedDate || undefined}
        selectedTime={selectedTime || undefined}
      />
    </div>
  );
};

export default ProPage;
