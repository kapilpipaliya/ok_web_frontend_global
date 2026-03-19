import type { Session } from "neo4j-driver";
import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { getDriver } from "~/cypher/core/driver";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface MigrationOptions {
  functionName?: string;
  dryRun?: boolean;
  contextData?: Record<string, any>;
  /**
   * Optional: app subdomain; when provided, used for discovering the migration function
   * (lookup in this database, execution is still against the target database subDomain).
   */
  appSubDomain?: string;
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
    appSubDomain,
  } = options;

  // Define functionLookupSession at the highest scope so it's available throughout the function
  // including in the finally block for cleanup
  let functionLookupSession: Session | undefined;
  let migrationFunctionKey: string;
  let needToCloseSession = false;

  try {
    // Determine the database to use for function lookup
    const lookupDb = appSubDomain || subDomain;
    console.log(
      `[Schema Migrate] Using subdomain for function lookup: ${lookupDb}, target: ${subDomain}`,
    );

    // If lookupDb is the same as the target subDomain, reuse dbSession.
    // Otherwise, open a temporary session to the lookupDb.
    if (lookupDb === subDomain) {
      functionLookupSession = dbSession;
    } else {
      const driver = await getDriver();
      functionLookupSession = driver.session({ database: lookupDb });
      needToCloseSession = true; // Remember to close this session later
    }

    // Determine the function key to use
    if (functionName) {
      // Use provided function name
      migrationFunctionKey = functionName;
      console.log(
        `[Schema Migrate] Using provided function name: ${migrationFunctionKey}`,
      );
    } else {
      // Auto-detect migration function
      const query = `
        MATCH (f:Function)
        WHERE f.key CONTAINS 'migrate' OR f.key CONTAINS 'migration'
        RETURN f.key as functionKey
        ORDER BY f.key
        LIMIT 1
      `;

      const result = await functionLookupSession!.run(query);

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
        functionLookupSession: functionLookupSession,
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
  } finally {
    // Clean up - only close the lookup session if we opened a separate one
    if (needToCloseSession && functionLookupSession) {
      await functionLookupSession.close();
    }
  }
}
