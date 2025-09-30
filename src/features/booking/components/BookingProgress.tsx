/**
 * Booking progress indicator
 * Shows current step and completion status
 */

import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Check } from 'lucide-react';

export const BookingProgress: React.FC = () => {
  const { state } = useBooking();

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between'>
        {state.steps.map((step, index) => (
          <div key={step.id} className='flex items-center'>
            {/* Step Circle */}
            <div className='flex items-center justify-center'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.isCompleted
                    ? 'bg-primary-600 text-white'
                    : step.isActive
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.isCompleted ? <Check className='w-5 h-5' /> : index + 1}
              </div>
            </div>

            {/* Step Info */}
            <div className='ml-3 min-w-0 flex-1'>
              <p
                className={`text-sm font-medium ${
                  step.isActive || step.isCompleted
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </p>
              <p
                className={`text-xs ${
                  step.isActive || step.isCompleted
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}
              >
                {step.description}
              </p>
            </div>

            {/* Connector Line */}
            {index < state.steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step.isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
