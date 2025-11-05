/**
 * Initialize BullMQ Workers in the Same Process
 *
 * This module provides functions for managing workers.
 * Platform-level workers (like email worker) are managed automatically.
 * Subdomain-specific workers can be managed via the Worker Management UI.
 */

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";
import {
  closeAllWorkers,
  initSubdomainWorkers,
  workerState,
} from "~/server/queue/initWorkersCore";

/**
 * Initialize subdomain-specific workers from database
 * This starts only subdomain workers defined in the database
 * Uses current subdomain from request context automatically
 */
export async function initSubdomainWorkersUI() {
  "use server";
  return await initSubdomainWorkers();
}

/**
 * Stop subdomain workers for current subdomain
 */
export async function stopWorkers() {
  "use server";

  await closeAllWorkers();
  console.log("[Workers] Stopped all workers for current subdomain");
}

/**
 * Get list of subdomain-specific worker functions only
 * Platform-level workers (like emailWorker) are not included
 */
export async function getWorkerList() {
  "use server";

  const workers = [];

  // Get database-defined subdomain workers
  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  // Get workers for current subdomain
  const subdomainWorkers = workerState.activeWorkers.get(subDomain);

  try {
    const query = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
      RETURN f.key as key, f.description as description
      ORDER BY f.key
    `;

    const result = await dbSession.run(query);

    const dbWorkers = result.records.map((record) => ({
      key: record.get("key"),
      description: record.get("description"),
      active: subdomainWorkers?.has(record.get("key")),
      type: "subdomain",
    }));

    workers.push(...dbWorkers);
  } catch (error) {
    console.error("[Workers] Error getting worker list:", error);
  } finally {
    await dbSession.close();
  }

  return workers;
}

/**
 * Start a specific subdomain worker
 * Platform-level workers cannot be started from the UI
 * Uses Promise-based singleton to prevent duplicate starts
 */
export async function startWorker(workerKey: string) {
  "use server";

  try {
    // Prevent managing platform-level workers from UI
    if (workerKey === "emailWorker") {
      return {
        success: false,
        error:
          "Platform-level workers are managed automatically and cannot be controlled from the UI",
      };
    }

    // Get current subdomain
    const { subDomain } = await getDBSessionForSubdomain();

    // Check if worker is already running
    const subdomainWorkers = workerState.activeWorkers.get(subDomain);
    if (subdomainWorkers?.has(workerKey)) {
      return {
        success: false,
        error: "Worker is already running",
      };
    }

    // Create unique key for this worker start operation
    const workerStartKey = `${subDomain}:${workerKey}`;

    // Check if already starting this worker
    if (workerState.workerStartPromises.has(workerStartKey)) {
      // Wait for the existing start operation to complete
      return await workerState.workerStartPromises.get(workerStartKey)!;
    }

    // Create the start promise
    const startPromise = (async () => {
      console.log(
        `[Workers] Starting subdomain worker: ${workerKey} for subdomain: ${subDomain}`,
      );

      // Get or create worker map for this subdomain
      const workers = workerState.activeWorkers.get(subDomain) || new Map();
      if (!workerState.activeWorkers.has(subDomain)) {
        workerState.activeWorkers.set(subDomain, workers);
      }

      // Handle database-defined subdomain workers
      const workerResult = await executeNamedServerFunction({
        functionName: workerKey,
        contextData: {
          action: "start",
        },
      });

      if (workerResult.error) {
        console.error(
          `[Workers] Failed to start ${workerKey}:`,
          workerResult.error,
        );
        return { success: false, error: workerResult.error };
      }

      // Store worker reference if the function returns a stop method
      if (workerResult.result?.stop) {
        workers.set(workerKey, workerResult.result);
      }

      console.log(
        `[Workers] Successfully started: ${workerKey} for subdomain: ${subDomain}`,
      );
      return { success: true };
    })();

    // Store the promise
    workerState.workerStartPromises.set(workerStartKey, startPromise);

    // Wait for completion
    const result = await startPromise;

    // Clean up the promise after completion (success or failure)
    workerState.workerStartPromises.delete(workerStartKey);

    return result;
  } catch (error: any) {
    console.error(`[Workers] Error starting ${workerKey}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Stop a specific worker from current subdomain
 */
export async function stopWorker(workerKey: string) {
  "use server";

  // Get current subdomain
  const { subDomain } = await getDBSessionForSubdomain();

  const subdomainWorkers = workerState.activeWorkers.get(subDomain);
  const worker = subdomainWorkers?.get(workerKey);

  if (!worker) {
    return {
      success: false,
      error: `Worker not found or not running in subdomain: ${subDomain}`,
    };
  }

  try {
    console.log(
      `[Workers] Stopping worker: ${workerKey} for subdomain: ${subDomain}`,
    );
    await worker.stop();
    subdomainWorkers!.delete(workerKey);

    // Clean up the start promise tracking for this worker
    const workerStartKey = `${subDomain}:${workerKey}`;
    workerState.workerStartPromises.delete(workerStartKey);

    // If no more workers in this subdomain, remove the subdomain entry
    if (subdomainWorkers!.size === 0) {
      workerState.activeWorkers.delete(subDomain);
    }

    console.log(
      `[Workers] Successfully stopped: ${workerKey} for subdomain: ${subDomain}`,
    );
    return { success: true };
  } catch (error: any) {
    console.error(`[Workers] Error stopping ${workerKey}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Get worker status for current subdomain
 */
export async function getWorkerStatus() {
  "use server";

  const { subDomain } = await getDBSessionForSubdomain();
  const workers = await getWorkerList();

  // Get active workers count for this subdomain
  const subdomainWorkers = workerState.activeWorkers.get(subDomain);
  const activeWorkersCount = subdomainWorkers?.size || 0;

  // Check if any workers are running for this subdomain
  const initialized = activeWorkersCount > 0;

  return {
    initialized,
    enabled: true,
    totalWorkers: workers.length,
    activeWorkers: activeWorkersCount,
    workers,
  };
}
