/**
 * Booking wizard wrapper with provider
 * Wraps the booking wizard with the necessary context provider
 */

import React from 'react';
import { BookingProvider } from '../context/BookingContext';
import BookingWizard from './BookingWizard';

interface BookingWizardWrapperProps {
  context: {
    brandId: string;
    brandSlug: string;
    storeId?: string;
    storeSlug?: string;
    professionalId?: string;
    professionalSlug?: string;
  };
}

export const BookingWizardWrapper: React.FC<BookingWizardWrapperProps> = ({
  context,
}) => {
  return (
    <BookingProvider>
      <BookingWizard context={context} />
    </BookingProvider>
  );
};

export default BookingWizardWrapper;
