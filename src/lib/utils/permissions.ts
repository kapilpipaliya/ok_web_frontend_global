/**
 * Declarative Permissions System
 *
 * Clean authorization checks for server functions
 */

import type { Session } from "neo4j-driver";
import { AuthenticationError, ForbiddenError } from "./errorClasses";

/*
Permissions Enhancement
  - Permission caching
  - Dynamic permission evaluation
  - Permission inheritance/hierarchy
*/

/**
 * Permission requirement configuration
 */
export interface PermissionRequirement {
  /**
   * Require authenticated user
   */
  authenticated?: boolean;

  /**
   * Required roles (OR logic - user must have at least one)
   */
  roles?: string[];

  /**
   * Required permissions (OR logic)
   */
  permissions?: string[];

  /**
   * Ownership check configuration
   */
  ownership?: {
    /**
     * Resource type (e.g., "post", "comment")
     */
    resource: string;

    /**
     * Field containing owner ID (e.g., "authorId", "userId")
     */
    field: string;

    /**
     * Resource ID to check (optional, can be provided later)
     */
    resourceId?: string;
  };

  /**
   * Custom check function
   */
  custom?: (context: PermissionContext) => boolean | Promise<boolean>;
}

/**
 * Permission context passed to custom checks
 */
export interface PermissionContext {
  user: any;
  session: Session;
  contextData: any;
}

/**
 * Permission check result
 */
export interface PermissionResult {
  granted: boolean;
  user?: any;
  error?: any;
  reason?: string;
}

/**
 * Check permissions
 */
export async function checkPermissions(
  requirement: PermissionRequirement,
  context: {
    getUserFromSession: () => Promise<any>;
    session: Session;
    contextData: any;
  },
): Promise<PermissionResult> {
  try {
    // Get user if authenticated check is required
    let user: any = null;

    if (
      requirement.authenticated ||
      requirement.roles ||
      requirement.permissions ||
      requirement.ownership
    ) {
      user = await context.getUserFromSession();

      if (!user) {
        throw new AuthenticationError();
      }
    }

    // Check roles
    if (requirement.roles && requirement.roles.length > 0) {
      const userRoles = user.P?.roles || [];
      const hasRole = requirement.roles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRole) {
        throw new ForbiddenError(
          `Required role: ${requirement.roles.join(" or ")}`,
          {
            required: requirement.roles,
            userRoles,
          },
        );
      }
    }

    // Check permissions
    if (requirement.permissions && requirement.permissions.length > 0) {
      const userPermissions = user.P?.permissions || [];
      const hasPermission = requirement.permissions.some((perm) =>
        userPermissions.includes(perm),
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Required permission: ${requirement.permissions.join(" or ")}`,
          {
            required: requirement.permissions,
            userPermissions,
          },
        );
      }
    }

    // Check ownership
    if (requirement.ownership) {
      const { resource, field, resourceId } = requirement.ownership;

      if (!resourceId) {
        throw new Error("Resource ID must be provided for ownership check");
      }

      // Query to check ownership
      const query = `
        MATCH (resource {id: $resourceId})
        WHERE $userId IN [resource.${field}]
        RETURN count(resource) > 0 as isOwner
      `;

      const result = await context.session.run(query, {
        resourceId,
        userId: user.P.uuid || user.id,
      });

      const isOwner = result.records[0]?.get("isOwner");

      if (!isOwner) {
        throw new ForbiddenError(
          `You don't have permission to access this ${resource}`,
          {
            resource,
            resourceId,
          },
        );
      }
    }

    // Custom check
    if (requirement.custom) {
      const permissionContext: PermissionContext = {
        user,
        session: context.session,
        contextData: context.contextData,
      };

      const customResult = await requirement.custom(permissionContext);

      if (!customResult) {
        throw new ForbiddenError("Custom permission check failed");
      }
    }

    return {
      granted: true,
      user,
    };
  } catch (error) {
    return {
      granted: false,
      error,
      reason:
        error instanceof Error ? error.message : "Permission check failed",
    };
  }
}

/**
 * Require permissions (throws on failure)
 */
export async function requirePermissions(
  requirement: PermissionRequirement,
  context: {
    getUserFromSession: () => Promise<any>;
    session: Session;
    contextData: any;
  },
): Promise<{ user: any }> {
  const result = await checkPermissions(requirement, context);

  if (!result.granted) {
    if (result.error) {
      throw result.error;
    }
    throw new ForbiddenError(result.reason || "Permission denied");
  }

  return { user: result.user };
}

/**
 * Check if user has role
 */
export function hasRole(user: any, ...roles: string[]): boolean {
  const userRoles = user?.P?.roles || [];
  return roles.some((role) => userRoles.includes(role));
}

/**
 * Check if user has permission
 */
export function hasPermission(user: any, ...permissions: string[]): boolean {
  const userPermissions = user?.P?.permissions || [];
  return permissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return user?.P?.isAdmin === true || hasRole(user, "admin", "administrator");
}

/**
 * Check if user owns resource
 */
export async function isOwner(
  session: Session,
  userId: string,
  resourceId: string,
  ownerField = "userId",
): Promise<boolean> {
  const query = `
    MATCH (resource {id: $resourceId})
    WHERE $userId IN [resource.${ownerField}]
    RETURN count(resource) > 0 as isOwner
  `;

  const result = await session.run(query, { resourceId, userId });
  return result.records[0]?.get("isOwner");
}
