/**
 * Service card component
 * Displays service information in a card layout
 */

import React from 'react';
import { Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Service } from '../../types/booking';

interface ServiceCardProps {
  service: Service;
  onSelectService: (service: Service) => void;
  isSelected?: boolean;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelectService,
  isSelected = false,
  className = '',
}) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
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

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
      } ${className}`}
      onClick={() => onSelectService(service)}
    >
      <CardContent className='p-4'>
        {/* Service Name */}
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {service.name}
        </h3>

        {/* Service Description */}
        {service.description && (
          <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
            {service.description}
          </p>
        )}

        {/* Service Details */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-4'>
            {/* Duration */}
            <div className='flex items-center space-x-1'>
              <Clock className='w-4 h-4 text-gray-500' />
              <span className='text-sm text-gray-600'>
                {formatDuration(service.durationMin)}
              </span>
            </div>

            {/* Price */}
            <div className='flex items-center space-x-1'>
              <DollarSign className='w-4 h-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-900'>
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Select Button */}
        <Button
          onClick={e => {
            e.stopPropagation();
            onSelectService(service);
          }}
          className='w-full'
          variant={isSelected ? 'primary' : 'secondary'}
        >
          {isSelected ? 'Selected' : 'Select'}
          <ArrowRight className='w-4 h-4 ml-2' />
        </Button>
      </CardContent>
    </Card>
  );
};
