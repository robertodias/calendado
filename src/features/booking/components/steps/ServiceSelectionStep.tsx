/**
 * Service selection step
 * Allows users to select a service for booking
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Clock, DollarSign, Star } from 'lucide-react';
import { getProfessionalBySlug } from '../../../../lib/bookingMockData';

export const ServiceSelectionStep: React.FC = () => {
  const { state, dispatch } = useBooking();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  // Handle preselected service from URL
  useEffect(() => {
    const preselectedServiceSlug = searchParams.get('service');
    if (preselectedServiceSlug && services.length > 0) {
      const preselectedService = services.find(service => service.slug === preselectedServiceSlug);
      if (preselectedService) {
        dispatch({ type: 'SET_SERVICE', payload: preselectedService });
      }
    }
  }, [services, searchParams, dispatch]);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get services from professional or store
      if (state.context?.professionalId) {
        const professional = getProfessionalBySlug(state.context.professionalSlug || '');
        if (professional) {
          setServices(professional.services);
        } else {
          // Fallback to mock services if professional not found
          setServices([
            {
              id: 'haircut',
              slug: 'haircut',
              name: 'Haircut & Styling',
              durationMin: 60,
              price: 50,
              description: 'Professional haircut and styling service',
            },
            {
              id: 'color',
              slug: 'color',
              name: 'Hair Coloring',
              durationMin: 120,
              price: 120,
              description: 'Full hair coloring service with consultation',
            },
            {
              id: 'highlights',
              slug: 'highlights',
              name: 'Highlights',
              durationMin: 90,
              price: 100,
              description: 'Professional highlights application',
            },
          ]);
        }
      } else {
        // If no specific professional, show all available services
        // This would typically come from the store or brand
        setServices([
          {
            id: 'haircut',
            slug: 'haircut',
            name: 'Haircut & Styling',
            durationMin: 60,
            price: 50,
            description: 'Professional haircut and styling service',
          },
          {
            id: 'color',
            slug: 'color',
            name: 'Hair Coloring',
            durationMin: 120,
            price: 120,
            description: 'Full hair coloring service with consultation',
          },
          {
            id: 'highlights',
            slug: 'highlights',
            name: 'Highlights',
            durationMin: 90,
            price: 100,
            description: 'Professional highlights application',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: any) => {
    dispatch({ type: 'SET_SERVICE', payload: service });
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading services...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Service
        </h2>
        <p className="text-gray-600">
          Choose the service you'd like to book
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No services available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 ${
                state.selectedService?.id === service.id
                  ? 'ring-2 ring-primary-500 bg-primary-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleSelectService(service)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  {state.selectedService?.id === service.id && (
                    <Badge variant="secondary">Selected</Badge>
                  )}
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDuration(service.durationMin)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state.selectedService && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-green-600" />
            <p className="text-green-800">
              <strong>{state.selectedService.name}</strong> selected - {formatDuration(state.selectedService.durationMin)} • {formatPrice(state.selectedService.price)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
