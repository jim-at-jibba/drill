export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  file?: string;
  function?: string;
  [key: string]: any;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, context);
    }
  }

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
