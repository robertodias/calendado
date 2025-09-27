/**
 * Waitlist success message component
 *
 * Displays confirmation message after successful signup
 */

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

interface WaitlistSuccessProps {
  onReset: () => void;
}

const WaitlistSuccess: React.FC<WaitlistSuccessProps> = ({ onReset }) => {
  const { t } = useLanguage();

  return (
    <div className='text-center space-y-6'>
      <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
        <svg
          className='w-8 h-8 text-green-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 13l4 4L19 7'
          />
        </svg>
      </div>

      <div className='space-y-2'>
        <h3 className='text-2xl font-bold text-gray-900'>
          {t('success.title')}
        </h3>
        <p className='text-gray-600'>{t('success.message')}</p>
      </div>

      <div className='space-y-4'>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h4 className='font-semibold text-blue-900 mb-2'>
            {t('success.whatsNext.title')}
          </h4>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>• {t('success.whatsNext.item1')}</li>
            <li>• {t('success.whatsNext.item2')}</li>
            <li>• {t('success.whatsNext.item3')}</li>
          </ul>
        </div>

        <Button variant='outline' onClick={onReset} className='w-full'>
          {t('success.joinAgain')}
        </Button>
      </div>
    </div>
  );
};

export default WaitlistSuccess;
