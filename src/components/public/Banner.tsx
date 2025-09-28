/**
 * Accessible banner component for public routing
 * Handles mismatch corrections, redirects, and error messages
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { 
  X, 
  AlertCircle, 
  Info, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import type { BannerProps } from '../../lib/publicTypes';

// ============================================================================
// BANNER COMPONENT
// ============================================================================

export const Banner: React.FC<BannerProps> = ({
  type,
  message,
  onDismiss,
  onAction,
  actionText,
  isVisible,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  // Handle visibility
  useEffect(() => {
    if (isVisible && !isDismissed) {
      // Announce to screen readers
      if (announceRef.current) {
        announceRef.current.textContent = message;
      }
      
      // Focus the banner for keyboard users
      if (bannerRef.current) {
        bannerRef.current.focus();
      }
    }
  }, [isVisible, isDismissed, message]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible && !isDismissed) {
        handleDismiss();
      }
    };

    if (isVisible && !isDismissed) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  // Get icon and colors based on type
  const getBannerConfig = () => {
    switch (type) {
      case 'mismatch':
        return {
          icon: <ArrowRight className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
      case 'redirect':
        return {
          icon: <ExternalLink className="w-5 h-5" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-600',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          textColor: 'text-neutral-800',
          iconColor: 'text-neutral-600',
        };
    }
  };

  const config = getBannerConfig();

  return (
    <>
      {/* Screen reader announcement */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Banner */}
      <div
        ref={bannerRef}
        className={`
          fixed top-0 left-0 right-0 z-50
          ${config.bgColor} ${config.borderColor}
          border-b shadow-sm
          transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}
        role="alert"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Content */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                {config.icon}
              </div>
              
              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.textColor}`}>
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              {/* Action Button */}
              {onAction && actionText && (
                <Button
                  onClick={handleAction}
                  size="sm"
                  variant="ghost"
                  className={`${config.textColor} hover:bg-white/20`}
                >
                  {actionText}
                </Button>
              )}
              
              {/* Dismiss Button */}
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className={`${config.textColor} hover:bg-white/20`}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer to prevent content jump */}
      <div className="h-16" />
    </>
  );
};

// ============================================================================
// MISMATCH BANNER
// ============================================================================

interface MismatchBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onCorrect: () => void;
  originalStore: string;
  correctStore: string;
  professionalName: string;
}

export const MismatchBanner: React.FC<MismatchBannerProps> = ({
  isVisible,
  onDismiss,
  onCorrect,
  originalStore: _originalStore,
  correctStore,
  professionalName,
}) => {
  const message = `${professionalName} serves ${correctStore}. We switched you to the correct location.`;

  return (
    <Banner
      type="mismatch"
      message={message}
      onDismiss={onDismiss}
      onAction={onCorrect}
      actionText="View Correct Location"
      isVisible={isVisible}
    />
  );
};

// ============================================================================
// REDIRECT BANNER
// ============================================================================

interface RedirectBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  fromPath: string;
  toPath: string;
  reason?: string;
}

export const RedirectBanner: React.FC<RedirectBannerProps> = ({
  isVisible,
  onDismiss,
  fromPath,
  toPath,
  reason,
}) => {
  const message = reason || `Redirected from ${fromPath} to ${toPath}`;

  return (
    <Banner
      type="redirect"
      message={message}
      onDismiss={onDismiss}
      isVisible={isVisible}
    />
  );
};

// ============================================================================
// ERROR BANNER
// ============================================================================

interface ErrorBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  onRetry?: () => void;
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  isVisible,
  onDismiss,
  onRetry,
  message,
}) => {
  return (
    <Banner
      type="error"
      message={message}
      onDismiss={onDismiss}
      onAction={onRetry}
      actionText="Retry"
      isVisible={isVisible}
    />
  );
};

// ============================================================================
// SUCCESS BANNER
// ============================================================================

interface SuccessBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  message: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  isVisible,
  onDismiss,
  message,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, autoHideDelay, onDismiss]);

  return (
    <Banner
      type="mismatch" // Using mismatch config for success
      message={message}
      onDismiss={onDismiss}
      isVisible={isVisible}
    />
  );
};

// ============================================================================
// LOADING BANNER
// ============================================================================

interface LoadingBannerProps {
  isVisible: boolean;
  message: string;
  onCancel?: () => void;
}

export const LoadingBanner: React.FC<LoadingBannerProps> = ({
  isVisible,
  message,
  onCancel,
}) => {
  return (
    <Banner
      type="mismatch" // Using mismatch config for loading
      message={message}
      onDismiss={onCancel || (() => undefined)}
      actionText={onCancel ? "Cancel" : undefined}
      isVisible={isVisible}
    />
  );
};

// ============================================================================
// BANNER PROVIDER
// ============================================================================

interface BannerProviderProps {
  children: React.ReactNode;
}

export const BannerProvider: React.FC<BannerProviderProps> = ({ children }) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};
