import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { toDateOrNull } from './dateUtils';

/**
 * Configuration for Firestore document transformation
 */
export interface TransformOptions {
  /** Whether to log transformation errors */
  logErrors?: boolean;
  /** Custom error handler for transformation errors */
  onError?: (error: Error, docId: string, field: string) => void;
}

/**
 * Safely extracts a string value from Firestore document data
 */
export function extractString(
  data: DocumentData, 
  field: string, 
  defaultValue = ''
): string {
  const value = data[field];
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Safely extracts a nullable string value from Firestore document data
 */
export function extractNullableString(
  data: DocumentData, 
  field: string
): string | null {
  const value = data[field];
  return typeof value === 'string' ? value : null;
}

/**
 * Safely extracts a number value from Firestore document data
 */
export function extractNumber(
  data: DocumentData, 
  field: string, 
  defaultValue = 0
): number {
  const value = data[field];
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

/**
 * Safely extracts a boolean value from Firestore document data
 */
export function extractBoolean(
  data: DocumentData, 
  field: string, 
  defaultValue = false
): boolean {
  const value = data[field];
  return typeof value === 'boolean' ? value : defaultValue;
}

/**
 * Safely extracts an object value from Firestore document data
 */
export function extractObject<T = Record<string, unknown>>(
  data: DocumentData, 
  field: string, 
  defaultValue: T = {} as T
): T {
  const value = data[field];
  return value && typeof value === 'object' && !Array.isArray(value) ? value as T : defaultValue;
}

/**
 * Safely extracts a date value from Firestore document data
 */
export function extractDate(
  data: DocumentData, 
  field: string, 
  fallback: Date = new Date()
): Date {
  return toDateOrNull(data[field]) || fallback;
}

/**
 * Safely extracts a nullable date value from Firestore document data
 */
export function extractNullableDate(
  data: DocumentData, 
  field: string
): Date | null {
  return toDateOrNull(data[field]);
}

/**
 * Safely extracts an array value from Firestore document data
 */
export function extractArray<T = unknown>(
  data: DocumentData, 
  field: string, 
  defaultValue: T[] = []
): T[] {
  const value = data[field];
  return Array.isArray(value) ? value as T[] : defaultValue;
}

/**
 * Safely extracts a value from a nested object path
 */
export function extractNestedValue<T = unknown>(
  data: DocumentData, 
  path: string, 
  defaultValue: T
): T {
  const keys = path.split('.');
  let current: unknown = data;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }
  
  return current as T;
}

/**
 * Generic function to safely transform Firestore documents
 */
export function transformDocument<T>(
  doc: QueryDocumentSnapshot<DocumentData>,
  transformer: (data: DocumentData, docId: string) => T,
  options: TransformOptions = {}
): T | null {
  try {
    return transformer(doc.data(), doc.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown transformation error';
    
    if (options.logErrors) {
      console.error(`Document transformation failed for ${doc.id}:`, errorMessage);
    }
    
    if (options.onError) {
      options.onError(
        error instanceof Error ? error : new Error(errorMessage),
        doc.id,
        'document'
      );
    }
    
    return null;
  }
}

/**
 * Batch transform multiple Firestore documents
 */
export function transformDocuments<T>(
  docs: QueryDocumentSnapshot<DocumentData>[],
  transformer: (data: DocumentData, docId: string) => T,
  options: TransformOptions = {}
): T[] {
  return docs
    .map(doc => transformDocument(doc, transformer, options))
    .filter((item): item is T => item !== null);
}

