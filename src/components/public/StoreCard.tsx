/**
 * Store card component
 * Displays store information in a card layout
 */

import React from 'react';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Store } from '../../types/booking';

interface StoreCardProps {
  store: Store;
  onViewStore: (store: Store) => void;
  className?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onViewStore,
  className = '',
}) => {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className='p-6'>
        {/* Store Name */}
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {store.name}
        </h3>

        {/* Store Address */}
        {store.address && (
          <div className='flex items-start space-x-2 mb-3'>
            <MapPin className='w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-gray-600'>{store.address}</p>
          </div>
        )}

        {/* Store Phone */}
        {store.phone && (
          <div className='flex items-center space-x-2 mb-4'>
            <Phone className='w-4 h-4 text-gray-500 flex-shrink-0' />
            <a
              href={`tel:${store.phone}`}
              className='text-sm text-gray-600 hover:text-gray-900'
            >
              {store.phone}
            </a>
          </div>
        )}

        {/* Professionals Count */}
        <div className='mb-4'>
          <span className='text-sm text-gray-500'>
            {store.professionals.length} professional
            {store.professionals.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* View Store Button */}
        <Button
          onClick={() => onViewStore(store)}
          className='w-full'
          variant='outline'
        >
          View Store
          <ArrowRight className='w-4 h-4 ml-2' />
        </Button>
      </CardContent>
    </Card>
  );
};
