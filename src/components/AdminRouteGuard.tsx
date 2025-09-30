import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/auth';
import LoadingSpinner from './LoadingSpinner';
import { auth } from '../firebase';
import { logger } from '../lib/logger';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  requiredRoles = ['admin', 'superadmin', 'support'],
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <AdminSignIn />;
  }

  if (!user.hasRole(requiredRoles)) {
    return (
      <NotAuthorized userRoles={user.roles} requiredRoles={requiredRoles} />
    );
  }

  return <>{children}</>;
};

const AdminSignIn: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirebaseConfigured = auth !== null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed';
      logger.error('Sign in failed', error as Error, {
        component: 'AdminRouteGuard',
      });
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Admin Console
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Sign in to access the admin dashboard
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-yellow-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-yellow-800'>
                  Firebase Not Configured
                </h3>
                <div className='mt-2 text-sm text-yellow-700'>
                  <p>
                    Firebase authentication is not set up. Please configure
                    your Firebase credentials to enable sign-in.
                  </p>
                  <p className='mt-2 font-mono text-xs'>
                    See ENVIRONMENT_VARIABLES.md for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  Sign In Failed
                </h3>
                <p className='mt-2 text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className='mt-8'>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn || !isFirebaseConfigured}
            className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSigningIn ? (
              <LoadingSpinner size='sm' />
            ) : (
              <>
                <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                  <path
                    fill='currentColor'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='currentColor'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='currentColor'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='currentColor'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotAuthorizedProps {
  userRoles: UserRole[];
  requiredRoles: UserRole[];
}

const NotAuthorized: React.FC<NotAuthorizedProps> = ({
  userRoles,
  requiredRoles,
}) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full text-center space-y-4'>
        <div className='text-red-500'>
          <svg
            className='mx-auto h-16 w-16'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'
            />
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-gray-900'>Not Authorized</h2>
        <div className='text-gray-600 space-y-2'>
          <p>You don't have permission to access this admin console.</p>
          <div className='text-sm'>
            <p>
              Your roles:{' '}
              <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
                {userRoles.join(', ') || 'none'}
              </span>
            </p>
            <p>
              Required roles:{' '}
              <span className='font-mono bg-gray-100 px-2 py-1 rounded'>
                {requiredRoles.join(', ')}
              </span>
            </p>
          </div>
        </div>
        <p className='text-sm text-gray-500'>
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default AdminRouteGuard;
