/**
 * Telemetry system for public routing
 * Tracks resolver hits, mismatches, redirects, and errors
 */

import type { TelemetryEvent } from './publicTypes';

// ============================================================================
// TELEMETRY CONFIGURATION
// ============================================================================

interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  debug: boolean;
}

const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  debug: import.meta.env.DEV,
};

// ============================================================================
// TELEMETRY STORE
// ============================================================================

class TelemetryStore {
  private events: TelemetryEvent[] = [];
  private config: TelemetryConfig;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startFlushTimer();
  }

  /**
   * Add event to store
   */
  addEvent(event: Omit<TelemetryEvent, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    this.events.push(fullEvent);

    if (this.config.debug) {
      console.log('[Telemetry] Event added:', fullEvent);
    }

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush events to endpoint
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    if (this.config.debug) {
      console.log('[Telemetry] Flushing events:', eventsToFlush);
    }

    try {
      if (this.config.endpoint) {
        await this.sendToEndpoint(eventsToFlush);
      } else {
        // In development, just log to console
        console.log('[Telemetry] Events (no endpoint configured):', eventsToFlush);
      }
    } catch (error) {
      console.error('[Telemetry] Failed to flush events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToFlush);
    }
  }

  /**
   * Send events to telemetry endpoint
   */
  private async sendToEndpoint(events: TelemetryEvent[]): Promise<void> {
    const response = await fetch(this.config.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Telemetry endpoint returned ${response.status}`);
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TelemetryConfig>): void {
    this.config = { ...this.config, ...config };
    this.startFlushTimer();
  }

  /**
   * Get current event count
   */
  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Destroy store and cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // Flush remaining events
  }
}

// ============================================================================
// GLOBAL TELEMETRY STORE
// ============================================================================

const telemetryStore = new TelemetryStore();

// ============================================================================
// TELEMETRY HOOKS
// ============================================================================

/**
 * Track public resolver hit
 */
export function trackResolverHit(
  path: string,
  resolvedType: string,
  brandId?: string,
  storeId?: string,
  proId?: string
): void {
  telemetryStore.addEvent({
    event: 'public_resolver_hit',
    path,
    resolvedType,
    brandId,
    storeId,
    proId,
  });
}

/**
 * Track mismatch correction
 */
export function trackMismatchCorrected(
  path: string,
  _originalContext: string,
  _correctedContext: string,
  brandId?: string,
  storeId?: string,
  proId?: string
): void {
  telemetryStore.addEvent({
    event: 'public_resolver_mismatch_corrected',
    path,
    resolvedType: 'mismatch_corrected',
    brandId,
    storeId,
    proId,
  });
}

/**
 * Track not found error
 */
export function trackNotFound(
  path: string,
  attemptedType: string
): void {
  telemetryStore.addEvent({
    event: 'public_resolver_not_found',
    path,
    resolvedType: attemptedType,
  });
}

/**
 * Track redirect applied
 */
export function trackRedirectApplied(
  path: string,
  redirectTo: string,
  _redirectType: '301' | '302' | '308',
  _reason?: string
): void {
  telemetryStore.addEvent({
    event: 'public_redirect_applied',
    path,
    redirectTo,
  });
}

/**
 * Track generic error
 */
export function trackError(
  path: string,
  _error: string,
  _context?: Record<string, unknown>
): void {
  telemetryStore.addEvent({
    event: 'public_resolver_not_found', // Using not_found as generic error
    path,
    resolvedType: 'error',
  });
}

// ============================================================================
// TELEMETRY UTILITIES
// ============================================================================

/**
 * Initialize telemetry with configuration
 */
export function initTelemetry(config: Partial<TelemetryConfig> = {}): void {
  telemetryStore.updateConfig(config);
}

/**
 * Get telemetry configuration
 */
export function getTelemetryConfig(): TelemetryConfig {
  return { ...telemetryStore['config'] };
}

/**
 * Get current event count
 */
export function getTelemetryEventCount(): number {
  return telemetryStore.getEventCount();
}

/**
 * Force flush events
 */
export function flushTelemetry(): Promise<void> {
  return telemetryStore.flush();
}

/**
 * Clear all telemetry events
 */
export function clearTelemetry(): void {
  telemetryStore.clear();
}

/**
 * Destroy telemetry store
 */
export function destroyTelemetry(): void {
  telemetryStore.destroy();
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Get all events (for debugging)
 */
export function getTelemetryEvents(): TelemetryEvent[] {
  return [...telemetryStore['events']];
}

/**
 * Enable/disable telemetry
 */
export function setTelemetryEnabled(enabled: boolean): void {
  telemetryStore.updateConfig({ enabled });
}

/**
 * Set telemetry endpoint
 */
export function setTelemetryEndpoint(endpoint: string): void {
  telemetryStore.updateConfig({ endpoint });
}

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * React hook for telemetry
 */
export function useTelemetry() {
  return {
    trackResolverHit,
    trackMismatchCorrected,
    trackNotFound,
    trackRedirectApplied,
    trackError,
    flushTelemetry,
    clearTelemetry,
  };
}
