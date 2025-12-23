import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { runMigration } from "~/lib/schema/runMigration";
import type { Vertex } from "~/lib/graph/type/vertex";

async function validateUserAndPermissions(
  request: Request,
  dbSession: Session,
): Promise<Vertex> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  return user;
}

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

    // Parse query parameters
    const url = new URL(request.url);
    const functionName = url.searchParams.get("functionName");
    const dryRunParam = url.searchParams.get("dryRun");
    const dryRun = dryRunParam === "true" || dryRunParam === "1";

    // Parse additional context data from query params (if any)
    const contextData: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "functionName" && key !== "dryRun") {
        // Try to parse as JSON, otherwise use as string
        try {
          contextData[key] = JSON.parse(value);
        } catch {
          contextData[key] = value;
        }
      }
    }

    // Run migration using common function
    const migrationResult = await runMigration(dbSession, subDomain, user, {
      functionName: functionName || undefined,
      dryRun,
      contextData,
    });

    if (!migrationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: migrationResult.error,
          functionName: migrationResult.functionName,
          dryRun: migrationResult.dryRun,
        }),
        {
          status: migrationResult.status || 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration completed successfully${dryRun ? " (dry run)" : ""}`,
        data: migrationResult.data,
        functionName: migrationResult.functionName,
        dryRun: migrationResult.dryRun,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
