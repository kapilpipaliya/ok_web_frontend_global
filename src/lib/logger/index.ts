/**
 * Centralized Logging System
 * Uses Pino for structured, high-performance logging
 */

import pino from "pino";
import type { Logger, LoggerOptions } from "pino";
import path from "path";
import fs from "fs";

// Log levels
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// Log context types
export interface LogContext {
  [key: string]: any;
}

export interface RequestContext {
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export interface AuthContext {
  userId?: string;
  email?: string;
  action: string;
  success: boolean;
  reason?: string;
}

export interface PaymentContext {
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status: string;
  userId?: string;
}

export interface JobContext {
  jobId?: string;
  jobName: string;
  queueName: string;
  attemptsMade?: number;
  duration?: number;
  status: "started" | "completed" | "failed";
  error?: string;
}

export interface DatabaseContext {
  database?: string;
  query?: string;
  duration?: number;
  operation: string;
  recordCount?: number;
  error?: string;
}

// Environment detection
const isDevelopment = process.env.NODE_ENV !== "production";
const logLevel = (process.env.LOG_LEVEL ||
  (isDevelopment ? "debug" : "info")) as LogLevel;
const enableLogRotation = process.env.LOG_ROTATION_ENABLED !== "false";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Base logger configuration
const baseLoggerOptions: LoggerOptions = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
};

// Create transport configuration
function createTransport() {
  if (isDevelopment) {
    // Development: Pretty print to console
    return pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        singleLine: false,
      },
    });
  }
  // Production: Write to files with rotation
  if (enableLogRotation) {
    return pino.transport({
      targets: [
        // Application logs with rotation
        {
          target: "pino-roll",
          options: {
            file: path.join(logsDir, "application"),
            frequency: "daily",
            size: "100M",
            extension: ".log",
            mkdir: true,
          },
        },
        // Error logs separately
        {
          target: "pino-roll",
          level: "error",
          options: {
            file: path.join(logsDir, "error"),
            frequency: "daily",
            size: "100M",
            extension: ".log",
            mkdir: true,
          },
        },
        // Console output (minimal)
        {
          target: "pino/file",
          level: "info",
          options: {
            destination: 1, // stdout
          },
        },
      ],
    });
  }
  // Production without rotation: simple file output
  return pino.transport({
    targets: [
      {
        target: "pino/file",
        options: {
          destination: path.join(logsDir, "application.log"),
        },
      },
      {
        target: "pino/file",
        level: "error",
        options: {
          destination: path.join(logsDir, "error.log"),
        },
      },
    ],
  });
}

// Create the base logger instance
const transport = createTransport();
const baseLogger: Logger = pino(baseLoggerOptions, transport);

// Main logger class with convenience methods
class AppLogger {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: LogContext): AppLogger {
    return new AppLogger(this.logger.child(bindings));
  }

  /**
   * Log at trace level
   */
  trace(obj: LogContext, msg?: string): void;
  trace(msg: string): void;
  trace(objOrMsg: LogContext | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.trace(objOrMsg);
    } else {
      this.logger.trace(objOrMsg, msg || "");
    }
  }

  /**
   * Log at debug level
   */
  debug(obj: LogContext, msg?: string): void;
  debug(msg: string): void;
  debug(objOrMsg: LogContext | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.debug(objOrMsg);
    } else {
      this.logger.debug(objOrMsg, msg || "");
    }
  }

  /**
   * Log at info level
   */
  info(obj: LogContext, msg?: string): void;
  info(msg: string): void;
  info(objOrMsg: LogContext | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.info(objOrMsg);
    } else {
      this.logger.info(objOrMsg, msg || "");
    }
  }

  /**
   * Log at warn level
   */
  warn(obj: LogContext, msg?: string): void;
  warn(msg: string): void;
  warn(objOrMsg: LogContext | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.warn(objOrMsg);
    } else {
      this.logger.warn(objOrMsg, msg || "");
    }
  }

  /**
   * Log at error level
   */
  error(obj: LogContext | Error, msg?: string): void;
  error(msg: string): void;
  error(objOrMsg: LogContext | Error | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.error(objOrMsg);
    } else if (objOrMsg instanceof Error) {
      this.logger.error({ err: objOrMsg }, msg || objOrMsg.message);
    } else {
      this.logger.error(objOrMsg, msg || "");
    }
  }

  /**
   * Log at fatal level
   */
  fatal(obj: LogContext | Error, msg?: string): void;
  fatal(msg: string): void;
  fatal(objOrMsg: LogContext | Error | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      this.logger.fatal(objOrMsg);
    } else if (objOrMsg instanceof Error) {
      this.logger.fatal({ err: objOrMsg }, msg || objOrMsg.message);
    } else {
      this.logger.fatal(objOrMsg, msg || "");
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(context: RequestContext): void {
    this.info(
      {
        type: "http_request",
        ...context,
      },
      `${context.method} ${context.url} - ${context.statusCode} (${context.duration}ms)`,
    );
  }

  /**
   * Log authentication event
   */
  logAuth(context: AuthContext): void {
    const level = context.success ? "info" : "warn";
    this.logger[level](
      {
        type: "auth_event",
        ...context,
      },
      `Auth: ${context.action} - ${context.success ? "Success" : "Failed"}${context.reason ? ` (${context.reason})` : ""}`,
    );
  }

  /**
   * Log payment transaction
   */
  logPayment(context: PaymentContext): void {
    this.info(
      {
        type: "payment_transaction",
        ...context,
      },
      `Payment: ${context.status} - Order ${context.orderId || "N/A"}`,
    );
  }

  /**
   * Log background job execution
   */
  logJob(context: JobContext): void {
    const level = context.status === "failed" ? "error" : "info";
    this.logger[level](
      {
        type: "background_job",
        ...context,
      },
      `Job: ${context.jobName} - ${context.status}${context.duration ? ` (${context.duration}ms)` : ""}`,
    );
  }

  /**
   * Log database operation
   */
  logDatabase(context: DatabaseContext): void {
    const level = context.error ? "error" : "debug";
    this.logger[level](
      {
        type: "database_operation",
        ...context,
      },
      `DB: ${context.operation}${context.duration ? ` (${context.duration}ms)` : ""}${context.recordCount === undefined ? "" : ` - ${context.recordCount} records`}`,
    );
  }

  /**
   * Get the underlying Pino logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }
}

// Export the main logger instance
export const logger = new AppLogger(baseLogger);

// Export convenience function for creating child loggers
export function createLogger(context: LogContext): AppLogger {
  return logger.child(context);
}

// Export function to flush logs (useful for graceful shutdown)
export function flushLogs(): Promise<void> {
  return new Promise((resolve) => {
    baseLogger.flush(() => {
      resolve();
    });
  });
}

export default logger;
