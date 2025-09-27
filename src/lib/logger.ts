/**
 * Centralized logging utility with environment-based log levels
 */

export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment =
      import.meta.env.DEV || import.meta.env.MODE === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.VERBOSE : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(
    level: string,
    message: string,
    ..._args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    return `${prefix} ${message}`;
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  verbose(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      console.log(this.formatMessage('VERBOSE', message), ...args);
    }
  }

  // Specialized logging methods
  firebase(message: string, ...args: unknown[]): void {
    this.debug(`[Firebase] ${message}`, ...args);
  }

  form(message: string, ...args: unknown[]): void {
    this.debug(`[Form] ${message}`, ...args);
  }

  i18n(message: string, ...args: unknown[]): void {
    this.debug(`[i18n] ${message}`, ...args);
  }

  captcha(message: string, ...args: unknown[]): void {
    this.debug(`[CAPTCHA] ${message}`, ...args);
  }

  // Performance logging
  performance(message: string, startTime: number, ...args: unknown[]): void {
    const duration = globalThis.performance.now() - startTime;
    this.debug(`[Performance] ${message} (${duration.toFixed(2)}ms)`, ...args);
  }

  // Group logging for related operations
  group(label: string, fn: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const {
  error,
  warn,
  info,
  debug,
  verbose,
  firebase,
  form,
  i18n,
  captcha,
  performance,
  group,
} = logger;
