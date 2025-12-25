import {
  startEmailWorker,
  stopEmailWorker,
} from "~/server/queue/workers/emailWorker";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";
import { getDriver } from "~/cypher/core/driver";
import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { closeClusterCommunication } from "~/server/cluster/clusterCommunication";
import { closeDriver } from "~/cypher/core/driver";

/**
 * Worker state management
 * Platform workers are stored with subdomain = 'platform'
 * Subdomain workers are stored with their respective subdomain keys
 *
 * Uses global state to share across module instances (Vinxi creates multiple contexts)
 */
declare global {
  var __workerState:
    | {
        activeWorkers: Map<
          string,
          Map<string, { stop: (force?: boolean) => Promise<void> }>
        >;
        platformInitPromise: Promise<void> | null;
        subdomainInitPromises: Map<string, Promise<void>>;
        workerStartPromises: Map<string, Promise<any>>;
      }
    | undefined;
}

// Initialize global worker state if not exists
if (!global.__workerState) {
  global.__workerState = {
    activeWorkers: new Map<
      string,
      Map<string, { stop: () => Promise<void> }>
    >(),
    platformInitPromise: null,
    subdomainInitPromises: new Map<string, Promise<void>>(),
    workerStartPromises: new Map<string, Promise<any>>(),
  };
}

// Export reference to global state
export const workerState = global.__workerState;

/**
 * Get workers for a specific subdomain
 */
function getSubdomainWorkers(
  subdomain: string,
): Map<string, { stop: () => Promise<void> }> {
  if (!workerState.activeWorkers.has(subdomain)) {
    workerState.activeWorkers.set(subdomain, new Map());
  }
  return workerState.activeWorkers.get(subdomain)!;
}

/**
 * Core initialization logic for platform-level workers only
 * Called at app startup in middleware
 * Does NOT initialize subdomain-specific workers
 * Uses Promise-based singleton to prevent race conditions
 */
export async function initWorkersCore() {
  // If already initializing or initialized, wait for/return the same promise
  if (workerState.platformInitPromise) {
    return workerState.platformInitPromise;
  }

  // Create the initialization promise
  workerState.platformInitPromise = (async () => {
    console.log("[Workers] Starting platform-level BullMQ workers...");

    // Note: Redis check is done in middleware before calling this function
    // If we reach here, Redis should be available

    // Start platform-level workers only (currently only email worker)
    const platformWorkers = getSubdomainWorkers("platform");

    try {
      console.log("[Workers] Starting email worker...");
      await startEmailWorker();
      platformWorkers.set("emailWorker", { stop: stopEmailWorker });
      console.log("[Workers] Email worker started successfully");
    } catch (error) {
      console.error("[Workers] Failed to start email worker:", error);
    }

    /**
     * Handle graceful shutdown for all resources
     *
     * Shutdown sequence:
     * 1. Close all BullMQ workers (email, subdomain-specific workers)
     * 2. Close Neo4j driver connection pool
     *
     * This ensures:
     * - No jobs are processed during shutdown
     * - All database connections are properly closed
     * - Neo4j server is notified of client disconnect
     * - No connection leaks remain
     *
     * Called on:
     * - SIGTERM (graceful shutdown, e.g., from container orchestrator)
     * - SIGINT (Ctrl+C in terminal)
     * - Uncaught exceptions (after logging error)
     * - Unhandled promise rejections (after logging error)
     */
    const shutdown = async () => {
      console.log("[Server] ═══════════════════════════════════════════");
      console.log("[Server] Starting graceful shutdown...");
      console.log("[Server] ═══════════════════════════════════════════");

      // Step 1: Close all workers
      await closeAllWorkersForShutdown();
      console.log("[Workers] ✓ All workers stopped");

      // Step 2: Close cluster communication
      console.log("[Cluster] Closing cluster communication...");
      await closeClusterCommunication();
      console.log("[Cluster] ✓ Cluster communication closed");

      // Step 3: Close Neo4j driver connection pool
      // This releases all connections back to Neo4j server
      console.log("[Database] Closing Neo4j driver connection pool...");
      await closeDriver();
      console.log(
        "[Database] ✓ Neo4j driver closed (all connections released)",
      );

      console.log("[Server] ═══════════════════════════════════════════");
      console.log("[Server] ✓ Graceful shutdown complete");
      console.log("[Server] ═══════════════════════════════════════════");
    };

    process.on("SIGTERM", async () => {
      console.log("[Server] Received SIGTERM signal");
      await shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("[Server] Received SIGINT signal (Ctrl+C)");
      await shutdown();
      process.exit(0);
    });

    // Handle uncaught errors with cleanup
    process.on("uncaughtException", async (error) => {
      console.error("[Server] Uncaught exception:", error);
      try {
        await shutdown();
      } catch (shutdownError) {
        console.error(
          "[Server] Error during shutdown after uncaught exception:",
          shutdownError,
        );
      }
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason, promise) => {
      console.error(
        "[Server] Unhandled rejection at:",
        promise,
        "reason:",
        reason,
      );
      try {
        await shutdown();
      } catch (shutdownError) {
        console.error(
          "[Server] Error during shutdown after unhandled rejection:",
          shutdownError,
        );
      }
      process.exit(1);
    });

    console.log("[Workers] Platform-level workers started successfully");
  })();

  return workerState.platformInitPromise;
}

