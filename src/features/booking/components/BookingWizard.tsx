/**
 * Main booking wizard component
 * Orchestrates the entire booking flow
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { CustomerInfoStep } from './steps/CustomerInfoStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingProgress } from './BookingProgress';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BookingWizardProps {
  context: {
    brandId: string;
    brandSlug: string;
    storeId?: string;
    storeSlug?: string;
    professionalId?: string;
    professionalSlug?: string;
  };
}

const BookingWizardContent: React.FC = () => {
  const { state, dispatch, canProceed, canGoBack } = useBooking();
  const navigate = useNavigate();

  const handleNext = () => {
    if (canProceed) {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      dispatch({ type: 'PREV_STEP' });
    }
  };

  const handleCancel = () => {
    dispatch({ type: 'RESET_BOOKING' });
    navigate(-1);
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <ServiceSelectionStep />;
      case 1:
        return <AvailabilityStep />;
      case 2:
        return <CustomerInfoStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        return <ServiceSelectionStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Appointment
          </h1>
          <p className="text-gray-600">
            Complete the steps below to schedule your appointment
          </p>
        </div>

        {/* Progress Indicator */}
        <BookingProgress />

        {/* Main Content */}
        <Card className="mt-8">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={!canGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            
            {state.currentStep < 3 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingWizard: React.FC<BookingWizardProps> = ({ context }) => {
  const { dispatch } = useBooking();
  const params = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Initialize booking context from props and URL parameters
    const bookingContext = {
      brandId: context.brandId || params.brandSlug || '',
      brandSlug: context.brandSlug || params.brandSlug || '',
      storeId: context.storeId || params.storeSlug,
      storeSlug: context.storeSlug || params.storeSlug,
      professionalId: context.professionalId || params.proSlug || '',
      professionalSlug: context.professionalSlug || params.proSlug || '',
    };

    dispatch({ type: 'SET_CONTEXT', payload: bookingContext });
    
    // Handle URL parameters for preselection
    const serviceSlug = searchParams.get('service');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (serviceSlug) {
      // In a real implementation, you would fetch the service data here
      console.log('Preselected service:', serviceSlug);
    }

    if (date) {
      console.log('Preselected date:', date);
    }

    if (time) {
      console.log('Preselected time:', time);
    }
  }, [context, params, searchParams, dispatch]);

  return <BookingWizardContent />;
};

export default BookingWizard;
