/**
 * Public routing types and Zod schemas
 * Defines data contracts for public links, display models, and resolver context
 */

import { z } from 'zod';
// import type { Timestamp } from 'firebase/firestore';

// ============================================================================
// CORE SCHEMAS
// ============================================================================

export const ZPublicLink = z.object({
  id: z.string(),
  type: z.enum(['brand', 'store', 'professional', 'service']),
  slug: z.string().min(1),
  status: z.enum(['active', 'disabled']),
  target: z.object({
    orgId: z.string(),
    storeId: z.string().optional(),
    proId: z.string().optional(),
    serviceId: z.string().optional(),
  }),
  updatedAt: z.any(), // Firestore Timestamp
});

export const ZDisplayModel = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  avatar: z.string().optional(),
  logo: z.string().optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
    })
    .optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'disabled']),
});

export const ZRedirectRule = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['301', '302', '308']).default('301'),
  reason: z.string().optional(),
});

// ============================================================================
// RESOLVER TYPES
// ============================================================================

export interface ResolverSlugs {
  brand?: string;
  store?: string;
  pro?: string;
  soloPro?: string;
}

export interface ResolvedContext {
  type: 'brand' | 'store' | 'professional' | 'service';
  entity: PublicLink;
  display: DisplayModel;
  parent?: {
    brand?: PublicLink;
    store?: PublicLink;
  };
  isMismatch?: boolean;
  correctedContext?: ResolvedContext;
}

export interface ResolverResult {
  success: boolean;
  context?: ResolvedContext;
  error?: 'not_found' | 'disabled' | 'mismatch' | 'invalid_slug';
  redirect?: {
    to: string;
    type: '301' | '302' | '308';
    reason?: string;
  };
}

// ============================================================================
// TELEMETRY TYPES
// ============================================================================

export interface TelemetryEvent {
  event:
    | 'public_resolver_hit'
    | 'public_resolver_mismatch_corrected'
    | 'public_resolver_not_found'
    | 'public_redirect_applied';
  path: string;
  resolvedType?: string;
  brandId?: string;
  storeId?: string;
  proId?: string;
  redirectTo?: string;
  timestamp: number;
  userAgent?: string;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface LRUCacheOptions {
  maxSize: number;
  defaultTTL: number; // in milliseconds
}

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type PublicLink = z.infer<typeof ZPublicLink>;
export type DisplayModel = z.infer<typeof ZDisplayModel>;
export type RedirectRule = z.infer<typeof ZRedirectRule>;

// ============================================================================
// URL BUILDING TYPES
// ============================================================================

export interface ServiceQuery {
  service?: string;
  date?: string; // ISO date string
}

export interface URLBuilders {
  brandUrl: (brandSlug: string) => string;
  storeUrl: (brandSlug: string, storeSlug: string) => string;
  proUrl: (brandSlug: string, storeSlug: string, proSlug: string) => string;
  soloProUrl: (proSlug: string) => string;
  serviceQuery: (query: ServiceQuery) => string;
}

// ============================================================================
// BANNER TYPES
// ============================================================================

export interface BannerProps {
  type: 'mismatch' | 'redirect' | 'error';
  message: string;
  onDismiss: () => void;
  onAction?: () => void;
  actionText?: string;
  isVisible: boolean;
}

// ============================================================================
// MOCK DATA TYPES
// ============================================================================

export interface MockData {
  brands: PublicLink[];
  stores: PublicLink[];
  professionals: PublicLink[];
  services: PublicLink[];
  redirects: RedirectRule[];
  displayModels: DisplayModel[];
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validatePublicLink(data: unknown): PublicLink {
  return ZPublicLink.parse(data);
}

export function validateDisplayModel(data: unknown): DisplayModel {
  return ZDisplayModel.parse(data);
}

export function validateRedirectRule(data: unknown): RedirectRule {
  return ZRedirectRule.parse(data);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isPublicLink(data: unknown): data is PublicLink {
  return ZPublicLink.safeParse(data).success;
}

export function isDisplayModel(data: unknown): data is DisplayModel {
  return ZDisplayModel.safeParse(data).success;
}

export function isRedirectRule(data: unknown): data is RedirectRule {
  return ZRedirectRule.safeParse(data).success;
}
