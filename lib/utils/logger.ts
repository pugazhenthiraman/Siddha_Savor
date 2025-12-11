type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack: new Error().stack,
    };
  }

  private writeLog(entry: LogEntry) {
    const logString = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    if (entry.context) {
      console.log(logString, entry.context);
    } else {
      console.log(logString);
    }

    // In production, you could send logs to external service
    if (!this.isDevelopment) {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
    }
  }

  info(message: string, context?: any) {
    this.writeLog(this.formatLog('info', message, context));
  }

  warn(message: string, context?: any) {
    this.writeLog(this.formatLog('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: any) {
    const entry = this.formatLog('error', message, { ...context, error: error?.message });
    if (error?.stack) {
      entry.stack = error.stack;
    }
    this.writeLog(entry);
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      this.writeLog(this.formatLog('debug', message, context));
    }
  }

  // API specific logging
  apiRequest(method: string, url: string, context?: any) {
    this.info(`API ${method} ${url}`, context);
  }

  apiError(method: string, url: string, error: Error | any, context?: any) {
    this.error(`API ${method} ${url} failed`, error, context);
  }

  // Database specific logging
  dbQuery(query: string, context?: any) {
    this.debug(`DB Query: ${query}`, context);
  }

  dbError(query: string, error: Error | any, context?: any) {
    this.error(`DB Query failed: ${query}`, error, context);
  }
}

export const logger = new Logger();
