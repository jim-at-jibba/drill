/**
 * Log severity levels (lower number = more verbose).
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Additional context for log entries (file, function, custom fields).
 */
interface LogContext {
  file?: string;
  function?: string;
  [key: string]: any;
}

/**
 * Simple structured logger writing to stderr with ISO timestamps and JSON context.
 * Respects LOG_LEVEL env var (DEBUG|INFO|WARN|ERROR, default WARN).
 */
class Logger {
  private level: LogLevel = LogLevel.WARN;

  /**
   * Sets minimum log level. Messages below this level are silenced.
   * @param level - Minimum severity to log
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Logs debug message (verbose development info).
   * @param message - Log message
   * @param context - Additional structured data
   */
  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, context);
    }
  }

  /**
   * Logs informational message (normal operations).
   * @param message - Log message
   * @param context - Additional structured data
   */
  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, context);
    }
  }

  /**
   * Logs warning message (recoverable issues).
   * @param message - Log message
   * @param context - Additional structured data
   */
  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, context);
    }
  }

  /**
   * Logs error message with optional Error object (extracts message and stack).
   * @param message - Log message
   * @param error - Error object to include (optional)
   * @param context - Additional structured data
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      this.log('ERROR', message, { ...context, error: error?.message, stack: error?.stack });
    }
  }

  private log(level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    console.error(`[${timestamp}] ${level}: ${message}${contextStr}`);
  }
}

export const logger = new Logger();

// Set level from env var
if (process.env.LOG_LEVEL) {
  const level = LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel];
  if (level !== undefined) {
    logger.setLevel(level);
  }
}
