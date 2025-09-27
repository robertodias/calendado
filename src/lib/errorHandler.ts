/**
 * Unified error handling for frontend
 *
 * Provides consistent error handling patterns across the application
 */

export const ErrorCode = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_INPUT: 'INVALID_INPUT',

  // Business logic errors
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  WAITLIST_FULL: 'WAITLIST_FULL',
  CAPTCHA_FAILED: 'CAPTCHA_FAILED',

  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface AppErrorData {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
  originalError?: Error;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly originalError?: Error;

  constructor(error: AppErrorData) {
    super(error.message);
    this.name = 'AppError';
    this.code = error.code;
    this.details = error.details;
    this.retryable = error.retryable ?? false;
    this.originalError = error.originalError;
  }
}

// Error creators
export const createNetworkError = (
  message: string,
  originalError?: Error
): AppError =>
  new AppError({
    code: ErrorCode.NETWORK_ERROR,
    message,
    retryable: true,
    originalError,
  });

export const createValidationError = (
  message: string,
  details?: Record<string, unknown>
): AppError =>
  new AppError({
    code: ErrorCode.VALIDATION_ERROR,
    message,
    details,
    retryable: false,
  });

export const createAuthError = (
  message: string,
  code: ErrorCode = ErrorCode.UNAUTHORIZED
): AppError =>
  new AppError({
    code,
    message,
    retryable: false,
  });

export const createBusinessError = (
  message: string,
  code: ErrorCode,
  retryable = false
): AppError =>
  new AppError({
    code,
    message,
    retryable,
  });

export const createSystemError = (
  message: string,
  originalError?: Error
): AppError =>
  new AppError({
    code: ErrorCode.UNKNOWN_ERROR,
    message,
    retryable: true,
    originalError,
  });

// Error handler for async operations
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    console.error('Async operation failed:', error);
    return fallback;
  }
}

// Error handler for promises with retry logic
export async function handleWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Only retry if error is retryable
      if (error instanceof AppError && !error.retryable) {
        break;
      }

      // Wait before retry
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

// Error boundary helper
export function getErrorDisplayMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// Error logging helper
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    message: getErrorDisplayMessage(error),
    code: error instanceof AppError ? error.code : 'UNKNOWN',
    context,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
  };

  console.error('Application error:', errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

// Error recovery helpers
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable;
  }

  // Network errors are generally retryable
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('fetch')
    );
  }

  return false;
}

export function shouldShowErrorToUser(error: unknown): boolean {
  if (error instanceof AppError) {
    // Don't show system errors to users
    return (
      error.code !== ErrorCode.UNKNOWN_ERROR &&
      error.code !== ErrorCode.SERVICE_UNAVAILABLE
    );
  }

  return true;
}

// Error reporting for analytics
export function reportError(error: unknown, context?: string): void {
  const errorData = {
    code: error instanceof AppError ? error.code : ErrorCode.UNKNOWN_ERROR,
    message: getErrorDisplayMessage(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Send to analytics service
  console.log('Error reported:', errorData);
}