/**
 * Initialize subdomain-specific workers from database
 * Should be called per subdomain, not at app startup
 * Uses current subdomain from request context automatically
 * Uses Promise-based singleton per subdomain to prevent race conditions
 */
export async function initSubdomainWorkers() {
  // Get subdomain to check if already initializing
  const { dbSession: tempSession, subDomain } =
    await getDBSessionForSubdomain();
  await tempSession.close();

  // If already initializing for this subdomain, wait for/return the same promise
  if (workerState.subdomainInitPromises.has(subDomain)) {
    return workerState.subdomainInitPromises.get(subDomain)!;
  }

  // Create the initialization promise for this subdomain
  const initPromise = (async () => {
    console.log("[Workers] Starting subdomain-specific workers...");

    // Find and execute all database-defined worker functions
    const { dbSession, subDomain: currentSubdomain } =
      await getDBSessionForSubdomain();

    console.log(
      `[Workers] Initializing workers for subdomain: ${currentSubdomain}`,
    );

    // Get or create worker map for this subdomain
    const subdomainWorkers = getSubdomainWorkers(currentSubdomain);

    try {
      const query = `
        MATCH (f:Function)
        WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
        RETURN f
      `;

      const result = await dbSession.run(query);

      console.log(
        `[Workers] Found ${result.records.length} subdomain worker functions for ${currentSubdomain}`,
      );

      for (const record of result.records) {
        const functionVertex = record.get("f");
        const functionKey = functionVertex.properties.key;

        try {
          console.log(
            `[Workers] Initializing subdomain worker ${functionKey} for ${currentSubdomain}`,
          );

          const workerResult = await executeNamedServerFunction({
            functionName: functionKey,
            contextData: {
              action: "start",
            },
          });

          if (workerResult.error) {
            console.error(
              `[Workers] Failed to initialize ${functionKey}:`,
              workerResult.error,
            );
          } else {
            console.log(
              `[Workers] Successfully initialized: ${functionKey} for ${currentSubdomain}`,
            );
            // Store worker reference if the function returns a stop method
            if (workerResult.result?.stop) {
              subdomainWorkers.set(functionKey, workerResult.result);
            }
          }
        } catch (error) {
          console.error(`[Workers] Error initializing ${functionKey}:`, error);
        }
      }
    } catch (error) {
      console.error(
        "[Workers] Error finding subdomain worker functions:",
        error,
      );
    } finally {
      await dbSession.close();
    }

    console.log(
      `[Workers] Subdomain workers initialization complete for ${currentSubdomain}`,
    );
  })();

  // Store the promise
  workerState.subdomainInitPromises.set(subDomain, initPromise);

  return initPromise;
}

/**
 * Initialize workers for a specific subdomain without request context
 * Used for auto-starting workers on app startup and subdomain creation
 */
