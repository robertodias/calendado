import type { Timestamp } from 'firebase-admin/firestore';

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type Locale = 'en-US' | 'pt-BR' | 'it-IT';
export type UserRole = 'superadmin' | 'admin' | 'support' | 'editor' | 'viewer';
export type WaitlistStatus = 'pending' | 'confirmed' | 'invited' | 'blocked';
export type InviteStatus = 'pending' | 'used' | 'expired' | 'cancelled';
export type PublicLinkType = 'store' | 'professional' | 'booking' | 'waitlist';
export type PublicLinkStatus = 'active' | 'inactive' | 'expired';
export type OrgStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type ProfessionalStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type StoreStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type EmailEventType = 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'dropped';

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface ConfirmationComms {
  sent: boolean;
  sentAt: Timestamp | null;
  messageId: string | null;
  error: {
    code: string;
    msg: string;
  } | null;
}

// ============================================================================
// WAITLIST COLLECTION
// ============================================================================

export interface WaitlistDoc {
  id: string; // document ID
  email: string; // required, normalized lowercase
  name: string | null; // optional
  locale: Locale | null;
  utm: UtmData | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: Timestamp; // server timestamp
  status: WaitlistStatus;
  comms: {
    confirmation: ConfirmationComms;
  };
  dedupeKey: string; // sha256(lower(email))
  captchaVerified: boolean; // reCAPTCHA verification status
  captchaToken: string | null; // reCAPTCHA token for validation
  invitedAt?: Timestamp; // when user was invited
  invitedBy?: string; // user ID who sent the invite
  notes?: string; // admin notes
}

// ============================================================================
// INVITES COLLECTION
// ============================================================================

export interface InviteDoc {
  id: string; // document ID
  email: string; // required, normalized lowercase
  code: string; // unique invite code
  status: InviteStatus;
  createdAt: Timestamp; // server timestamp
  expiresAt: Timestamp; // when invite expires
  usedAt?: Timestamp; // when invite was used
  usedBy?: string; // user ID who used the invite
  createdBy: string; // user ID who created the invite
  orgId?: string; // optional org context
  storeId?: string; // optional store context
  professionalId?: string; // optional professional context
  message?: string; // optional personal message
  metadata?: Record<string, unknown>; // additional data
}

// ============================================================================
// AUDIT LOGS COLLECTION
// ============================================================================

export interface AuditLogDoc {
  id: string; // document ID
  timestamp: Timestamp; // server timestamp
  actorUid: string; // user who performed the action
  actorEmail?: string; // email of the actor
  action: string; // action performed
  resource: string; // resource affected
  targetUid?: string; // target user ID
  targetEmail?: string; // target user email
  before?: Record<string, unknown>; // state before change
  after?: Record<string, unknown>; // state after change
  metadata?: Record<string, unknown>; // additional context
  ip?: string; // IP address
  userAgent?: string; // user agent string
}

// ============================================================================
// ORGANIZATIONS COLLECTION
// ============================================================================

export interface OrgDoc {
  id: string; // document ID
  name: string; // organization name
  slug: string; // URL-friendly identifier
  description?: string; // organization description
  status: OrgStatus;
  createdAt: Timestamp; // server timestamp
  updatedAt: Timestamp; // server timestamp
  createdBy: string; // user ID who created the org
  updatedBy: string; // user ID who last updated
  contact: ContactInfo;
  address?: Address;
  settings: {
    timezone: string; // default timezone
    currency: string; // default currency
    language: Locale; // default language
    branding?: {
      logo?: string; // logo URL
      primaryColor?: string; // hex color
      secondaryColor?: string; // hex color
    };
    features: {
      waitlist: boolean;
      booking: boolean;
      payments: boolean;
      analytics: boolean;
    };
  };
  metadata?: Record<string, unknown>; // additional data
}

// ============================================================================
// STORES COLLECTION (subcollection of orgs)
// ============================================================================

export interface StoreDoc {
  id: string; // document ID
  orgId: string; // parent organization ID
  name: string; // store name
  slug: string; // URL-friendly identifier (unique within org)
  description?: string; // store description
  status: StoreStatus;
  createdAt: Timestamp; // server timestamp
  updatedAt: Timestamp; // server timestamp
  createdBy: string; // user ID who created the store
  updatedBy: string; // user ID who last updated
  contact: ContactInfo;
  address?: Address;
  settings: {
    timezone: string; // store timezone
    currency: string; // store currency
    language: Locale; // store language
    operatingHours: {
      [key: string]: { // day of week (monday, tuesday, etc.)
        open: string; // HH:MM format
        close: string; // HH:MM format
        closed?: boolean; // if store is closed this day
      };
    };
    services: string[]; // list of services offered
    capacity?: number; // max capacity
    bookingSettings: {
      advanceBookingDays: number; // how many days in advance
      minBookingHours: number; // minimum hours before booking
      maxBookingHours: number; // maximum hours before booking
      slotDuration: number; // slot duration in minutes
    };
  };
  metadata?: Record<string, unknown>; // additional data
}

