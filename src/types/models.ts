export type Locale = 'en-US' | 'pt-BR' | 'it-IT';

export type WaitlistStatus = 'pending' | 'confirmed' | 'invited' | 'blocked';

export type EmailEventType = 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'dropped';

export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface ConfirmationComms {
  sent: boolean;
  sentAt: any | null; // Firestore server timestamp (Timestamp type)
  messageId: string | null;
  error: {
    code: string;
    msg: string;
  } | null;
}

export interface WaitlistDoc {
  email: string; // required, normalized lowercase
  name: string | null; // optional
  locale: Locale | null;
  utm: UtmData | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: any; // Firestore server timestamp (Timestamp type)
  status: WaitlistStatus;
  comms: {
    confirmation: ConfirmationComms;
  };
  dedupeKey: string; // sha256(lower(email))
}