export async function initSubdomainWorkersForSubdomain(subdomain: string) {
  // If already initializing for this subdomain, wait for/return the same promise
  if (workerState.subdomainInitPromises.has(subdomain)) {
    return workerState.subdomainInitPromises.get(subdomain)!;
  }

  // Create the initialization promise for this subdomain
  const initPromise = (async () => {
    console.log(
      `[Workers] Starting subdomain-specific workers for: ${subdomain}`,
    );

    const driver = await getDriver();
    const dbSession = driver.session({ database: subdomain });

    // Get or create worker map for this subdomain
    const subdomainWorkers = getSubdomainWorkers(subdomain);

    try {
      const query = `
        MATCH (f:Function)
        WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
        RETURN f
      `;

      const result = await dbSession.run(query);

      console.log(
        `[Workers] Found ${result.records.length} worker functions for ${subdomain}`,
      );

      for (const record of result.records) {
        const functionVertex = record.get("f");
        const functionKey = functionVertex.properties.key;

        try {
          console.log(
            `[Workers] Initializing worker ${functionKey} for ${subdomain}`,
          );

          const workerResult = await executeNamedServerFunctionCore(
            {
              functionName: functionKey,
              contextData: {
                action: "start",
              },
            },
            {
              dbSession: dbSession,
              functionLookupSession: dbSession,
              subDomain: subdomain,
              nodes: {},
              relationships: {},
              vertexes: undefined as any,
            },
          );

          if (workerResult.error) {
            console.error(
              `[Workers] Failed to initialize ${functionKey} for ${subdomain}:`,
              workerResult.error,
            );
          } else {
            console.log(
              `[Workers] Successfully initialized: ${functionKey} for ${subdomain}`,
            );
            // Store worker reference if the function returns a stop method
            if (workerResult.result?.stop) {
              subdomainWorkers.set(functionKey, workerResult.result);
            }
          }
        } catch (error) {
          console.error(
            `[Workers] Error initializing ${functionKey} for ${subdomain}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        `[Workers] Error finding worker functions for ${subdomain}:`,
        error,
      );
    } finally {
      await dbSession.close();
    }

    console.log(`[Workers] Worker initialization complete for ${subdomain}`);
  })();

  // Store the promise
  workerState.subdomainInitPromises.set(subdomain, initPromise);

  return initPromise;
}

/**
 * Initialize workers for all subdomains
 * Called at app startup to auto-start all subdomain workers
 */
export async function initAllSubdomainWorkers() {
  console.log("[Workers] Initializing workers for all subdomains...");

  const driver = await getDriver();
  const dbSession = driver.session({ database: "admin" });

  try {
    // Get all subdomains from the admin database
    const result = await dbSession.run(`
      MATCH (s:SubDomain)
      RETURN s.key as subdomain
      ORDER BY s.key
    `);

    const subdomains = result.records.map((record) => record.get("subdomain"));

    console.log(
      `[Workers] Found ${subdomains.length} subdomains: ${subdomains.join(", ")}`,
    );

    // Initialize workers for each subdomain in parallel
    await Promise.all(
      subdomains.map((subdomain) =>
        initSubdomainWorkersForSubdomain(subdomain),
      ),
    );

    console.log(
      `[Workers] All subdomain workers initialized successfully (${subdomains.length} subdomains)`,
    );
  } catch (error) {
    console.error(
      "[Workers] Error initializing workers for all subdomains:",
      error,
    );
  } finally {
    await dbSession.close();
  }
}

/**
 * Close all active workers for current subdomain
 * Automatically gets the current subdomain from request context
 */
export async function closeAllWorkers() {
  // Get current subdomain from request context
  const { dbSession, subDomain } = await getDBSessionForSubdomain();
  await dbSession.close();

  // Close workers only for the current subdomain
  const subdomainWorkers = workerState.activeWorkers.get(subDomain);

  if (subdomainWorkers) {
    console.log(`[Workers] Stopping all workers for subdomain: ${subDomain}`);
    for (const [workerName, worker] of subdomainWorkers.entries()) {
      try {
        console.log(
          `[Workers] Stopping worker: ${workerName} (subdomain: ${subDomain})`,
        );
        await worker.stop();

        // Clean up individual worker start promise
        const workerStartKey = `${subDomain}:${workerName}`;
        workerState.workerStartPromises.delete(workerStartKey);
      } catch (error) {
        console.error(`[Workers] Error stopping ${workerName}:`, error);
      }
    }
    subdomainWorkers.clear();
    workerState.activeWorkers.delete(subDomain);
    // Clean up the initialization promise so workers can be reinitialized
    workerState.subdomainInitPromises.delete(subDomain);
    console.log(`[Workers] All workers stopped for subdomain: ${subDomain}`);
  } else {
    console.log(`[Workers] No workers found for subdomain: ${subDomain}`);
  }
}

/**
 * Close all workers for all subdomains (for graceful shutdown)
 */
export async function closeAllWorkersForShutdown() {
  console.log("[Workers] Stopping all workers for all subdomains (shutdown)");
  for (const [
    subdomainKey,
    subdomainWorkers,
  ] of workerState.activeWorkers.entries()) {
    console.log(`[Workers] Stopping workers for subdomain: ${subdomainKey}`);
    for (const [workerName, worker] of subdomainWorkers.entries()) {
      try {
        console.log(
          `[Workers] Stopping worker: ${workerName} (subdomain: ${subdomainKey})`,
        );
        await worker.stop();
      } catch (error) {
        console.error(`[Workers] Error stopping ${workerName}:`, error);
      }
    }
  }
  workerState.activeWorkers.clear();
  // Clear all subdomain initialization promises
  workerState.subdomainInitPromises.clear();
  // Clear all worker start promises
  workerState.workerStartPromises.clear();
  console.log("[Workers] All workers stopped for all subdomains");
}

/**
 * Stop all workers for a specific subdomain (internal use)
 * Used when deleting a subdomain
 * @param subdomain - The subdomain key
 * @param force - If true, forces immediate shutdown without waiting for active jobs to complete
 */
export async function stopWorkersForSubdomain(
  subdomain: string,
  force = false,
) {
  const subdomainWorkers = workerState.activeWorkers.get(subdomain);

  if (!subdomainWorkers) {
    console.log(`[Workers] No workers found for subdomain: ${subdomain}`);
    return;
  }

  console.log(
    `[Workers] Stopping all workers for subdomain: ${subdomain}${force ? " (force)" : ""}`,
  );

  for (const [workerName, worker] of subdomainWorkers.entries()) {
    try {
      console.log(
        `[Workers] Stopping worker: ${workerName} (subdomain: ${subdomain})${force ? " (force)" : ""}`,
      );
      await worker.stop(force);

      // Clean up individual worker start promise
      const workerStartKey = `${subdomain}:${workerName}`;
      workerState.workerStartPromises.delete(workerStartKey);
    } catch (error) {
      console.error(`[Workers] Error stopping ${workerName}:`, error);
    }
  }

  subdomainWorkers.clear();
  workerState.activeWorkers.delete(subdomain);
  // Clean up the initialization promise
  workerState.subdomainInitPromises.delete(subdomain);

  console.log(`[Workers] All workers stopped for subdomain: ${subdomain}`);
}
