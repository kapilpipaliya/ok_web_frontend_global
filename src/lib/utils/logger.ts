/**
 * Logging & Monitoring System
 *
 * Structured logging with levels, performance tracking, and request tracing
 */

import type { Session } from "neo4j-driver";

/**
 * Log levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: any;
  requestId?: string;
  userId?: string;
  duration?: number;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: LogLevel;
  enableConsole?: boolean;
  enableDatabase?: boolean;
  formatJson?: boolean;
}

/**
 * Performance timer
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;
  private metadata: Record<string, any>;

  constructor(label: string, metadata: Record<string, any> = {}) {
    this.startTime = Date.now();
    this.label = label;
    this.metadata = metadata;
  }

  /**
   * End timer and log duration
   */
  end(message?: string, logger?: Logger): number {
    const duration = Date.now() - this.startTime;

    if (logger) {
      logger.info(message || `${this.label} completed`, {
        ...this.metadata,
        duration,
        label: this.label,
      });
    }

    return duration;
  }

  /**
   * Get elapsed time without ending
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig;
  private context: Record<string, any>;
  private session?: Session;

  constructor(config: LoggerConfig = {}, context: Record<string, any> = {}) {
    this.config = {
      level: config.level || "info",
      enableConsole: config.enableConsole ?? true,
      enableDatabase: config.enableDatabase ?? false,
      formatJson: config.formatJson ?? false,
    };
    this.context = context;
  }

  /**
   * Set database session for logging
   */
  setSession(session: Session): void {
    this.session = session;
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    return new Logger(this.config, { ...this.context, ...context });
  }

  /**
   * Start performance timer
   */
  startTimer(label: string, metadata: Record<string, any> = {}): PerformanceTimer {
    return new PerformanceTimer(label, { ...this.context, ...metadata });
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any, context?: Record<string, any>): void {
    this.log("error", message, { ...context, error });
  }

  /**
   * Log fatal error
   */
  fatal(message: string, error?: any, context?: Record<string, any>): void {
    this.log("fatal", message, { ...context, error });
  }

  /**
   * Log with trace ID
   */
  trace(requestId: string, message: string, context?: Record<string, any>): void {
    this.log("info", message, { ...context, requestId });
  }

  /**
   * Core log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Check if should log based on level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      requestId: context?.requestId,
      userId: context?.userId,
      duration: context?.duration,
      error: context?.error,
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Database logging (async, don't wait)
    if (this.config.enableDatabase && this.session) {
      this.logToDatabase(entry).catch((err) => {
        console.error("Failed to log to database:", err);
      });
    }
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
    const configLevelIndex = levels.indexOf(this.config.level!);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry;

    if (this.config.formatJson) {
      // JSON format
      console.log(JSON.stringify(entry));
    } else {
      // Human-readable format
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      const contextStr = context ? ` ${JSON.stringify(context)}` : "";

      switch (level) {
        case "debug":
          console.debug(`${prefix} ${message}${contextStr}`);
          break;
        case "info":
          console.info(`${prefix} ${message}${contextStr}`);
          break;
        case "warn":
          console.warn(`${prefix} ${message}${contextStr}`);
          break;
        case "error":
        case "fatal":
          console.error(`${prefix} ${message}${contextStr}`);
          if (error) {
            console.error(error);
          }
          break;
      }
    }
  }

  /**
   * Log to database
   */
  private async logToDatabase(entry: LogEntry): Promise<void> {
    if (!this.session) return;

    try {
      await this.session.run(
        `CREATE (l:Log {
          level: $level,
          message: $message,
          timestamp: $timestamp,
          context: $context,
          requestId: $requestId,
          userId: $userId,
          duration: $duration,
          error: $error
        })`,
        {
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp,
          context: JSON.stringify(entry.context || {}),
          requestId: entry.requestId || null,
          userId: entry.userId || null,
          duration: entry.duration || null,
          error: entry.error ? JSON.stringify(entry.error) : null,
        }
      );
    } catch (error) {
      // Silent fail - don't break app because of logging
      console.error("Database logging failed:", error);
    }
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Create logger
 */
export function createLogger(config?: LoggerConfig, context?: Record<string, any>): Logger {
  return new Logger(config, context);
}

/**
 * Get global logger
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

/**
 * Set global logger
 */
export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

/**
 * Logger factory
 */
export const logger = {
  /**
   * Create new logger
   */
  create: createLogger,

  /**
   * Get global logger
   */
  get: getLogger,

  /**
   * Set global logger
   */
  set: setLogger,

  /**
   * Quick log methods
   */
  debug: (message: string, context?: Record<string, any>) => {
    getLogger().debug(message, context);
  },

  info: (message: string, context?: Record<string, any>) => {
    getLogger().info(message, context);
  },

  warn: (message: string, context?: Record<string, any>) => {
    getLogger().warn(message, context);
  },

  error: (message: string, error?: any, context?: Record<string, any>) => {
    getLogger().error(message, error, context);
  },

  fatal: (message: string, error?: any, context?: Record<string, any>) => {
    getLogger().fatal(message, error, context);
  },

  trace: (requestId: string, message: string, context?: Record<string, any>) => {
    getLogger().trace(requestId, message, context);
  },

  /**
   * Start performance timer
   */
  startTimer: (label: string, metadata?: Record<string, any>) => {
    return getLogger().startTimer(label, metadata);
  },
};

/**
 * Query logs from database
 */
export async function queryLogs(
  session: Session,
  filters: {
    level?: LogLevel | LogLevel[];
    userId?: string;
    requestId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  } = {}
): Promise<LogEntry[]> {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.level) {
    if (Array.isArray(filters.level)) {
      conditions.push("l.level IN $levels");
      params.levels = filters.level;
    } else {
      conditions.push("l.level = $level");
      params.level = filters.level;
    }
  }

  if (filters.userId) {
    conditions.push("l.userId = $userId");
    params.userId = filters.userId;
  }

  if (filters.requestId) {
    conditions.push("l.requestId = $requestId");
    params.requestId = filters.requestId;
  }

  if (filters.fromDate) {
    conditions.push("l.timestamp >= $fromDate");
    params.fromDate = filters.fromDate;
  }

  if (filters.toDate) {
    conditions.push("l.timestamp <= $toDate");
    params.toDate = filters.toDate;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = filters.limit ? `LIMIT ${filters.limit}` : "";

  const query = `
    MATCH (l:Log)
    ${whereClause}
    RETURN l
    ORDER BY l.timestamp DESC
    ${limitClause}
  `;

  const result = await session.run(query, params);

  return result.records.map((record) => {
    const log = record.get("l").properties;
    return {
      level: log.level,
      message: log.message,
      timestamp: log.timestamp,
      context: log.context ? JSON.parse(log.context) : undefined,
      error: log.error ? JSON.parse(log.error) : undefined,
      requestId: log.requestId || undefined,
      userId: log.userId || undefined,
      duration: log.duration || undefined,
    };
  });
}

/**
 * Clear old logs
 */
export async function clearOldLogs(
  session: Session,
  olderThanDays: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await session.run(
    `MATCH (l:Log)
     WHERE l.timestamp < $cutoffDate
     DELETE l
     RETURN count(l) as deleted`,
    { cutoffDate: cutoffDate.toISOString() }
  );

  return result.records[0]?.get("deleted").toNumber() || 0;
}
