import type { APIEvent } from "@solidjs/start/server";

import { getWebsiteSchemasSync } from "~/page_schema/loader";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { createAppState } from "~/createAppState";
import type { Vertex } from "~/lib/graph/type/vertex";
import {
  deleteExistingItems,
  importSchemas,
  buildSuccessResponse,
  createSchemaImportActivityLog,
} from "~/lib/schema/importSchemas";
import { runMigration } from "~/lib/schema/runMigration";
import type { Session, Transaction } from "neo4j-driver";

async function validateUserAndPermissions(
  request: Request,
  dbSession: Session | Transaction,
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

    // Use subdomain as website name
    const websiteName = subDomain;

    // Load schemas for the specific website
    const websiteSchemas = getWebsiteSchemasSync(websiteName);

    if (
      !(
        websiteSchemas.components ||
        websiteSchemas.pages ||
        websiteSchemas.themes ||
        websiteSchemas.functions
      )
    ) {
      throw new APIError(`No schemas found for website: ${websiteName}`, 404);
    }

    // Start transaction for entire operation (delete + import)
    const tx = dbSession.beginTransaction();
    try {
      // Delete existing items within the transaction
      const deletedItems = await deleteExistingItems(tx, websiteSchemas, user);

      // Create a new graph state for import
      const [graph, setGraph] = createAppState();

      // Import all schemas
      const stats = await importSchemas(websiteSchemas, tx, graph, setGraph);

      // Merge deleted items into stats
      stats.deletedItems = deletedItems;

      // Log the import activity
      await createSchemaImportActivityLog(
        tx,
        websiteName,
        user.P.email,
        stats,
        deletedItems,
      );

      await tx.commit();

      // Build response
      const response = buildSuccessResponse(
        websiteName,
        stats,
        deletedItems,
        websiteSchemas,
      );

      // Run migrations after schema import
      console.log("[Schema Import] Running migrations after import...");
      const migrationResult = await runMigration(dbSession, subDomain, user, {
        dryRun: false,
      });

      // Add migration result to response if migration was attempted
      if (migrationResult.functionName) {
        return new Response(
          JSON.stringify({
            ...response,
            migration: {
              success: migrationResult.success,
              functionName: migrationResult.functionName,
              error: migrationResult.error,
              data: migrationResult.data,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
