import type { 
  Locale, 
  WaitlistStatus, 
  UtmData, 
  ConfirmationComms, 
  WaitlistDoc as SharedWaitlistDoc 
} from '../../../functions/src/types/shared';

// Re-export shared types for convenience
export type { Locale, WaitlistStatus, UtmData, ConfirmationComms };

export type EmailEventType =
  | 'delivered'
  | 'bounced'
  | 'opened'
  | 'clicked'
  | 'complained'
  | 'dropped';

// Frontend-specific WaitlistDoc that extends shared type
export interface WaitlistDoc extends Omit<SharedWaitlistDoc, 'createdAt'> {
  createdAt: unknown; // Firestore server timestamp (Timestamp type)
}
