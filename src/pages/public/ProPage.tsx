/**
 * Professional page component
 * Displays professional information and booking options
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  MapPin,
  Star,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { resolvePublicContext } from '../../lib/publicResolver';
import {
  storeUrl,
  brandUrl,
  soloProUrl,
  proUrl,
} from '../../lib/buildPublicUrl';
import {
  PublicNotFound,
  PublicDisabled,
  PublicError,
} from '../../components/public/Errors';
import { MismatchBanner } from '../../components/public/Banner';
import type { ResolvedContext } from '../../lib/publicTypes';

// ============================================================================
// PRO PAGE COMPONENT
// ============================================================================

const ProPage: React.FC = () => {
  const { brandSlug, storeSlug, proSlug } = useParams<{
    brandSlug?: string;
    storeSlug?: string;
    proSlug: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [context, setContext] = useState<ResolvedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMismatchBanner, setShowMismatchBanner] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Check if this is a solo professional route
  const isSoloPro = !brandSlug && !storeSlug;

  useEffect(() => {
    if (!proSlug) {
      setError('Professional slug is required');
      setLoading(false);
      return;
    }

    // Get service and date from URL params
    const serviceParam = searchParams.get('service');
    const dateParam = searchParams.get('date');

    if (serviceParam) setSelectedService(serviceParam);
    if (dateParam) setSelectedDate(dateParam);

    loadProContext();
  }, [proSlug, brandSlug, storeSlug, searchParams]);

  const loadProContext = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await resolvePublicContext({
        brand: brandSlug,
        store: storeSlug,
        pro: proSlug,
        soloPro: isSoloPro ? proSlug : undefined,
      });

      if (!result.success) {
        if (result.error === 'disabled') {
          setError('disabled');
        } else if (result.error === 'not_found') {
          setError('not_found');
        } else {
          setError('error');
        }
        return;
      }

      if (result.context) {
        setContext(result.context);

        // Show mismatch banner if there's a corrected context
        if (result.context.isMismatch && result.context.correctedContext) {
          setShowMismatchBanner(true);
        }
      }
    } catch (err) {
      console.error('Error loading professional context:', err);
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMismatchBannerDismiss = () => {
    setShowMismatchBanner(false);
  };

  const handleMismatchBannerAction = () => {
    if (context?.correctedContext) {
      // Navigate to corrected context
      const corrected = context.correctedContext;
      if (corrected.type === 'professional') {
        if (corrected.parent?.brand && corrected.parent?.store) {
          navigate(
            proUrl(
              corrected.parent.brand.slug,
              corrected.parent.store.slug,
              corrected.entity.slug
            )
          );
        } else {
          navigate(soloProUrl(corrected.entity.slug));
        }
      }
    }
    setShowMismatchBanner(false);
  };

  const handleBackClick = () => {
    if (isSoloPro) {
      navigate('/');
    } else if (storeSlug) {
      navigate(storeUrl(brandSlug!, storeSlug));
    } else if (brandSlug) {
      navigate(brandUrl(brandSlug));
    } else {
      navigate('/');
    }
  };

  const handleStoreClick = () => {
    if (context?.parent?.store && context?.parent?.brand) {
      navigate(storeUrl(context.parent.brand.slug, context.parent.store.slug));
    }
  };

  const handleBrandClick = () => {
    if (context?.parent?.brand) {
      navigate(brandUrl(context.parent.brand.slug));
    }
  };

  const handleBookAppointment = () => {
    // In a real implementation, this would open a booking modal or navigate to booking page
    console.log('Booking appointment:', {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
    });
  };

  const mockServices = [
    { id: 'hair-cut', name: 'Hair Cut', duration: '60 min', price: '$50' },
    {
      id: 'hair-color',
      name: 'Hair Color',
      duration: '120 min',
      price: '$120',
    },
    {
      id: 'hair-styling',
      name: 'Hair Styling',
      duration: '90 min',
      price: '$80',
    },
    { id: 'beard-trim', name: 'Beard Trim', duration: '30 min', price: '$25' },
  ];

  const mockAvailability = [
    { date: '2024-01-15', slots: ['09:00', '10:30', '14:00', '15:30'] },
    { date: '2024-01-16', slots: ['09:00', '11:00', '13:30', '16:00'] },
    { date: '2024-01-17', slots: ['10:00', '12:00', '14:30', '17:00'] },
  ];

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-neutral-600'>
            Loading professional information...
          </p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'not_found') {
    return (
      <PublicNotFound
        path={
          isSoloPro ? `/u/${proSlug}` : `/${brandSlug}/${storeSlug}/${proSlug}`
        }
      />
    );
  }

  if (error === 'disabled') {
    return <PublicDisabled entityName={proSlug} entityType='professional' />;
  }

  if (error === 'error') {
    return <PublicError onRetry={loadProContext} />;
  }

  if (!context) {
    return (
      <PublicNotFound
        path={
          isSoloPro ? `/u/${proSlug}` : `/${brandSlug}/${storeSlug}/${proSlug}`
        }
      />
    );
  }

  const { display, parent } = context;

  return (
    <>
      {/* Mismatch Banner */}
      <MismatchBanner
        isVisible={showMismatchBanner}
        onDismiss={handleMismatchBannerDismiss}
        onCorrect={handleMismatchBannerAction}
        originalStore='Previous Location'
        correctStore='Correct Location'
        professionalName={display.name}
      />

      {/* Main Content */}
      <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                {/* Back Button */}
                <button
                  onClick={handleBackClick}
                  className='flex items-center text-neutral-600 hover:text-neutral-900'
                >
                  <ArrowLeft className='h-5 w-5 mr-2' />
                  Back
                </button>

                {/* Professional Avatar */}
                <div className='flex-shrink-0'>
                  <div className='h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center'>
                    <span className='text-primary-600 font-bold text-xl'>
                      {display.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                </div>

                {/* Professional Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <h1 className='text-3xl font-bold text-neutral-900'>
                      {display.name}
                    </h1>
                    <Badge variant='primary' className='text-sm'>
                      Professional
                    </Badge>
                  </div>

                  {/* Breadcrumb */}
                  <div className='flex items-center space-x-2 text-sm text-neutral-600'>
                    {parent?.brand && (
                      <>
                        <button
                          onClick={handleBrandClick}
                          className='hover:text-primary-600'
                        >
                          {parent.brand.slug}
                        </button>
                        <span>/</span>
                      </>
                    )}
                    {parent?.store && (
                      <>
                        <button
                          onClick={handleStoreClick}
                          className='hover:text-primary-600'
                        >
                          {parent.store.slug}
                        </button>
                        <span>/</span>
                      </>
                    )}
                    <span className='text-neutral-900'>{display.name}</span>
                  </div>

                  {display.description && (
                    <p className='mt-2 text-lg text-neutral-600'>
                      {display.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Actions */}
              <div className='flex items-center space-x-3'>
                <Button variant='secondary' size='sm'>
                  <Phone className='h-4 w-4 mr-2' />
                  Call
                </Button>
                <Button variant='primary' size='sm'>
                  <Calendar className='h-4 w-4 mr-2' />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Services */}
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
                  Services
                </h2>

                <div className='space-y-3'>
                  {mockServices.map(service => (
                    <div
                      key={service.id}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedService === service.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div>
                        <h3 className='font-medium text-neutral-900'>
                          {service.name}
                        </h3>
                        <p className='text-sm text-neutral-600'>
                          {service.duration}
                        </p>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <span className='font-semibold text-neutral-900'>
                          {service.price}
                        </span>
                        {selectedService === service.id && (
                          <CheckCircle className='h-5 w-5 text-primary-600' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Availability */}
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
                  Availability
                </h2>

                <div className='space-y-4'>
                  {mockAvailability.map(day => (
                    <div key={day.date}>
                      <h3 className='font-medium text-neutral-900 mb-2'>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {day.slots.map(slot => (
                          <button
                            key={slot}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === slot
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reviews */}
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
                  Reviews
                </h2>

                <div className='space-y-4'>
                  {[
                    {
                      name: 'Sarah Johnson',
                      rating: 5,
                      comment:
                        'Excellent service! Maria is very professional and skilled.',
                      date: '2024-01-10',
                    },
                    {
                      name: 'Mike Chen',
                      rating: 5,
                      comment:
                        'Great haircut and friendly service. Highly recommended!',
                      date: '2024-01-08',
                    },
                    {
                      name: 'Emily Davis',
                      rating: 4,
                      comment: 'Good service overall, would book again.',
                      date: '2024-01-05',
                    },
                  ].map((review, index) => (
                    <div
                      key={index}
                      className='border-b border-neutral-200 pb-4 last:border-b-0'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-2'>
                          <span className='font-medium text-neutral-900'>
                            {review.name}
                          </span>
                          <div className='flex items-center'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400'
                                    : 'text-neutral-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className='text-sm text-neutral-500'>
                          {review.date}
                        </span>
                      </div>
                      <p className='text-neutral-700'>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Professional Stats */}
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                  Professional Stats
                </h3>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Rating</span>
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 text-yellow-400 mr-1' />
                      <span className='font-semibold'>4.9</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Reviews</span>
                    <span className='font-semibold'>127</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Experience</span>
                    <span className='font-semibold'>5 years</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Specialties</span>
                    <span className='font-semibold'>Hair Styling</span>
                  </div>
                </div>
              </Card>

              {/* Booking Summary */}
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                  Booking Summary
                </h3>

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-neutral-600'>Service</span>
                    <span className='font-medium'>
                      {selectedService
                        ? mockServices.find(s => s.id === selectedService)?.name
                        : 'Select service'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-neutral-600'>Date</span>
                    <span className='font-medium'>
                      {selectedDate || 'Select date'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-neutral-600'>Time</span>
                    <span className='font-medium'>
                      {selectedTime || 'Select time'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-neutral-600'>Duration</span>
                    <span className='font-medium'>
                      {selectedService
                        ? mockServices.find(s => s.id === selectedService)
                            ?.duration
                        : 'N/A'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-neutral-600'>Price</span>
                    <span className='font-medium'>
                      {selectedService
                        ? mockServices.find(s => s.id === selectedService)
                            ?.price
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <Button
                  className='w-full mt-4'
                  onClick={handleBookAppointment}
                  disabled={!selectedService || !selectedDate || !selectedTime}
                >
                  Book Appointment
                </Button>
              </Card>

              {/* Contact Info */}
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                  Contact
                </h3>

                <div className='space-y-3'>
                  <div className='flex items-center text-neutral-600'>
                    <Phone className='h-4 w-4 mr-3' />
                    <span>(51) 99999-9999</span>
                  </div>

                  <div className='flex items-center text-neutral-600'>
                    <Mail className='h-4 w-4 mr-3' />
                    <span>maria@glow.com.br</span>
                  </div>

                  <div className='flex items-center text-neutral-600'>
                    <MapPin className='h-4 w-4 mr-3' />
                    <span>Porto Alegre, RS</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProPage;
