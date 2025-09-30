/**
 * Solo booking route component
 * For solo professionals without brand/store context
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { BookingWizardWrapper } from './BookingWizardWrapper';

export const SoloBookingRoute: React.FC = () => {
  const params = useParams<{
    proSlug: string;
  }>();

  const context = {
    brandId: '',
    brandSlug: '',
    storeId: undefined,
    storeSlug: undefined,
    professionalId: params.proSlug,
    professionalSlug: params.proSlug,
  };

  return <BookingWizardWrapper context={context} />;
};

export default SoloBookingRoute;
