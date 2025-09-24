// import { Response } from 'firebase-functions/v1/https';
import { setSecurityHeaders } from './security';

export enum ErrorCode {
  // Validation errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_NAME = 'INVALID_NAME',
  INVALID_LOCALE = 'INVALID_LOCALE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // External service errors
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT'
}

export interface AppErrorData {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode: number;
  retryable: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly details?: any;

  constructor(error: AppErrorData) {
    super(error.message);
    this.name = 'AppError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.retryable = error.retryable;
    this.details = error.details;
  }
}

// Predefined error creators
export const createValidationError = (field: string, message: string): AppError => new AppError({
  code: ErrorCode.INVALID_EMAIL,
  message: `Validation error for ${field}: ${message}`,
  statusCode: 400,
  retryable: false
});

export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => new AppError({
  code: ErrorCode.UNAUTHORIZED,
  message,
  statusCode: 401,
  retryable: false
});

export const createForbiddenError = (message: string = 'Forbidden'): AppError => new AppError({
  code: ErrorCode.FORBIDDEN,
  message,
  statusCode: 403,
  retryable: false
});

export const createRateLimitError = (retryAfter: number): AppError => new AppError({
  code: ErrorCode.RATE_LIMIT_EXCEEDED,
  message: 'Rate limit exceeded',
  statusCode: 429,
  retryable: true,
  details: { retryAfter }
});

export const createEmailServiceError = (message: string, retryable: boolean = true): AppError => new AppError({
  code: ErrorCode.EMAIL_SERVICE_ERROR,
  message: `Email service error: ${message}`,
  statusCode: 502,
  retryable
});

export const createDatabaseError = (message: string, retryable: boolean = true): AppError => new AppError({
  code: ErrorCode.DATABASE_ERROR,
  message: `Database error: ${message}`,
  statusCode: 500,
  retryable
});

export const createInternalError = (message: string = 'Internal server error'): AppError => new AppError({
  code: ErrorCode.INTERNAL_ERROR,
  message,
  statusCode: 500,
  retryable: false
});

// Error response handler
export function handleError(res: any, error: unknown): void {
  setSecurityHeaders(res);
  
  let appError: AppError;
  
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = createInternalError(error.message);
  } else {
    appError = createInternalError('Unknown error occurred');
  }
  
  const response: any = {
    error: appError.message,
    code: appError.code,
    timestamp: new Date().toISOString()
  };
  
  if (appError.details) {
    response.details = appError.details;
  }
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = error instanceof Error ? error.stack : undefined;
  }
  
  res.status(appError.statusCode).json(response);
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Convert unknown errors to AppError
      throw createInternalError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

// Validation helpers
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw createValidationError(fieldName, 'is required');
  }
}

export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw createValidationError('email', 'must be a valid string');
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email) || email.length > 254) {
    throw createValidationError('email', 'must be a valid email address');
  }
}

export function validateName(name: string | null): void {
  if (name !== null && (typeof name !== 'string' || name.length > 100)) {
    throw createValidationError('name', 'must be a string with max 100 characters');
  }
}

export function validateLocale(locale: string | null): void {
  if (locale !== null && !['en-US', 'pt-BR', 'it-IT'].includes(locale)) {
    throw createValidationError('locale', 'must be a supported locale');
  }
}