// ============================================================================
// PROFESSIONALS COLLECTION (subcollection of orgs)
// ============================================================================

export interface ProfessionalDoc {
  id: string; // document ID
  orgId: string; // parent organization ID
  userId: string; // linked user account ID
  firstName: string; // professional's first name
  lastName: string; // professional's last name
  slug: string; // URL-friendly identifier (unique within org)
  title?: string; // job title
  bio?: string; // professional bio
  status: ProfessionalStatus;
  createdAt: Timestamp; // server timestamp
  updatedAt: Timestamp; // server timestamp
  createdBy: string; // user ID who created the professional
  updatedBy: string; // user ID who last updated
  contact: ContactInfo;
  specialties: string[]; // list of specialties
  certifications?: string[]; // list of certifications
  experience?: {
    years: number; // years of experience
    description?: string; // experience description
  };
  availability: {
    [key: string]: { // day of week
      start: string; // HH:MM format
      end: string; // HH:MM format
      breaks?: Array<{
        start: string; // HH:MM format
        end: string; // HH:MM format
      }>;
    };
  };
  services: string[]; // services this professional offers
  rating?: {
    average: number; // average rating (1-5)
    count: number; // number of ratings
  };
  metadata?: Record<string, unknown>; // additional data
}

// ============================================================================
// PUBLIC LINKS COLLECTION
// ============================================================================

export interface PublicLinkDoc {
  id: string; // document ID
  slug: string; // URL-friendly identifier (globally unique)
  type: PublicLinkType; // type of link
  status: PublicLinkStatus;
  createdAt: Timestamp; // server timestamp
  updatedAt: Timestamp; // server timestamp
  createdBy: string; // user ID who created the link
  updatedBy: string; // user ID who last updated
  expiresAt?: Timestamp; // when link expires
  targetId: string; // ID of the target resource
  targetType: 'store' | 'professional' | 'booking' | 'waitlist';
  orgId?: string; // organization context
  metadata: {
    title?: string; // display title
    description?: string; // display description
    image?: string; // display image URL
    redirectUrl?: string; // where to redirect
    password?: string; // optional password protection
    maxUses?: number; // maximum number of uses
    useCount: number; // current use count
    lastUsedAt?: Timestamp; // when last used
  };
}

// ============================================================================
// USERS COLLECTION
// ============================================================================

export interface UserDoc {
  id: string; // document ID (matches Firebase Auth UID)
  email: string; // user email
  displayName?: string; // user display name
  firstName?: string; // user first name
  lastName?: string; // user last name
  photoURL?: string; // profile photo URL
  roles: UserRole[]; // user roles (mirror of Auth custom claims)
  createdAt: Timestamp; // server timestamp
  updatedAt: Timestamp; // server timestamp
  lastSignIn?: Timestamp; // last sign in time
  preferences: {
    language: Locale; // user's preferred language
    timezone: string; // user's timezone
    notifications: {
      email: boolean; // email notifications enabled
      push: boolean; // push notifications enabled
      sms: boolean; // SMS notifications enabled
    };
  };
  contact: ContactInfo;
  address?: Address;
  metadata?: Record<string, unknown>; // additional data
}

// ============================================================================
// EMAIL EVENTS COLLECTION (existing)
// ============================================================================

export interface EmailEventDoc {
  messageId: string;
  type: EmailEventType;
  email: string;
  ts: Timestamp;
  meta: Record<string, unknown>;
}

// ============================================================================
// DEAD LETTER QUEUE COLLECTION (existing)
// ============================================================================

export interface DeadLetterQueueDoc {
  id: string; // document ID
  waitlistId: string;
  email: string;
  error: {
    code: string;
    msg: string;
  };
  lastAttempt: Timestamp;
  attempts: number;
  maxAttempts: number;
}

// ============================================================================
// COLLECTION REFERENCE TYPES
// ============================================================================

export interface CollectionRefs {
  waitlist: string; // 'waitlist'
  invites: string; // 'invites'
  auditLogs: string; // 'admin/auditLogs/entries'
  orgs: string; // 'orgs'
  stores: string; // 'orgs/{orgId}/stores'
  professionals: string; // 'orgs/{orgId}/professionals'
  publicLinks: string; // 'publicLinks'
  users: string; // 'users'
  emailEvents: string; // 'email_events'
  deadLetterQueue: string; // 'email_dlq'
}

// ============================================================================
// INDEX REQUIREMENTS
// ============================================================================

export interface IndexRequirement {
  collection: string;
  fields: Array<{
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING';
  }>;
  queryScope?: 'COLLECTION' | 'COLLECTION_GROUP';
}

// ============================================================================
// SEED DATA INTERFACES
// ============================================================================

export interface SeedData {
  orgs: Partial<OrgDoc>[];
  stores: Partial<StoreDoc>[];
  professionals: Partial<ProfessionalDoc>[];
  waitlist: Partial<WaitlistDoc>[];
  users: Partial<UserDoc>[];
  publicLinks: Partial<PublicLinkDoc>[];
}
