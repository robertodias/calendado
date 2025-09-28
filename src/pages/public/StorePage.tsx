/**
 * Store page component
 * Displays store information and available professionals
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Phone,
  Mail,
  Navigation,
  Filter,
  Search,
} from 'lucide-react';
import { resolvePublicContext } from '../../lib/publicResolver';
import { proUrl, brandUrl, storeUrl } from '../../lib/buildPublicUrl';
import {
  PublicNotFound,
  PublicDisabled,
  PublicError,
} from '../../components/public/Errors';
import { MismatchBanner } from '../../components/public/Banner';
import type { ResolvedContext } from '../../lib/publicTypes';

// ============================================================================
// STORE PAGE COMPONENT
// ============================================================================

const StorePage: React.FC = () => {
  const { brandSlug, storeSlug } = useParams<{
    brandSlug: string;
    storeSlug: string;
  }>();
  const navigate = useNavigate();

  const [context, setContext] = useState<ResolvedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMismatchBanner, setShowMismatchBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');

  useEffect(() => {
    if (!brandSlug || !storeSlug) {
      setError('Brand and store slugs are required');
      setLoading(false);
      return;
    }

    loadStoreContext();
  }, [brandSlug, storeSlug]);

  const loadStoreContext = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await resolvePublicContext({
        brand: brandSlug,
        store: storeSlug,
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
      console.error('Error loading store context:', err);
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
      if (corrected.type === 'store') {
        navigate(
          storeUrl(corrected.parent?.brand?.slug || '', corrected.entity.slug)
        );
      } else if (corrected.type === 'professional') {
        navigate(
          proUrl(
            corrected.parent?.brand?.slug || '',
            corrected.parent?.store?.slug || '',
            corrected.entity.slug
          )
        );
      }
    }
    setShowMismatchBanner(false);
  };

  const handleProClick = (proSlug: string) => {
    navigate(proUrl(brandSlug!, storeSlug!, proSlug));
  };

  const handleBrandClick = () => {
    navigate(brandUrl(brandSlug!));
  };

  const filteredProfessionals = [
    {
      id: 'maria-silva',
      name: 'Maria Silva',
      role: 'Hair Stylist',
      rating: 4.9,
      reviewCount: 127,
      services: ['Hair Cut', 'Hair Color', 'Hair Styling'],
      avatar: 'MS',
      available: true,
    },
    {
      id: 'joao-pereira',
      name: 'João Pereira',
      role: 'Barber',
      rating: 4.8,
      reviewCount: 89,
      services: ['Hair Cut', 'Beard Trim', 'Mustache'],
      avatar: 'JP',
      available: true,
    },
    {
      id: 'ana-lima',
      name: 'Ana Lima',
      role: 'Makeup Artist',
      rating: 4.9,
      reviewCount: 156,
      services: ['Makeup', 'Eyebrow Design', 'Eyelash Extension'],
      avatar: 'AL',
      available: false,
    },
  ].filter(pro => {
    const matchesSearch =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService =
      selectedService === 'all' ||
      pro.services.some(service =>
        service.toLowerCase().includes(selectedService.toLowerCase())
      );
    return matchesSearch && matchesService;
  });

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-neutral-600'>Loading store information...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'not_found') {
    return <PublicNotFound path={`/${brandSlug}/${storeSlug}`} />;
  }

  if (error === 'disabled') {
    return <PublicDisabled entityName={storeSlug} entityType='store' />;
  }

  if (error === 'error') {
    return <PublicError onRetry={loadStoreContext} />;
  }

  if (!context) {
    return <PublicNotFound path={`/${brandSlug}/${storeSlug}`} />;
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
        professionalName='Professional'
      />

      {/* Main Content */}
      <div className='min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                {/* Store Logo */}
                {display.logo && (
                  <div className='flex-shrink-0'>
                    <img
                      src={display.logo}
                      alt={`${display.name} logo`}
                      className='h-16 w-16 rounded-lg object-cover'
                    />
                  </div>
                )}

                {/* Store Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <h1 className='text-3xl font-bold text-neutral-900'>
                      {display.name}
                    </h1>
                    <Badge variant='secondary' className='text-sm'>
                      Store
                    </Badge>
                  </div>

                  {parent?.brand && (
                    <button
                      onClick={handleBrandClick}
                      className='text-primary-600 hover:text-primary-700 text-sm font-medium'
                    >
                      ← Back to {parent.brand.slug}
                    </button>
                  )}

                  {display.description && (
                    <p className='mt-2 text-lg text-neutral-600'>
                      {display.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Store Actions */}
              <div className='flex items-center space-x-3'>
                <Button variant='secondary' size='sm'>
                  <Phone className='h-4 w-4 mr-2' />
                  Call
                </Button>
                <Button variant='secondary' size='sm'>
                  <Navigation className='h-4 w-4 mr-2' />
                  Directions
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Store Details */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
            {/* Store Information */}
            <div className='lg:col-span-2'>
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
                  Store Information
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div className='flex items-start'>
                      <MapPin className='h-5 w-5 text-neutral-400 mr-3 mt-0.5' />
                      <div>
                        <p className='font-medium text-neutral-900'>Address</p>
                        <p className='text-neutral-600'>
                          Rua da Independência, 123
                          <br />
                          Porto Alegre, RS - Brazil
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Clock className='h-5 w-5 text-neutral-400 mr-3 mt-0.5' />
                      <div>
                        <p className='font-medium text-neutral-900'>Hours</p>
                        <p className='text-neutral-600'>
                          Mon-Fri: 9:00-18:00
                          <br />
                          Sat: 9:00-17:00
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-start'>
                      <Phone className='h-5 w-5 text-neutral-400 mr-3 mt-0.5' />
                      <div>
                        <p className='font-medium text-neutral-900'>Phone</p>
                        <p className='text-neutral-600'>(51) 99999-9999</p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Mail className='h-5 w-5 text-neutral-400 mr-3 mt-0.5' />
                      <div>
                        <p className='font-medium text-neutral-900'>Email</p>
                        <p className='text-neutral-600'>
                          porto-alegre@glow.com.br
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Store Stats */}
            <div className='space-y-6'>
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                  Store Stats
                </h3>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Rating</span>
                    <div className='flex items-center'>
                      <Star className='h-4 w-4 text-yellow-400 mr-1' />
                      <span className='font-semibold'>4.8</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Reviews</span>
                    <span className='font-semibold'>342</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Professionals</span>
                    <span className='font-semibold'>3</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-neutral-600'>Established</span>
                    <span className='font-semibold'>2020</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <div className='mb-8'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                  <input
                    type='text'
                    placeholder='Search professionals...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Filter className='h-4 w-4 text-neutral-400' />
                <select
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  className='px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                >
                  <option value='all'>All Services</option>
                  <option value='hair'>Hair Services</option>
                  <option value='makeup'>Makeup</option>
                  <option value='beard'>Beard Services</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professionals */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-neutral-900 mb-6'>
              Our Professionals ({filteredProfessionals.length})
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredProfessionals.map(pro => (
                <Card
                  key={pro.id}
                  className='p-6 hover:shadow-lg transition-shadow cursor-pointer'
                  onClick={() => handleProClick(pro.id)}
                >
                  <div className='flex items-center space-x-4 mb-4'>
                    <div className='flex-shrink-0'>
                      <div className='h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center'>
                        <span className='text-primary-600 font-semibold'>
                          {pro.avatar}
                        </span>
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-neutral-900'>
                        {pro.name}
                      </h3>
                      <p className='text-sm text-neutral-600'>{pro.role}</p>
                    </div>
                    <div className='flex-shrink-0'>
                      {pro.available ? (
                        <Badge variant='success' className='text-xs'>
                          Available
                        </Badge>
                      ) : (
                        <Badge variant='secondary' className='text-xs'>
                          Busy
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center text-sm text-neutral-600'>
                        <Star className='h-4 w-4 mr-1 text-yellow-400' />
                        <span>
                          {pro.rating} ({pro.reviewCount} reviews)
                        </span>
                      </div>
                      <ArrowRight className='h-4 w-4 text-neutral-400' />
                    </div>

                    <div className='flex flex-wrap gap-1'>
                      {pro.services.slice(0, 2).map(service => (
                        <Badge
                          key={service}
                          variant='outline'
                          className='text-xs'
                        >
                          {service}
                        </Badge>
                      ))}
                      {pro.services.length > 2 && (
                        <Badge variant='outline' className='text-xs'>
                          +{pro.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-neutral-900 mb-6'>
              Available Services
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {[
                'Hair Cut',
                'Hair Color',
                'Hair Styling',
                'Beard Trim',
                'Mustache',
                'Makeup',
                'Eyebrow Design',
                'Eyelash Extension',
              ].map(service => (
                <Card
                  key={service}
                  className='p-4 text-center hover:shadow-md transition-shadow'
                >
                  <h3 className='font-medium text-neutral-900'>{service}</h3>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePage;
