/**
 * Store page component
 * Displays store information and available professionals
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ProfessionalCard } from '../../components/public/ProfessionalCard';
import { ServiceCard } from '../../components/public/ServiceCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { MapPin, Phone, Search, ArrowRight, Users } from 'lucide-react';
import { getStoreBySlug, getBrandBySlug } from '../../lib/bookingMockData';
import { telemetry } from '../../lib/telemetry';
import type { Store, Professional, Service, Brand } from '../../types/booking';

const StorePage: React.FC = () => {
  const { brandSlug, storeSlug } = useParams<{
    brandSlug: string;
    storeSlug: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [store, setStore] = useState<Store | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');

  useEffect(() => {
    if (!brandSlug || !storeSlug) {
      setError('Brand and store slugs are required');
      setLoading(false);
      return;
    }

    loadStore();
  }, [brandSlug, storeSlug]);

  const loadStore = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const storeData = getStoreBySlug(brandSlug!, storeSlug!);
      const brandData = getBrandBySlug(brandSlug!);
      
      if (!storeData) {
        setError('Store not found');
        return;
      }

      if (!brandData) {
        setError('Brand not found');
        return;
      }

      setStore(storeData);
      setBrand(brandData);

      // Track page view
      telemetry.pageView({
        type: 'store',
        id: storeData.id,
        slug: storeData.slug,
        brandId: brandData.id,
        storeId: storeData.id,
      });
    } catch (err) {
      console.error('Error loading store:', err);
      setError('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfessional = (professional: Professional) => {
    navigate(`/${brandSlug}/${storeSlug}/${professional.slug}`);
  };

  const handleSelectService = (service: Service) => {
    // For now, just log to console. In production, this would navigate to booking flow
    console.log(`Service "${service.name}" selected. This would start the booking process.`);
  };

  const filteredProfessionals = store?.professionals.filter(pro => {
    const matchesSearch = pro.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pro.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = selectedService === 'all' || 
                          pro.services.some(service => service.slug === selectedService);
    return matchesSearch && matchesService;
  }) || [];

  const filteredServices = store?.services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !store || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/${brandSlug}`)}>
            Back to Brand
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button 
              onClick={() => navigate(`/${brandSlug}`)}
              className="hover:text-gray-700"
            >
              {brand.name}
            </button>
            <span>/</span>
            <span className="text-gray-900">{store.name}</span>
          </nav>

          {/* Store Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              
              {store.address && (
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{store.address}</span>
                </div>
              )}

              {store.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${store.phone}`} className="hover:text-gray-900">
                    {store.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Store Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{store.professionals.length} professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Service Filter */}
            <div className="sm:w-64">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Services</option>
                {store.services?.map((service) => (
                  <option key={service.id} value={service.slug}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Section */}
        {store.services && store.services.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelectService={handleSelectService}
                />
              ))}
            </div>
          </div>
        )}

        {/* Professionals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
            <Badge variant="secondary">
              {filteredProfessionals.length} professional{filteredProfessionals.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {filteredProfessionals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedService !== 'all' 
                    ? 'No professionals found matching your criteria.' 
                    : 'No professionals available at this location.'}
                </p>
                {(searchQuery || selectedService !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedService('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onViewProfessional={handleViewProfessional}
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
            Choose a professional or service to start your booking process.
          </p>
          <Button size="lg">
            Start Booking
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
