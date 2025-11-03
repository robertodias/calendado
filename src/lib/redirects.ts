/**
 * Redirect system for legacy URLs and renamed entities
 * Supports both SPA (in-app) and SSR (HTTP) redirects
 */

import type { RedirectRule } from './publicTypes';
import { normalizeUrl } from './buildPublicUrl';

// ============================================================================
// REDIRECT RULES
// ============================================================================

/**
 * Static redirect rules for legacy URLs
 * In production, this could be loaded from Firestore or a CDN
 */
export const REDIRECT_RULES: RedirectRule[] = [
  // Legacy brand redirects
  {
    from: '/old-glow-brand',
    to: '/glow',
    type: '301',
    reason: 'Brand renamed from old-glow-brand to glow',
  },

  // Legacy store redirects
  {
    from: '/glow/old-centro',
    to: '/glow/centro',
    type: '301',
    reason: 'Store renamed from old-centro to centro',
  },

  // Legacy professional redirects
  {
    from: '/glow/centro/maria-silva-old',
    to: '/glow/centro/maria-silva',
    type: '301',
    reason: 'Professional slug updated',
  },

  // Legacy solo professional redirects
  {
    from: '/u/maria-silva-old',
    to: '/u/maria-silva',
    type: '301',
    reason: 'Professional slug updated',
  },

  // Common typos and variations
  {
    from: '/glow/centro/maria-silva/',
    to: '/glow/centro/maria-silva',
    type: '301',
    reason: 'Remove trailing slash',
  },

  // Service redirects (if needed)
  {
    from: '/glow/centro/maria-silva/booking',
    to: '/glow/centro/maria-silva?service=booking',
    type: '301',
    reason: 'Move booking to query parameter',
  },
];

// ============================================================================
// REDIRECT MATCHER
// ============================================================================

/**
 * Find redirect rule for a given path
 * @param path - Path to check for redirects
 * @returns Redirect rule or null if no match
 */
export function findRedirectRule(path: string): RedirectRule | null {
  const normalizedPath = normalizeUrl(path);

  // Exact match first
  const exactMatch = REDIRECT_RULES.find(rule => rule.from === normalizedPath);
  if (exactMatch) {
    return exactMatch;
  }

  // Pattern matching for more complex redirects
  for (const rule of REDIRECT_RULES) {
    if (matchesRedirectPattern(normalizedPath, rule.from)) {
      return rule;
    }
  }

  return null;
}

/**
 * Check if a path matches a redirect pattern
 * @param path - Path to check
 * @param pattern - Pattern to match against
 * @returns True if pattern matches
 */
function matchesRedirectPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*') // Wildcard
    .replace(/\?/g, '.') // Single character
    .replace(/\[([^\]]+)\]/g, '($1)') // Character classes
    .replace(/\(([^)]+)\)/g, '($1)'); // Groups

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

// ============================================================================
// REDIRECT APPLIERS
// ============================================================================

/**
 * Apply redirect in SPA context (React Router)
 * @param path - Current path
 * @param navigate - React Router navigate function
 * @param telemetry - Telemetry function for tracking
 * @returns True if redirect was applied
 */
export function applySPARedirect(
  path: string,
  navigate: (to: string, options?: { replace?: boolean }) => void,
  telemetry?: (event: Record<string, unknown>) => void
): boolean {
  const rule = findRedirectRule(path);
  if (!rule) {
    return false;
  }

  // Apply redirect
  navigate(rule.to, { replace: true });

  // Emit telemetry
  if (telemetry) {
    telemetry({
      event: 'public_redirect_applied',
      path,
      redirectTo: rule.to,
      type: rule.type,
      reason: rule.reason,
      timestamp: Date.now(),
    });
  }

  return true;
}

/**
 * Apply redirect in SSR context (HTTP response)
 * @param path - Current path
 * @param res - HTTP response object (Next.js/Express)
 * @param telemetry - Telemetry function for tracking
 * @returns True if redirect was applied
 */
export function applySSRRedirect(
  path: string,
  res: { redirect: (status: number, url: string) => void },
  telemetry?: (event: Record<string, unknown>) => void
): boolean {
  const rule = findRedirectRule(path);
  if (!rule) {
    return false;
  }

  // Convert redirect type to HTTP status
  const statusCode =
    rule.type === '301' ? 301 : rule.type === '302' ? 302 : 308;

  // Apply redirect
  res.redirect(statusCode, rule.to);

  // Emit telemetry
  if (telemetry) {
    telemetry({
      event: 'public_redirect_applied',
      path,
      redirectTo: rule.to,
      type: rule.type,
      reason: rule.reason,
      timestamp: Date.now(),
    });
  }

  return true;
}

// ============================================================================
// REDIRECT UTILITIES
// ============================================================================

/**
 * Check if a path has a redirect
 * @param path - Path to check
 * @returns True if path has a redirect
 */
export function hasRedirect(path: string): boolean {
  return findRedirectRule(path) !== null;
}

/**
 * Get redirect destination for a path
 * @param path - Path to check
 * @returns Redirect destination or null
 */
export function getRedirectDestination(path: string): string | null {
  const rule = findRedirectRule(path);
  return rule ? rule.to : null;
}

/**
 * Get redirect type for a path
 * @param path - Path to check
 * @returns Redirect type or null
 */
export function getRedirectType(path: string): '301' | '302' | '308' | null {
  const rule = findRedirectRule(path);
  return rule ? rule.type : null;
}

/**
 * Add a new redirect rule (for dynamic redirects)
 * @param rule - Redirect rule to add
 */
export function addRedirectRule(rule: RedirectRule): void {
  // Check if rule already exists
  const existingIndex = REDIRECT_RULES.findIndex(r => r.from === rule.from);

  if (existingIndex >= 0) {
    // Update existing rule
    REDIRECT_RULES[existingIndex] = rule;
  } else {
    // Add new rule
    REDIRECT_RULES.push(rule);
  }
}

/**
 * Remove a redirect rule
 * @param from - Path to remove redirect for
 */
export function removeRedirectRule(from: string): void {
  const index = REDIRECT_RULES.findIndex(rule => rule.from === from);
  if (index >= 0) {
    REDIRECT_RULES.splice(index, 1);
  }
}

/**
 * Get all redirect rules
 * @returns Array of all redirect rules
 */
export function getAllRedirectRules(): RedirectRule[] {
  return [...REDIRECT_RULES];
}

/**
 * Clear all redirect rules
 */
export function clearRedirectRules(): void {
  REDIRECT_RULES.length = 0;
}

// ============================================================================
// REDIRECT VALIDATION
// ============================================================================

/**
 * Validate redirect rule
 * @param rule - Redirect rule to validate
 * @returns Validation result
 */
export function validateRedirectRule(rule: RedirectRule): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.from || typeof rule.from !== 'string') {
    errors.push('From path is required and must be a string');
  }

  if (!rule.to || typeof rule.to !== 'string') {
    errors.push('To path is required and must be a string');
  }

  if (rule.from === rule.to) {
    errors.push('From and to paths cannot be the same');
  }

  if (!['301', '302', '308'].includes(rule.type)) {
    errors.push('Type must be 301, 302, or 308');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all redirect rules
 * @returns Validation result for all rules
 */
export function validateAllRedirectRules(): {
  valid: boolean;
  errors: string[];
} {
  const allErrors: string[] = [];

  for (const rule of REDIRECT_RULES) {
    const validation = validateRedirectRule(rule);
    if (!validation.valid) {
      allErrors.push(`Rule "${rule.from}": ${validation.errors.join(', ')}`);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
