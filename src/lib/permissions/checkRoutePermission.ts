import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getUserPermissionsByUuid } from "~/cypher/permissions/getUserPermissionsByUuid";
import { getSubDomain } from "~/cypher/session/getSubDomain";
import { validateUrlAccess } from "~/lib/permissions/validateUrlAccess";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import type { PermissionCheckResult } from "./type/types";

/**
 * Common function to check if a user has permission to access a specific route
 * This can be used anywhere in the application, not just in middleware
 *
 * @param request The request object (optional)
 * @param path The path to check permissions for
 * @param host The host header value (optional, will use request host if not provided)
 * @returns A promise resolving to the permission check result
 */
export async function checkRoutePermission(
  request?: Request,
  path?: string,
  host?: string,
): Promise<PermissionCheckResult> {
  "use server";
  try {
    // If no path provided and request exists, extract path from request URL
    if (!path && request) {
      const url = new URL(request.url);
      path = url.pathname;
    }

    // If no path available, return access denied
    if (!path) {
      return {
        hasPermission: false,
        message: "No path specified for permission check",
      };
    }

    // Special case for setup endpoint
    if (path === "/api/setup/superUserSetup") {
      return { hasPermission: true };
    }

    // Get subdomain information
    const hostValue = host || request?.headers.get("host") || "";
    const { subdomain } = await getSubDomain(hostValue);
    const isSuperSubDomain = subdomain === SYSTEM_DB_NAME;

    // Get user from session
    const sessionUser = await getUserFromSession(request);

    // Get user permissions by UUID if user exists
    let userWithPermissions;
    if (sessionUser?.P?.uuid) {
      userWithPermissions = await getUserPermissionsByUuid(
        sessionUser.P.uuid,
        request,
      );
    }

    // Validate if the user has permission to access this URL
    return validateUrlAccess(userWithPermissions, path, isSuperSubDomain);
  } catch (error) {
    console.error("Error checking route permission:", error);
    return {
      hasPermission: false,
      message: "Error checking permissions",
    };
  }
}
