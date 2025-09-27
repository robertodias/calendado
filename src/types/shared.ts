/**
 * Shared type definitions between frontend and backend
 * 
 * This file contains types that are used in both the frontend
 * and backend to ensure consistency.
 */

export type UserRole = 'superadmin' | 'admin' | 'support' | 'editor' | 'viewer';

export type Locale = 'en-US' | 'pt-BR' | 'it-IT';

export type WaitlistStatus = 'pending' | 'confirmed' | 'invited' | 'blocked' | 'rejected' | 'active';

export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ConfirmationComms {
  sent: boolean;
  sentAt: Date | null;
  messageId: string | null;
  error: {
    code: string;
    msg: string;
  } | null;
}

export interface WaitlistDoc {
  id: string;
  email: string;
  name: string | null;
  locale: Locale | null;
  utm: UtmData | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  status: WaitlistStatus;
  comms: {
    confirmation: ConfirmationComms;
  };
  dedupeKey: string;
  captchaVerified: boolean;
  captchaToken: string | null;
  language?: string; // Frontend compatibility
  updatedAt?: Date;
  invitedBy?: string;
  inviteId?: string;
  rejectionReason?: string | null;
}

export interface UserDoc {
  uid: string;
  email: string;
  displayName?: string;
  roles: UserRole[];
  createdAt: Date;
  lastSignIn?: Date;
  preferences?: {
    language?: Locale;
    theme?: 'light' | 'dark' | 'system';
  };
}

export interface AuditLogDoc {
  timestamp: Date;
  actorUid: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface FeatureFlagsDoc {
  bookingAlpha: boolean;
  paymentsAlpha: boolean;
  newDashboard: boolean;
  betaFeatures: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface EmailEventDoc {
  messageId: string;
  type: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'dropped';
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface DeadLetterQueueDoc {
  waitlistId: string;
  email: string;
  name: string | null;
  locale: Locale | null;
  error: string;
  attempts: number;
  lastAttempt: Date;
  createdAt: Date;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface LocalizedStrings {
  subject: string;
  greeting: string;
  body: string;
  expectations: {
    title: string;
    items: string[];
  };
  closing: string;
  footer: {
    why: string;
    privacy: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
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

// Error types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  details?: Record<string, unknown>;
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
