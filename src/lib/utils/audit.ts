/**
 * Audit Trail System
 *
 * Automatic change tracking and audit logging for compliance
 */

import type { Session } from "neo4j-driver";

/**
 * Audit action types
 */
export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "access"
  | "export"
  | "import"
  | string; // Allow custom actions

/**
 * Audit entry
 */
export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  resourceType?: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Audit options
 */
export interface AuditOptions {
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Audit query filters
 */
export interface AuditQueryFilters {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resourceType?: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Generate audit ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log audit entry
 */
export async function logAudit(
  session: Session,
  entry: Omit<AuditEntry, "id" | "timestamp">,
): Promise<AuditEntry> {
  const auditEntry: AuditEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  await session.run(
    `CREATE (a:AuditLog {
      id: $id,
      timestamp: $timestamp,
      action: $action,
      userId: $userId,
      userName: $userName,
      resourceType: $resourceType,
      resourceId: $resourceId,
      changes: $changes,
      metadata: $metadata,
      ipAddress: $ipAddress,
      userAgent: $userAgent,
      success: $success,
      errorMessage: $errorMessage
    })`,
    {
      id: auditEntry.id,
      timestamp: auditEntry.timestamp,
      action: auditEntry.action,
      userId: auditEntry.userId || null,
      userName: auditEntry.userName || null,
      resourceType: auditEntry.resourceType || null,
      resourceId: auditEntry.resourceId || null,
      changes: auditEntry.changes ? JSON.stringify(auditEntry.changes) : null,
      metadata: auditEntry.metadata
        ? JSON.stringify(auditEntry.metadata)
        : null,
      ipAddress: auditEntry.ipAddress || null,
      userAgent: auditEntry.userAgent || null,
      success: auditEntry.success,
      errorMessage: auditEntry.errorMessage || null,
    },
  );

  return auditEntry;
}

/**
 * Query audit logs
 */
export async function queryAudit(
  session: Session,
  filters: AuditQueryFilters = {},
): Promise<AuditEntry[]> {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.userId) {
    conditions.push("a.userId = $userId");
    params.userId = filters.userId;
  }

  if (filters.action) {
    if (Array.isArray(filters.action)) {
      conditions.push("a.action IN $actions");
      params.actions = filters.action;
    } else {
      conditions.push("a.action = $action");
      params.action = filters.action;
    }
  }

  if (filters.resourceType) {
    conditions.push("a.resourceType = $resourceType");
    params.resourceType = filters.resourceType;
  }

  if (filters.resourceId) {
    conditions.push("a.resourceId = $resourceId");
    params.resourceId = filters.resourceId;
  }

  if (filters.fromDate) {
    conditions.push("a.timestamp >= $fromDate");
    params.fromDate = filters.fromDate;
  }

  if (filters.toDate) {
    conditions.push("a.timestamp <= $toDate");
    params.toDate = filters.toDate;
  }

  if (filters.success !== undefined) {
    conditions.push("a.success = $success");
    params.success = filters.success;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const skipClause = filters.offset ? `SKIP ${filters.offset}` : "";
  const limitClause = filters.limit ? `LIMIT ${filters.limit}` : "LIMIT 100";

  const query = `
    MATCH (a:AuditLog)
    ${whereClause}
    RETURN a
    ORDER BY a.timestamp DESC
    ${skipClause}
    ${limitClause}
  `;

  const result = await session.run(query, params);

  return result.records.map((record) => {
    const audit = record.get("a").properties;
    return {
      id: audit.id,
      timestamp: audit.timestamp,
      action: audit.action,
      userId: audit.userId || undefined,
      userName: audit.userName || undefined,
      resourceType: audit.resourceType || undefined,
      resourceId: audit.resourceId || undefined,
      changes: audit.changes ? JSON.parse(audit.changes) : undefined,
      metadata: audit.metadata ? JSON.parse(audit.metadata) : undefined,
      ipAddress: audit.ipAddress || undefined,
      userAgent: audit.userAgent || undefined,
      success: audit.success,
      errorMessage: audit.errorMessage || undefined,
    };
  });
}

/**
 * Audit decorator for tracking changes
 */
export function auditTrail(action: AuditAction, resourceType?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const session = args[0]; // Assume first arg is session
      const options = args[args.length - 1]; // Assume last arg might be options

      try {
        const result = await originalMethod.apply(this, args);

        // Log successful audit
        await logAudit(session, {
          action,
          resourceType,
          success: true,
          userId: options?.userId,
          userName: options?.userName,
          metadata: options?.metadata,
        });

        return result;
      } catch (error) {
        // Log failed audit
        await logAudit(session, {
          action,
          resourceType,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          userId: options?.userId,
          userName: options?.userName,
          metadata: options?.metadata,
        });

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Track changes between old and new objects
 */
export function trackChanges(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  // Check for changed and new properties
  for (const key in newObj) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
    }
  }

  // Check for deleted properties
  for (const key in oldObj) {
    if (!(key in newObj)) {
      changes[key] = {
        old: oldObj[key],
        new: undefined,
      };
    }
  }

  return changes;
}

/**
 * Get audit stats
 */
export async function getAuditStats(
  session: Session,
  filters: {
    userId?: string;
    fromDate?: string;
    toDate?: string;
  } = {},
): Promise<{
  total: number;
  byAction: Record<string, number>;
  byResourceType: Record<string, number>;
  successRate: number;
}> {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.userId) {
    conditions.push("a.userId = $userId");
    params.userId = filters.userId;
  }

