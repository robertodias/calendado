import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import {
  transformDocuments,
  extractString,
  extractNullableString,
  extractObject,
  extractDate,
  extractNullableDate,
  extractBoolean,
} from './firestoreUtils';
import type { WaitlistEntry } from '../types/shared';

/**
 * Communication data structure for waitlist entries
 */
export interface WaitlistComms {
  confirmation?: {
    sent: boolean;
    sentAt: Date | null;
  };
}

/**
 * UTM tracking data structure
 */
export interface WaitlistUtm {
  source?: string;
  medium?: string;
  campaign?: string;
}

/**
 * Transforms a Firestore document into a WaitlistEntry
 *
 * @param data - The Firestore document data
 * @param docId - The document ID
 * @returns A properly typed WaitlistEntry
 */
export function transformWaitlistEntry(
  data: DocumentData,
  docId: string
): WaitlistEntry {
  // Extract communication data safely
  const commsData = extractObject<WaitlistComms>(data, 'comms');
  const comms: WaitlistComms = {
    confirmation: commsData.confirmation
      ? {
          sent: extractBoolean(commsData.confirmation, 'sent', false),
          sentAt: extractNullableDate(commsData.confirmation, 'sentAt'),
        }
      : undefined,
  };

  return {
    id: docId,
    email: extractString(data, 'email'),
    name: extractNullableString(data, 'name'),
    source: extractString(data, 'source', 'Unknown'),
    status: extractString(data, 'status', 'pending') as WaitlistEntry['status'],
    createdAt: extractDate(data, 'createdAt'),
    notes: extractNullableString(data, 'notes') || undefined,
    locale: extractString(data, 'locale', 'en'),
    utm: extractObject<WaitlistUtm>(data, 'utm'),
    userAgent: extractNullableString(data, 'userAgent') || undefined,
    ip: extractNullableString(data, 'ip') || undefined,
    comms,
  };
}

/**
 * Transforms multiple Firestore documents into WaitlistEntry array
 *
 * @param docs - Array of Firestore document snapshots
 * @returns Array of properly typed WaitlistEntry objects
 */
export function transformWaitlistEntries(
  docs: QueryDocumentSnapshot<DocumentData>[]
): WaitlistEntry[] {
  return transformDocuments(docs, transformWaitlistEntry, {
    logErrors: true,
    onError: (error, docId, field) => {
      console.error(
        `Failed to transform waitlist entry ${docId} field ${field}:`,
        error.message
      );
    },
  });
}

/**
 * Validates a WaitlistEntry object
 *
 * @param entry - The waitlist entry to validate
 * @returns True if valid, false otherwise
 */
export function validateWaitlistEntry(entry: WaitlistEntry): boolean {
  return (
    typeof entry.id === 'string' &&
    typeof entry.email === 'string' &&
    entry.email.length > 0 &&
    typeof entry.status === 'string' &&
    [
      'pending',
      'confirmed',
      'invited',
      'blocked',
      'rejected',
      'active',
    ].includes(entry.status) &&
    entry.createdAt instanceof Date &&
    !isNaN(entry.createdAt.getTime())
  );
}

/**
 * Filters out invalid waitlist entries
 *
 * @param entries - Array of waitlist entries to filter
 * @returns Array of valid waitlist entries
 */
export function filterValidWaitlistEntries(
  entries: WaitlistEntry[]
): WaitlistEntry[] {
  return entries.filter(validateWaitlistEntry);
}
