/**
 * Booking route component
 * Extracts context from URL parameters and renders the booking wizard
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { BookingWizardWrapper } from './BookingWizardWrapper';

export const BookingRoute: React.FC = () => {
  const params = useParams<{
    brandSlug?: string;
    storeSlug?: string;
    proSlug: string;
  }>();

  const context = {
    brandId: params.brandSlug || '',
    brandSlug: params.brandSlug || '',
    storeId: params.storeSlug,
    storeSlug: params.storeSlug,
    professionalId: params.proSlug,
    professionalSlug: params.proSlug,
  };

  return <BookingWizardWrapper context={context} />;
};

export default BookingRoute;
