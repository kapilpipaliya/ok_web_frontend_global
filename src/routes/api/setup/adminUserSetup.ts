import type { APIEvent } from "@solidjs/start/server";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { setupAdminUser } from "~/cypher/mutate/manage/setupAdminUser";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { performSchemaImport } from "~/lib/schema/performSchemaImport";
import { initSubdomainWorkersForSubdomain } from "~/server/queue/initWorkersCore";

export async function GET({ request: _request }: APIEvent) {
  try {
    const { error, status, user } = await setupAdminUser();

    if (error) {
      throw new APIError(error, status);
    }

    if (!user) {
      throw new APIError("Admin user setup returned no user", 500);
    }

    // Same filesystem → graph import as /api/schema/import (admin website schemas)
    let schemaImport: Record<string, unknown> | undefined;
    const driver = await getDriver();
    const dbSession = driver.session({ database: ADMIN_DB_NAME });
    try {
      console.log(
        `[Admin Setup] Importing schemas for database: ${ADMIN_DB_NAME}`,
      );
      schemaImport = await performSchemaImport({
        dbSession,
        subDomain: ADMIN_DB_NAME,
        user,
        filterOnly: false,
        includeComponentKeys: [],
        includePageKeys: [],
        includeFunctionKeys: [],
        currentShop: null,
      });
      console.log(
        `[Admin Setup] Schema import completed for database: ${ADMIN_DB_NAME}`,
      );
    } catch (schemaError) {
      console.error("[Admin Setup] Schema import failed:", schemaError);
      throw new APIError(
        `Admin user created but schema import failed: ${
          schemaError instanceof Error
            ? schemaError.message
            : String(schemaError)
        }`,
        500,
      );
    } finally {
      await dbSession.close();
    }

    // Start admin workers (e.g. backgroundBackupDatabase) now that Functions exist
    try {
      await initSubdomainWorkersForSubdomain(ADMIN_DB_NAME);
      console.log(
        `[Admin Setup] Workers initialized for database: ${ADMIN_DB_NAME}`,
      );
    } catch (workerError) {
      console.error("[Admin Setup] Failed to initialize admin workers:", workerError);
    }

    return {
      graph: {
        edges: {},
        vertexes: { [user.id]: user },
      },
      result: user,
      schemaImport,
    };
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
