/**
 * Centralized logging utility
 * Provides structured logging with environment-based levels and production-safe error handling
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

  /**
   * Determine if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }

    if (this.debugMode) {
      return true; // Log everything if debug mode is enabled
    }

    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  /**
   * Format log message with context
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  /**
   * Send error to monitoring service (in production)
   */
  private sendToMonitoring(
    _level: LogLevel,
    _message: string,
    _error?: Error,
    _context?: LogContext
  ): void {
    if (!this.isProduction) {
      return; // Only send to monitoring in production
    }

    if (_level === 'error') {
      // TODO: Integrate with error monitoring service (e.g., Sentry, LogRocket)
      // Example:
      // if (window.Sentry) {
      //   window.Sentry.captureException(error || new Error(message), {
      //     tags: context,
      //   });
      // }
    }
  }

  /**
   * Debug level logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) {
      return;
    }

    const formatted = this.formatMessage('debug', message, context);
    // eslint-disable-next-line no-console
    console.debug(formatted);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) {
      return;
    }

    const formatted = this.formatMessage('info', message, context);
    // eslint-disable-next-line no-console
    console.info(formatted);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) {
      return;
    }

    const formatted = this.formatMessage('warn', message, context);
    // eslint-disable-next-line no-console
    console.warn(formatted);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) {
      return;
    }

    const formatted = this.formatMessage('error', message, context);

    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(formatted, error);
      this.sendToMonitoring('error', message, error, context);
    } else if (error) {
      // eslint-disable-next-line no-console
      console.error(formatted, error);
      this.sendToMonitoring(
        'error',
        message,
        new Error(String(error)),
        context
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(formatted);
      this.sendToMonitoring('error', message, undefined, context);
    }
  }

  /**
   * Log telemetry/analytics events (separate from application logs)
   */
  telemetry(event: string, properties?: Record<string, unknown>): void {
    if (!this.isDevelopment && !this.debugMode) {
      return; // Only log telemetry in dev/debug mode
    }

    // eslint-disable-next-line no-console
    console.debug(`[TELEMETRY] ${event}`, properties);
    // In production, send to analytics service instead
    // Example: analytics.track(event, properties);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for common use cases
export const logError = (error: Error | string, component?: string): void => {
  if (typeof error === 'string') {
    logger.error(error, undefined, { component });
  } else {
    logger.error(error.message, error, { component });
  }
};

export const logInfo = (message: string, component?: string): void => {
  logger.info(message, { component });
};

export const logWarn = (message: string, component?: string): void => {
  logger.warn(message, { component });
};

export const logDebug = (message: string, component?: string): void => {
  logger.debug(message, { component });
};