  if (filters.fromDate) {
    conditions.push("a.timestamp >= $fromDate");
    params.fromDate = filters.fromDate;
  }

  if (filters.toDate) {
    conditions.push("a.timestamp <= $toDate");
    params.toDate = filters.toDate;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total and success count
  const totalQuery = `
    MATCH (a:AuditLog)
    ${whereClause}
    RETURN
      count(a) as total,
      sum(CASE WHEN a.success THEN 1 ELSE 0 END) as successful
  `;

  const totalResult = await session.run(totalQuery, params);
  const total = totalResult.records[0]?.get("total").toNumber() || 0;
  const successful = totalResult.records[0]?.get("successful").toNumber() || 0;

  // Get by action
  const actionQuery = `
    MATCH (a:AuditLog)
    ${whereClause}
    RETURN a.action as action, count(a) as count
  `;

  const actionResult = await session.run(actionQuery, params);
  const byAction: Record<string, number> = {};
  for (const record of actionResult.records) {
    byAction[record.get("action")] = record.get("count").toNumber();
  }

  // Get by resource type
  const resourceQuery = `
    MATCH (a:AuditLog)
    ${whereClause}
    WHERE a.resourceType IS NOT NULL
    RETURN a.resourceType as type, count(a) as count
  `;

  const resourceResult = await session.run(resourceQuery, params);
  const byResourceType: Record<string, number> = {};
  for (const record of resourceResult.records) {
    byResourceType[record.get("type")] = record.get("count").toNumber();
  }

  return {
    total,
    byAction,
    byResourceType,
    successRate: total > 0 ? successful / total : 0,
  };
}

/**
 * Clear old audit logs
 */
export async function clearOldAudits(
  session: Session,
  olderThanDays = 90,
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await session.run(
    `MATCH (a:AuditLog)
     WHERE a.timestamp < $cutoffDate
     DELETE a
     RETURN count(a) as deleted`,
    { cutoffDate: cutoffDate.toISOString() },
  );

  return result.records[0]?.get("deleted").toNumber() || 0;
}

/**
 * Audit helper factory
 */
export const audit = {
  /**
   * Log audit entry
   */
  log: logAudit,

  /**
   * Query audit logs
   */
  query: queryAudit,

  /**
   * Track changes
   */
  trackChanges,

  /**
   * Get stats
   */
  stats: getAuditStats,

  /**
   * Clear old audits
   */
  clearOld: clearOldAudits,

  /**
   * Quick log methods
   */
  logCreate: async (
    session: Session,
    resourceType: string,
    resourceId: string,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "create",
      resourceType,
      resourceId,
      success: true,
      ...options,
    });
  },

  logUpdate: async (
    session: Session,
    resourceType: string,
    resourceId: string,
    changes: Record<string, { old: any; new: any }>,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "update",
      resourceType,
      resourceId,
      changes,
      success: true,
      ...options,
    });
  },

  logDelete: async (
    session: Session,
    resourceType: string,
    resourceId: string,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "delete",
      resourceType,
      resourceId,
      success: true,
      ...options,
    });
  },

  logAccess: async (
    session: Session,
    resourceType: string,
    resourceId: string,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "access",
      resourceType,
      resourceId,
      success: true,
      ...options,
    });
  },

  logLogin: async (
    session: Session,
    userId: string,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "login",
      userId,
      success: true,
      ...options,
    });
  },

  logLogout: async (
    session: Session,
    userId: string,
    options?: AuditOptions,
  ) => {
    return logAudit(session, {
      action: "logout",
      userId,
      success: true,
      ...options,
    });
  },
};
