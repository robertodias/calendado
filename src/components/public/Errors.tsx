/**
 * Public error components
 * Handles 404, 410, and generic error states for public routes
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Home, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// ERROR COMPONENT PROPS
// ============================================================================

interface ErrorComponentProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  showSearch?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  className?: string;
}

// ============================================================================
// GENERIC ERROR COMPONENT
// ============================================================================

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title,
  message,
  actionText,
  onAction,
  showSearch = false,
  showHome = true,
  showBack = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real implementation, this would search for brands/pros
      console.log('Searching for:', searchQuery);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4 ${className}`}
    >
      <div className='max-w-md w-full text-center'>
        {/* Error Icon */}
        <div className='mb-6'>
          <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
            <AlertCircle className='w-8 h-8 text-red-600' />
          </div>
        </div>

        {/* Error Content */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-neutral-900 mb-2'>{title}</h1>
          <p className='text-neutral-600 mb-6'>{message}</p>

          {/* Search Form */}
          {showSearch && (
            <form onSubmit={handleSearch} className='mb-6'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400' />
                <Input
                  type='text'
                  placeholder='Search for brands or professionals...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 pr-4 py-3 w-full'
                />
              </div>
            </form>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            {actionText && onAction && (
              <Button onClick={onAction} className='flex-1 sm:flex-none'>
                {actionText}
              </Button>
            )}

            {showBack && (
              <Button
                variant='secondary'
                onClick={handleGoBack}
                className='flex-1 sm:flex-none'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Go Back
              </Button>
            )}

            {showHome && (
              <Button
                variant='ghost'
                onClick={handleGoHome}
                className='flex-1 sm:flex-none'
              >
                <Home className='w-4 h-4 mr-2' />
                Go Home
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className='text-sm text-neutral-500'>
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 404 NOT FOUND COMPONENT
// ============================================================================

interface NotFoundProps {
  path?: string;
  showSearch?: boolean;
  className?: string;
}

export const PublicNotFound: React.FC<NotFoundProps> = ({
  path,
  showSearch = true,
  className,
}) => {
  // const _navigate = useNavigate();

  const handleSearchBrand = () => {
    // In a real implementation, this would show a brand search modal
    console.log('Searching for brands');
  };

  return (
    <ErrorComponent
      title='Page Not Found'
      message={
        path
          ? `The page "${path}" could not be found.`
          : "The page you're looking for doesn't exist."
      }
      actionText='Search Brands'
      onAction={handleSearchBrand}
      showSearch={showSearch}
      showHome={true}
      showBack={true}
      className={className}
    />
  );
};

// ============================================================================
// 410 GONE COMPONENT
// ============================================================================

interface GoneProps {
  entityName?: string;
  entityType?: string;
  className?: string;
}

export const PublicDisabled: React.FC<GoneProps> = ({
  entityName,
  entityType = 'page',
  className,
}) => {
  const _navigate = useNavigate();

  const handleGoToBrand = () => {
    // In a real implementation, this would navigate to the brand home
    _navigate('/');
  };

  return (
    <ErrorComponent
      title='Content No Longer Available'
      message={
        entityName
          ? `The ${entityType} "${entityName}" is no longer available.`
          : `This ${entityType} is no longer available.`
      }
      actionText='Go to Brand Home'
      onAction={handleGoToBrand}
      showSearch={false}
      showHome={true}
      showBack={true}
      className={className}
    />
  );
};

// ============================================================================
// GENERIC ERROR COMPONENT
// ============================================================================

interface GenericErrorProps {
  error?: Error;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const PublicError: React.FC<GenericErrorProps> = ({
  error,
  title = 'Something Went Wrong',
  message,
  onRetry,
  className,
}) => {
  // const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const errorMessage =
    message ||
    error?.message ||
    'An unexpected error occurred. Please try again.';

  return (
    <ErrorComponent
      title={title}
      message={errorMessage}
      actionText='Try Again'
      onAction={handleRetry}
      showSearch={false}
      showHome={true}
      showBack={true}
      className={className}
    />
  );
};

// ============================================================================
// LOADING ERROR COMPONENT
// ============================================================================

interface LoadingErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const PublicLoadingError: React.FC<LoadingErrorProps> = ({
  onRetry,
  className,
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4 ${className}`}
    >
      <div className='max-w-md w-full text-center'>
        {/* Loading Icon */}
        <div className='mb-6'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
            <RefreshCw className='w-8 h-8 text-blue-600 animate-spin' />
          </div>
        </div>

        {/* Loading Content */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-neutral-900 mb-2'>
            Loading...
          </h1>
          <p className='text-neutral-600 mb-6'>
            Please wait while we load the content.
          </p>

          {/* Retry Button */}
          {onRetry && (
            <Button onClick={onRetry} variant='secondary'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NETWORK ERROR COMPONENT
// ============================================================================

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const PublicNetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className,
}) => {
  return (
    <ErrorComponent
      title='Connection Error'
      message='Unable to connect to the server. Please check your internet connection and try again.'
      actionText='Retry'
      onAction={onRetry}
      showSearch={false}
      showHome={true}
      showBack={true}
      className={className}
    />
  );
};

// ============================================================================
// PERMISSION ERROR COMPONENT
// ============================================================================

interface PermissionErrorProps {
  requiredRole?: string;
  className?: string;
}

export const PublicPermissionError: React.FC<PermissionErrorProps> = ({
  requiredRole,
  className,
}) => {
  return (
    <ErrorComponent
      title='Access Denied'
      message={
        requiredRole
          ? `You need ${requiredRole} permissions to access this content.`
          : "You don't have permission to access this content."
      }
      showSearch={false}
      showHome={true}
      showBack={true}
      className={className}
    />
  );
};
