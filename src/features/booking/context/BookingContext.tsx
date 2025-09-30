/**
 * Booking context provider
 * Manages the booking wizard state and flow
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { BookingContext, BookingDraft, BookingStep, AvailabilitySlot, CustomerInfo } from '../types';

interface BookingState {
  context: BookingContext | null;
  currentStep: number;
  steps: BookingStep[];
  selectedService: any | null;
  selectedSlot: AvailabilitySlot | null;
  customerInfo: CustomerInfo | null;
  bookingDraft: BookingDraft | null;
  isLoading: boolean;
  error: string | null;
}

type BookingAction =
  | { type: 'SET_CONTEXT'; payload: BookingContext }
  | { type: 'SET_SERVICE'; payload: any }
  | { type: 'SET_SLOT'; payload: AvailabilitySlot }
  | { type: 'SET_CUSTOMER_INFO'; payload: CustomerInfo }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKING_DRAFT'; payload: BookingDraft }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  context: null,
  currentStep: 0,
  steps: [
    {
      id: 'service',
      title: 'Select Service',
      description: 'Choose the service you want to book',
      isCompleted: false,
      isActive: true,
    },
    {
      id: 'availability',
      title: 'Choose Time',
      description: 'Select your preferred date and time',
      isCompleted: false,
      isActive: false,
    },
    {
      id: 'customer',
      title: 'Your Details',
      description: 'Provide your contact information',
      isCompleted: false,
      isActive: false,
    },
    {
      id: 'confirm',
      title: 'Confirm Booking',
      description: 'Review and confirm your appointment',
      isCompleted: false,
      isActive: false,
    },
  ],
  selectedService: null,
  selectedSlot: null,
  customerInfo: null,
  bookingDraft: null,
  isLoading: false,
  error: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_CONTEXT':
      return {
        ...state,
        context: action.payload,
        error: null,
      };

    case 'SET_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
        steps: state.steps.map((step, index) => ({
          ...step,
          isCompleted: index === 0 ? true : step.isCompleted,
          isActive: index === 1,
        })),
        error: null,
      };

    case 'SET_SLOT':
      return {
        ...state,
        selectedSlot: action.payload,
        steps: state.steps.map((step, index) => ({
          ...step,
          isCompleted: index <= 1 ? true : step.isCompleted,
          isActive: index === 2,
        })),
        error: null,
      };

    case 'SET_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: action.payload,
        steps: state.steps.map((step, index) => ({
          ...step,
          isCompleted: index <= 2 ? true : step.isCompleted,
          isActive: index === 3,
        })),
        error: null,
      };

    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.steps.length - 1);
      return {
        ...state,
        currentStep: nextStep,
        steps: state.steps.map((step, index) => ({
          ...step,
          isActive: index === nextStep,
        })),
      };

    case 'PREV_STEP':
      const prevStep = Math.max(state.currentStep - 1, 0);
      return {
        ...state,
        currentStep: prevStep,
        steps: state.steps.map((step, index) => ({
          ...step,
          isActive: index === prevStep,
        })),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: action.payload,
        steps: state.steps.map((step, index) => ({
          ...step,
          isActive: index === action.payload,
        })),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_BOOKING_DRAFT':
      return {
        ...state,
        bookingDraft: action.payload,
      };

    case 'RESET_BOOKING':
      return {
        ...initialState,
        context: state.context, // Keep context on reset
      };

    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  canProceed: boolean;
  canGoBack: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const canProceed = (() => {
    switch (state.currentStep) {
      case 0:
        return !!state.selectedService;
      case 1:
        return !!state.selectedSlot;
      case 2:
        return !!(
          state.customerInfo?.firstName &&
          state.customerInfo?.lastName &&
          state.customerInfo?.email &&
          state.customerInfo?.phone
        );
      case 3:
        return !!state.bookingDraft;
      default:
        return false;
    }
  })();

  const canGoBack = state.currentStep > 0;

  const value: BookingContextType = {
    state,
    dispatch,
    canProceed,
    canGoBack,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
