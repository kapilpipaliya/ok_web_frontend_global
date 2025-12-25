import type { Session } from "neo4j-driver";
import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { getDriver } from "~/cypher/core/driver";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface MigrationOptions {
  functionName?: string;
  dryRun?: boolean;
  contextData?: Record<string, any>;
  /**
   * Optional: database (subdomain) to use for discovering the migration function.
   * If provided, the migration function key will be looked up in this database,
   * but executed against the target database (subDomain passed to runMigration).
   */
  migrationSubDomain?: string;
}

export interface MigrationResult {
  success: boolean;
  error?: string;
  status?: number;
  data?: any;
  functionName?: string;
  dryRun?: boolean;
}

/**
 * Common function to run migrations
 *
 * @param dbSession - Database session
 * @param subDomain - Subdomain name
 * @param user - User vertex
 * @param options - Migration options
 * @returns Migration result object
 */
export async function runMigration(
  dbSession: Session,
  subDomain: string,
  user: Vertex,
  options: MigrationOptions = {},
): Promise<MigrationResult> {
  const {
    functionName,
    dryRun = false,
    contextData = {},
    migrationSubDomain,
  } = options;

  try {
    let migrationFunctionKey: string;

    if (functionName) {
      // Use provided function name
      migrationFunctionKey = functionName;
    } else {
      // Auto-detect migration function. We can optionally look it up in a
      // different database than the target execution database.
      const lookupDb = migrationSubDomain || subDomain;
      console.log(
        `[Schema Migrate] Checking for migration function in subdomain (lookupDb: ${lookupDb}, targetDb: ${subDomain})`,
      );

      const query = `
        MATCH (f:Function)
        WHERE f.key CONTAINS 'migrate' OR f.key CONTAINS 'migration'
        RETURN f.key as functionKey
        ORDER BY f.key
        LIMIT 1
      `;

      // If lookupDb is the same as the target subDomain, reuse dbSession.
      // Otherwise, open a temporary session to the lookupDb.
      let lookupSession: Session | undefined;
      try {
        if (lookupDb === subDomain) {
          lookupSession = dbSession;
        } else {
          const driver = await getDriver();
          lookupSession = driver.session({ database: lookupDb });
        }

        const result = await lookupSession.run(query);

        if (result.records.length === 0) {
          return {
            success: false,
            error: `No migration function found for subdomain: ${lookupDb}`,
            status: 404,
          };
        }

        migrationFunctionKey = result.records[0].get("functionKey");
        console.log(
          `[Schema Migrate] Found migration function: ${migrationFunctionKey} (lookupDb: ${lookupDb}, targetDb: ${subDomain})`,
        );
      } finally {
        // Only close the lookup session if we opened a separate one
        if (lookupSession && lookupSession !== dbSession) {
          await lookupSession.close();
        }
      }
    }

    // Prepare context data for the migration function
    const migrationContextData = {
      subdomainKey: subDomain,
      user: {
        id: user.id,
        email: user.P.email,
        uuid: user.P.uuid,
      },
      dryRun,
      ...contextData,
    };

    console.log(
      `[Schema Migrate] Executing migration function: ${migrationFunctionKey} (dryRun: ${dryRun})`,
    );

    // Execute the migration function
    const migrationResult = await executeNamedServerFunctionCore(
      {
        functionName: migrationFunctionKey,
        contextData: migrationContextData,
      },
      {
        dbSession: dbSession,
        functionLookupSession: dbSession,
        subDomain: subDomain,
        nodes: {},
        relationships: {},
        vertexes: undefined as any,
      },
    );

    if (migrationResult.error) {
      console.error(
        `[Schema Migrate] Migration function failed: ${migrationResult.error}`,
      );
      return {
        success: false,
        error: `Migration failed: ${migrationResult.error}`,
        status: 500,
        functionName: migrationFunctionKey,
        dryRun,
      };
    }

    console.log(
      `[Schema Migrate] Migration function executed successfully for subdomain: ${subDomain}`,
    );

    return {
      success: true,
      data: migrationResult.result || migrationResult,
      functionName: migrationFunctionKey,
      dryRun,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Schema Migrate] Error: ${errorMessage}`, error);
    return {
      success: false,
      error: errorMessage,
      status: 500,
    };
  }
}
