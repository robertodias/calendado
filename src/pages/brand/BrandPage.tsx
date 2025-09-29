/**
 * Brand page component
 * Displays brand information and available stores
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../../components/public/BrandHeader';
import { StoreCard } from '../../components/public/StoreCard';
import { ServiceCard } from '../../components/public/ServiceCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, ArrowRight } from 'lucide-react';
import { getBrandBySlug } from '../../lib/bookingMockData';
import { telemetry } from '../../lib/telemetry';
import type { Brand, Store, Service } from '../../types/booking';

const BrandPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandSlug) {
      setError('Brand slug is required');
      setLoading(false);
      return;
    }

    loadBrand();
  }, [brandSlug]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const brandData = getBrandBySlug(brandSlug!);
      
      if (!brandData) {
        setError('Brand not found');
        return;
      }

      setBrand(brandData);

      // Track page view
      telemetry.pageView({
        type: 'brand',
        id: brandData.id,
        slug: brandData.slug,
        brandId: brandData.id,
      });
    } catch (err) {
      console.error('Error loading brand:', err);
      setError('Failed to load brand');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStore = (store: Store) => {
    navigate(`/${brandSlug}/${store.slug}`);
  };

  const handleSelectService = (service: Service) => {
    // For now, just log to console. In production, this would navigate to booking flow
    console.log(`Service "${service.name}" selected. This would start the booking process.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
          <p className="text-gray-600 mb-6">The brand you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Get stores for this brand
  const brandStores = brand.id === 'brand-glow' ? [
    {
      id: 'store-porto-alegre',
      slug: 'porto-alegre',
      brandId: 'brand-glow',
      name: 'Glow Porto Alegre',
      address: 'Rua da Praia, 123 - Centro, Porto Alegre - RS',
      phone: '+55 51 99999-9999',
      professionals: [],
      services: [],
    },
    {
      id: 'store-centro',
      slug: 'centro',
      brandId: 'brand-glow',
      name: 'Glow Centro',
      address: 'Av. Independência, 456 - Centro, Porto Alegre - RS',
      phone: '+55 51 88888-8888',
      professionals: [],
      services: [],
    },
    {
      id: 'store-zona-sul',
      slug: 'zona-sul',
      brandId: 'brand-glow',
      name: 'Glow Zona Sul',
      address: 'Rua Ipiranga, 789 - Zona Sul, Porto Alegre - RS',
      phone: '+55 51 77777-7777',
      professionals: [],
      services: [],
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BrandHeader brand={brand} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Services */}
        {brand.featuredServices && brand.featuredServices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brand.featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelectService={handleSelectService}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stores Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Locations</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{brandStores.length} location{brandStores.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {brandStores.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No locations available at the moment.</p>
                <Button variant="outline">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onViewStore={handleViewStore}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Book?
          </h3>
          <p className="text-gray-600 mb-6">
            Select a store to continue with your booking and choose from our available professionals.
          </p>
          <Button size="lg">
            Select a Store
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
