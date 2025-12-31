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
    // In production, only log errors (not info/debug)
    // In development, log everything
    if (!this.isDevelopment && entry.level !== 'error') {
      return; // Skip non-error logs in production
    }

    const logString = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    // Use appropriate console method based on level
    if (entry.level === 'error') {
      // Only include context if it has meaningful data
      const hasContext = entry.context && Object.keys(entry.context).length > 0;
      
      if (hasContext) {
        console.error(logString, entry.context);
        // In development, also log stack trace if available
        if (this.isDevelopment && entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
      } else {
        console.error(logString);
        // In development, log stack trace even without context
        if (this.isDevelopment && entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
      }
    } else if (entry.level === 'warn') {
      if (entry.context) {
        console.warn(logString, entry.context);
      } else {
        console.warn(logString);
      }
    } else {
      // info/debug - only in development
    if (entry.context) {
      console.log(logString, entry.context);
    } else {
      console.log(logString);
    }
    }

    // In production, send errors to external logging service
    if (!this.isDevelopment && entry.level === 'error') {
      // TODO: Send to logging service (e.g., Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(entry.error);
    }
  }

  info(message: string, context?: any) {
    this.writeLog(this.formatLog('info', message, context));
  }

  warn(message: string, context?: any) {
    this.writeLog(this.formatLog('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: any) {
    // Build context object with error information
    const errorContext: any = {};
    
    // Add base context if provided
    if (context && typeof context === 'object') {
      Object.assign(errorContext, context);
    }
    
    // Add error information if error exists
    if (error) {
      // Include error message if available
      if (error.message) {
        errorContext.error = error.message;
      } else if (typeof error === 'string') {
        errorContext.error = error;
      }
      
      // Include error name/type if available
      if (error.name) {
        errorContext.errorType = error.name;
      }
      
      // Include error code if available
      if (error.code) {
        errorContext.errorCode = error.code;
      }
      
      // Include stack trace in development
      if (this.isDevelopment && error.stack) {
        errorContext.stack = error.stack;
      }
    }
    
    // Only include context if it has meaningful data
    const finalContext = Object.keys(errorContext).length > 0 ? errorContext : undefined;
    
    const entry = this.formatLog('error', message, finalContext);
    if (error?.stack && !this.isDevelopment) {
      entry.stack = error.stack; // Keep stack for production error tracking
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

  apiError(method: string, url: string, error?: Error | any, context?: any) {
    // Build comprehensive error context
    const errorContext: any = {
      method,
      url,
      ...context,
    };
    
    // Only add error info if error exists
    if (error) {
      errorContext.error = error.message || String(error);
      if (error.name) errorContext.errorType = error.name;
      if (error.code) errorContext.errorCode = error.code;
      if (error.stack && this.isDevelopment) errorContext.stack = error.stack;
    }
    
    this.error(`API ${method} ${url} failed`, error, errorContext);
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
