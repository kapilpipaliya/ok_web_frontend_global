import type { APIEvent } from "@solidjs/start/server";
import type { ManagedTransaction, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getAllDatabases } from "~/cypher/mutate/manage/getAllDatabases";
import { subdomainRegister } from "~/cypher/mutate/signup/subdomainRegister";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateDatabaseName } from "~/lib/validation/validateDatabaseName";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { getWebsiteSchemasSync } from "~/page_schema/loader";
import { createAppState } from "~/createAppState";
import { getDriver } from "~/cypher/core/driver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { initSubdomainWorkersForSubdomain } from "~/server/queue/initWorkersCore";
import { importSchemas } from "~/lib/schema/importSchemas";
import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { broadcastStartWorkers } from "~/server/cluster/clusterCommunication";
import { runMigration } from "~/lib/schema/runMigration";

// Reserved subdomain keys that cannot be used
const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "system", // 'system' database name is not available in neo4j
  "api",
  // "www",
  "app",
  "dashboard",
  "login",
  "signin",
  "auth",
  "support",
  "help",
  "mail",
  "email",
  "blog",
  "static",
  "docs",
  "billing",
  "payment",
  "test",
  "dev",
  "staging",
  "neo4j",
]);

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    if (subDomain !== ADMIN_DB_NAME) {
      throw new APIError(
        "Unauthorized. System subdomain access required.",
        403,
      );
    }

    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { domain, key, description } = await request.json();

    // Get the user's account
    const accountResult = await dbSession.run(
      `
      MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
      RETURN a
    `,
      { uuid: user.P.uuid },
    );

    if (accountResult.records.length === 0) {
      throw new APIError("Account not found", 404);
    }

    const account = convertNodeToJson(accountResult.records[0].get("a"));

    const databaseNameError = validateDatabaseName(key);
    if (databaseNameError) {
      throw new APIError(databaseNameError, 400);
    }

    const databases = await getAllDatabases();
    if (databases.includes(key)) {
      throw new APIError("Subdomain with this key already exists", 400);
    }

    // Use write transaction for atomicity - prevents race conditions
    const newSubdomain = await dbSession.executeWrite(async (tx) => {
      // Validate within transaction to prevent race conditions
      await validateKeyAndDomain(tx, key, domain);

      // Create subdomain
      const subdomain = await createSubdomain(tx, key, domain, description);

      // Create AccountSubdomain relationship in same transaction
      await createAccountSubdomainRelation(tx, account.id, subdomain.id);

      return subdomain;
    });

    await createActivityLog(
      dbSession,
      "subdomain_create",
      "SubDomain",
      newSubdomain.id,
      user.P.email,
      `Created subdomain ${key} with domain ${domain}${description ? ` and description "${description}"` : ""}`,
    );

    // @ts-expect-error ignore
    await subdomainRegister(dbSession, {
      ...user.P,
      password: "",
      subDomain: key,
    });

    // Automatically import schemas for the new subdomain
    await importSchemasForSubdomain(key, user);

    // Run initial seed function if it exists
    try {
      await runSeedFunction(key, user);
    } catch (error) {
      console.error(
        `[Subdomain Create] Failed to run seed function for subdomain: ${key}`,
        error,
      );
      // Don't throw - seed function failure shouldn't block subdomain creation
    }

    // Run migrations after seed function
    try {
      await runMigrationForSubdomain(key, user);
    } catch (error) {
      console.error(
        `[Subdomain Create] Failed to run migration for subdomain: ${key}`,
        error,
      );
      // Don't throw - migration failure shouldn't block subdomain creation
    }

    // Start all workers for the subdomain on ALL cluster nodes
    console.log(
      `[Subdomain Create] Starting workers for subdomain: ${key} on all nodes`,
    );

    // Start workers on this node
    try {
      await initSubdomainWorkersForSubdomain(key);
      console.log(
        `[Subdomain Create] Workers initialized on current node for subdomain: ${key}`,
      );
    } catch (error) {
      console.error(
        `[Subdomain Create] Failed to initialize workers on current node for subdomain: ${key}`,
        error,
      );
      // Don't throw - worker initialization failure shouldn't block subdomain creation
    }

    // Broadcast start command to all other cluster nodes
    try {
      const result = await broadcastStartWorkers(key, undefined, 10000); // subdomain, workerKey (undefined = all), timeout

      if (result.totalNodes > 0) {
        console.log(
          `[Subdomain Create] Workers started on ${result.respondedNodes}/${result.totalNodes} node(s) in ${result.duration}ms`,
        );

        if (result.errors.size > 0) {
          console.warn(
            "[Subdomain Create] Some nodes failed to start workers:",
            Array.from(result.errors.entries()),
          );
        }

        if (result.timedOutNodes > 0) {
          console.warn(
            `[Subdomain Create] ${result.timedOutNodes} node(s) did not respond in time`,
          );
        }
      } else {
        console.log(
          "[Subdomain Create] No other nodes in cluster, skipping broadcast",
        );
      }
    } catch (error) {
      // Log error but don't fail subdomain creation
      console.error(
        "[Subdomain Create] Error during worker start broadcast:",
        error,
      );
      console.log(
        "[Subdomain Create] Subdomain created successfully despite broadcast error",
      );
    }

    return {
      graph: {
        edges: {},
        vertexes: { [newSubdomain.id]: newSubdomain },
      },
      result: newSubdomain,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function validateKeyAndDomain(
  tx: Transaction | ManagedTransaction,
  key: string,
  domain: string,
) {
  // Check if subdomain key is reserved
  const lowerKey = key.toLowerCase();
  if (RESERVED_SUBDOMAINS.has(lowerKey)) {
    throw new APIError(
      `'${key}' is a reserved subdomain key and cannot be used`,
      400,
    );
  }

  const existingKey = await tx.run("MATCH (s:SubDomain {key: $key}) RETURN s", {
    key,
  });
  if (existingKey.records.length > 0) {
    throw new APIError("Subdomain with this key already exists", 400);
  }

  if (domain) {
    const existingDomain = await tx.run(
      "MATCH (s:SubDomain {domain: $domain}) RETURN s",
      { domain },
    );
    if (existingDomain.records.length > 0) {
      throw new APIError("Domain name is already taken", 400);
    }
  }
}

async function createSubdomain(
  tx: Transaction | ManagedTransaction,
  key: string,
  domain?: string,
  description?: string,
) {
  const result = await tx.run(
    `CREATE (s:SubDomain {
      key: $key,
      domain: $domain,
      description: $description,
      status: "active",
      createdAt: datetime(),
      lastModified: datetime()
    }) RETURN s`,
    {
      key,
      domain: domain || "",
      description: description || "",
    },
  );
  return convertNodeToJson(result.records[0]?.get("s"));
}

async function createAccountSubdomainRelation(
  tx: Transaction | ManagedTransaction,
  accountId: string,
  subdomainId: string,
) {
  await tx.run(
    `
    MATCH (a:Account), (s:SubDomain)
    WHERE elementId(a) = $accountId AND elementId(s) = $subdomainId
    CREATE (a)-[:AccountSubdomain]->(s)
  `,
    {
      accountId,
      subdomainId,
    },
  );
}

async function runSeedFunction(
  subdomainKey: string,
  user: Vertex,
): Promise<void> {
  console.log(
    `[Subdomain Create] Checking for seed function in subdomain: ${subdomainKey}`,
  );

  const driver = await getDriver();
  const dbSession = driver.session({ database: subdomainKey });

  try {
    // Check if a seed function exists
    const query = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'seed' OR f.key = 'initialSeed'
      RETURN f.key as functionKey
      ORDER BY f.key
      LIMIT 1
    `;

    const result = await dbSession.run(query);

    if (result.records.length === 0) {
      console.log(
        `[Subdomain Create] No seed function found for subdomain: ${subdomainKey}`,
      );
      return;
    }

    const seedFunctionKey = result.records[0].get("functionKey");
    console.log(
      `[Subdomain Create] Found seed function: ${seedFunctionKey}, executing...`,
    );

    // Execute the seed function
    const seedResult = await executeNamedServerFunctionCore(
      {
        functionName: seedFunctionKey,
        contextData: {
          subdomainKey,
          user: {
            id: user.id,
            email: user.P.email,
            uuid: user.P.uuid,
          },
        },
      },
      {
        dbSession: dbSession,
        subDomain: subdomainKey,
        functionLookupSession: dbSession,
        nodes: {},
        relationships: {},
        vertexes: undefined as any,
      },
    );

    if (seedResult.error) {
      console.error(
        `[Subdomain Create] Seed function failed: ${seedResult.error}`,
      );
      // Don't throw - seed function failure shouldn't block subdomain creation
    } else {
      console.log(
        `[Subdomain Create] Seed function executed successfully for subdomain: ${subdomainKey}`,
      );
    }
  } catch (error) {
    console.error(
      `[Subdomain Create] Error running seed function for subdomain: ${subdomainKey}`,
      error,
    );
    // Don't throw - seed function failure shouldn't block subdomain creation
  } finally {
    await dbSession.close();
  }
}

async function runMigrationForSubdomain(
  subdomainKey: string,
  user: Vertex,
): Promise<void> {
  console.log(
    `[Subdomain Create] Running migrations for subdomain: ${subdomainKey}...`,
  );

  const driver = await getDriver();
  const dbSession = driver.session({ database: subdomainKey });

  try {
    const migrationResult = await runMigration(dbSession, subdomainKey, user, {
      dryRun: false,
    });

    if (migrationResult.functionName) {
      console.log(
        `[Subdomain Create] Migration executed: ${migrationResult.functionName}, success: ${migrationResult.success}`,
      );
      if (migrationResult.error) {
        console.error(
          `[Subdomain Create] Migration error: ${migrationResult.error}`,
        );
      }
    } else {
      console.log(
        `[Subdomain Create] No migration function found for subdomain: ${subdomainKey}`,
      );
    }
  } catch (error) {
    console.error(
      `[Subdomain Create] Error running migration for subdomain: ${subdomainKey}`,
      error,
    );
    // Don't throw - migration failure shouldn't block subdomain creation
  } finally {
    await dbSession.close();
  }
}

async function importSchemasForSubdomain(
  subdomainKey: string,
  user: Vertex,
): Promise<void> {
  console.log(
    `[Subdomain Create] Starting schema import for subdomain: ${subdomainKey}`,
  );

  // Load schemas for the subdomain
  const websiteSchemas = getWebsiteSchemasSync(subdomainKey);

  // If no schemas found, try loading from default website
  if (
    !(
      websiteSchemas.components ||
      websiteSchemas.pages ||
      websiteSchemas.themes ||
      websiteSchemas.functions
    )
  ) {
    console.log(
      `[Subdomain Create] No schemas found for ${subdomainKey}, trying default...`,
    );
    const defaultSchemas = getWebsiteSchemasSync("default");

    if (
      !(
        defaultSchemas.components ||
        defaultSchemas.pages ||
        defaultSchemas.themes ||
        defaultSchemas.functions
      )
    ) {
      console.log(
        `[Subdomain Create] No schemas found for ${subdomainKey} or default, skipping import`,
      );
      return;
    }

    // Use default schemas
    return await importSchemasToDatabase(
      subdomainKey,
      defaultSchemas,
      user,
      "default",
    );
  }

  // Import subdomain-specific schemas
  await importSchemasToDatabase(
    subdomainKey,
    websiteSchemas,
    user,
    subdomainKey,
  );
}

async function importSchemasToDatabase(
  subdomainKey: string,
  websiteSchemas: ReturnType<typeof getWebsiteSchemasSync>,
  user: Vertex,
  websiteName: string,
): Promise<void> {
  const driver = await getDriver();
  const dbSession = driver.session({ database: subdomainKey });

  try {
    const tx = dbSession.beginTransaction();

    try {
      // Create a new graph state for import
      const [graph, setGraph] = createAppState();

      // Import all schemas using shared library function
      const stats = await importSchemas(websiteSchemas, tx, graph, setGraph);

      // Log the import activity
      let activityMessage = `Imported ${stats.importedItems.length} schemas from website: ${websiteName}. Total vertices: ${stats.totalVertices}, Total edges: ${stats.totalEdges}`;
      if (stats.activatedTheme) {
        activityMessage += `. Activated theme: ${stats.activatedTheme}`;
      }
      await createActivityLog(
        tx,
        "schema_import",
        "Schema",
        websiteName,
        user.P.email,
        activityMessage,
      );

      await tx.commit();

      console.log(
        `[Subdomain Create] Successfully imported ${stats.importedItems.length} schemas for subdomain: ${subdomainKey}`,
      );
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } finally {
    await dbSession.close();
  }
}
