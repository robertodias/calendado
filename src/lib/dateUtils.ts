import { isValid } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

/**
 * Represents different types of timestamp values that can be converted to Date
 */
export type TimestampValue =
  | Date
  | Timestamp
  | number
  | string
  | null
  | undefined;

/**
 * Configuration options for date conversion
 */
export interface DateConversionOptions {
  /** Fallback date to return if conversion fails */
  fallback?: Date;
  /** Whether to log conversion errors */
  logErrors?: boolean;
  /** Custom error handler */
  onError?: (error: Error, value: unknown) => void;
}

/**
 * Result of a date conversion operation
 */
export interface DateConversionResult {
  /** The converted date, or null if conversion failed */
  date: Date | null;
  /** Whether the conversion was successful */
  success: boolean;
  /** The original value that was converted */
  originalValue: unknown;
  /** Error message if conversion failed */
  error?: string;
}

/**
 * Type guard to check if a value is a Firestore Timestamp
 */
function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as any).toDate === 'function' &&
    'seconds' in value &&
    'nanoseconds' in value
  );
}

/**
 * Type guard to check if a value is a valid Date
 */
function isValidDate(value: unknown): value is Date {
  return value instanceof Date && isValid(value);
}

/**
 * Converts various timestamp formats to a valid Date object
 *
 * @param value - The timestamp value to convert
 * @param options - Configuration options for the conversion
 * @returns DateConversionResult with the converted date and metadata
 *
 * @example
 * ```typescript
 * // Convert Firestore Timestamp
 * const result = convertToDate(firestoreTimestamp);
 * if (result.success) {
 *   console.log('Converted date:', result.date);
 * }
 *
 * // Convert with fallback
 * const result = convertToDate(undefined, { fallback: new Date() });
 * console.log('Date:', result.date); // Will be fallback date
 * ```
 */
export function convertToDate(
  value: TimestampValue,
  options: DateConversionOptions = {}
): DateConversionResult {
  const { fallback = null, logErrors = false, onError } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      date: fallback,
      success: fallback !== null,
      originalValue: value,
      error:
        fallback === null
          ? 'No value provided and no fallback specified'
          : undefined,
    };
  }

  try {
    // Already a valid Date
    if (isValidDate(value)) {
      return {
        date: value,
        success: true,
        originalValue: value,
      };
    }

    // Firestore Timestamp
    if (isFirestoreTimestamp(value)) {
      const date = value.toDate();
      if (isValid(date)) {
        return {
          date,
          success: true,
          originalValue: value,
        };
      }
      throw new Error('Invalid Firestore Timestamp');
    }

    // Number (milliseconds)
    if (typeof value === 'number') {
      const date = new Date(value);
      if (isValid(date)) {
        return {
          date,
          success: true,
          originalValue: value,
        };
      }
      throw new Error('Invalid number timestamp');
    }

    // String
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isValid(date)) {
        return {
          date,
          success: true,
          originalValue: value,
        };
      }
      throw new Error('Invalid string timestamp');
    }

    throw new Error(`Unsupported timestamp type: ${typeof value}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown conversion error';

    if (logErrors) {
      console.warn('Date conversion failed:', errorMessage, 'Value:', value);
    }

    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage), value);
    }

    return {
      date: fallback,
      success: fallback !== null,
      originalValue: value,
      error: errorMessage,
    };
  }
}

/**
 * Convenience function for simple date conversion with fallback
 *
 * @param value - The timestamp value to convert
 * @param fallback - Fallback date if conversion fails
 * @returns The converted date or fallback
 */
export function toDate(
  value: TimestampValue,
  fallback: Date = new Date()
): Date {
  const result = convertToDate(value, { fallback });
  return result.date || new Date();
}

/**
 * Convenience function for safe date conversion that returns null on failure
 *
 * @param value - The timestamp value to convert
 * @returns The converted date or null
 */
export function toDateOrNull(value: TimestampValue): Date | null {
  const result = convertToDate(value);
  return result.date;
}

/**
 * Batch convert multiple timestamp values
 *
 * @param values - Array of timestamp values to convert
 * @param options - Configuration options
 * @returns Array of conversion results
 */
export function convertToDates(
  values: TimestampValue[],
  options: DateConversionOptions = {}
): DateConversionResult[] {
  return values.map(value => convertToDate(value, options));
}

/**
 * Validate that a date conversion was successful
 *
 * @param result - The conversion result to validate
 * @throws Error if conversion was not successful
 */
export function validateDateConversion(
  result: DateConversionResult
): asserts result is DateConversionResult & { date: Date; success: true } {
  if (!result.success || result.date === null) {
    throw new Error(
      `Date conversion failed: ${result.error || 'Unknown error'}`
    );
  }
}
