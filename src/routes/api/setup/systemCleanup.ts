import type { APIEvent } from "@solidjs/start/server";

import { getDriver } from "~/cypher/core/driver";
import { validateSuperUser } from "~/cypher/permissions/validateSuperUser";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

// Important security notes:
// This is a destructive operation that cannot be undone
// The endpoint should only be accessible in development/controlled environments
// Consider adding additional security measures like API keys or specific environment checks
export async function GET({ request }: APIEvent) {
  try {
    // Validate that the request is from a super user
    const isValid = await validateSuperUser(request);
    if (!isValid) {
      throw new APIError("Unauthorized access", 403);
    }

    const driver = await getDriver();
    const session = driver.session({ database: "system" });

    try {
      // Get all databases
      const result = await session.run("SHOW DATABASES");
      const databases = result.records.map((record) => record.get("name"));

      // Delete each database except system and neo4j
      const deletedDatabases = [];
      for (const dbName of databases) {
        if (dbName !== "system" && dbName !== "neo4j") {
          await session.run(`DROP DATABASE ${dbName} IF EXISTS`);
          deletedDatabases.push(dbName);
        }
      }

      return {
        deletedDatabases,
        message: "System cleanup completed successfully",
        success: true,
      };
    } finally {
      await session.close();
    }
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}
