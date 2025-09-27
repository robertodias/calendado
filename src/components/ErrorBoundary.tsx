import React, { Component, type ReactNode } from 'react';
import { logError, getErrorDisplayMessage } from '../lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    logError(error, 'ErrorBoundary');
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 text-center mb-2'>
              Oops! Something went wrong
            </h2>
            <p className='text-gray-600 text-center mb-4'>
              {getErrorDisplayMessage(this.state.error)}
            </p>
            <div className='flex justify-center space-x-4'>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
              >
                Try Again
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className='mt-4 p-4 bg-gray-100 rounded-md'>
                <summary className='cursor-pointer font-medium text-gray-700'>
                  Error Details (Development)
                </summary>
                <pre className='mt-2 text-sm text-gray-600 overflow-auto'>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
