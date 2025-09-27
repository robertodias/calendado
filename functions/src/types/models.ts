import type { Timestamp } from 'firebase-admin/firestore';
import type { 
  Locale, 
  WaitlistStatus, 
  UtmData, 
  ConfirmationComms, 
  UserRole,
  UserDoc as SharedUserDoc,
  AuditLogDoc as SharedAuditLogDoc,
  FeatureFlagsDoc as SharedFeatureFlagsDoc,
  EmailEventDoc as SharedEmailEventDoc,
  DeadLetterQueueDoc as SharedDeadLetterQueueDoc,
  EmailTemplate as SharedEmailTemplate,
  LocalizedStrings as SharedLocalizedStrings
} from './shared';

// Re-export shared types
export type { 
  Locale, 
  WaitlistStatus, 
  UtmData, 
  ConfirmationComms, 
  UserRole,
  UserDoc,
  AuditLogDoc,
  FeatureFlagsDoc,
  EmailEventDoc,
  DeadLetterQueueDoc,
  EmailTemplate,
  LocalizedStrings
};

export type EmailEventType = 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'dropped';

// Backend-specific WaitlistDoc that extends shared type with Firestore Timestamp
export interface WaitlistDoc extends Omit<SharedWaitlistDoc, 'createdAt'> {
  createdAt: Timestamp; // Firestore server timestamp
}

// Backend-specific UserDoc that extends shared type with Firestore Timestamp
export interface UserDoc extends Omit<SharedUserDoc, 'createdAt' | 'lastSignIn'> {
  createdAt: Timestamp;
  lastSignIn?: Timestamp;
}

// Backend-specific AuditLogDoc that extends shared type with Firestore Timestamp
export interface AuditLogDoc extends Omit<SharedAuditLogDoc, 'timestamp'> {
  timestamp: Timestamp;
}

// Backend-specific EmailEventDoc that extends shared type with Firestore Timestamp
export interface EmailEventDoc extends Omit<SharedEmailEventDoc, 'timestamp'> {
  timestamp: Timestamp;
}

// Backend-specific DeadLetterQueueDoc that extends shared type with Firestore Timestamp
export interface DeadLetterQueueDoc extends Omit<SharedDeadLetterQueueDoc, 'lastAttempt' | 'createdAt'> {
  lastAttempt: Timestamp;
  createdAt: Timestamp;
}

// Backend-specific FeatureFlagsDoc that extends shared type with Firestore Timestamp
export interface FeatureFlagsDoc extends Omit<SharedFeatureFlagsDoc, 'updatedAt'> {
  updatedAt: Timestamp;
}

// Organization and related types
export interface OrgDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  public: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  settings: {
    timezone: string;
    currency: string;
    language: Locale;
  };
}

export interface StoreDoc {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  settings: {
    timezone: string;
    currency: string;
    bookingSettings: {
      advanceBookingDays: number;
      cancellationHours: number;
      bufferTime: number;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface ProfessionalDoc {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  slug: string;
  title: string;
  bio?: string;
  avatar?: string;
  specialties: string[];
  services: string[];
  availability: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  settings: {
    timezone: string;
    currency: string;
    bookingSettings: {
      sessionDuration: number;
      advanceBookingDays: number;
      cancellationHours: number;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface PublicLinkDoc {
  id: string;
  orgId: string;
  slug: string;
  type: 'store' | 'professional';
  targetId: string;
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
}

export interface InviteDoc {
  id: string;
  email: string;
  status: 'pending' | 'used' | 'expired';
  createdAt: Timestamp;
  createdBy: string;
  expiresAt: Timestamp;
  waitlistEntryId?: string;
  role?: string;
  orgId?: string;
  usedAt?: Timestamp;
  usedBy?: string;
  magicLinkToken?: string;
  magicLinkUrl?: string;
  magicLinkExpiresAt?: Timestamp;
  metadata?: Record<string, unknown>;
}

// API Request/Response types
export interface AdminResendRequest {
  waitlistId?: string;
  email?: string;
  force?: boolean;
}

export interface UpdateUserRolesRequest {
  targetUid: string;
  roles: UserRole[];
}

export interface InviteFromWaitlistRequest {
  entryId: string;
  role?: string;
  orgId?: string;
  sendEmail?: boolean;
  expiresInHours?: number;
}

export interface InviteFromWaitlistResponse {
  success: boolean;
  inviteId?: string;
  magicLinkUrl?: string;
  messageId?: string;
  message: string;
  error?: string;
}

export interface RejectWaitlistRequest {
  entryId: string;
  reason?: string;
}

export interface RejectWaitlistResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface IssueMagicLinkRequest {
  inviteId: string;
  expiresInHours?: number;
  sendEmail?: boolean;
}

export interface IssueMagicLinkResponse {
  success: boolean;
  token?: string;
  url?: string;
  expiresAt?: Date;
  messageId?: string;
  message: string;
  error?: string;
}

export interface ValidateMagicLinkRequest {
  token: string;
}

export interface ValidateMagicLinkResponse {
  success: boolean;
  valid: boolean;
  payload?: {
    inviteId: string;
    email: string;
    type: 'invite' | 'password_reset';
    expiresAt?: Date;
  };
  error?: string;
}

// Resend API types
export interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
}

export interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    id: string;
    from: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
    created_at: string;
    last_event: string;
  };
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    email: ServiceHealth;
    functions: ServiceHealth;
  };
  metrics: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    performance: PerformanceMetrics;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
}