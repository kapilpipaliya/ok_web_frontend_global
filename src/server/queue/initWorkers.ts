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
  initAllSubdomainWorkers,
} from "~/server/queue/initWorkersCore";
import { getDriver } from "~/cypher/core/driver";

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

/**
 * Get worker status for all subdomains (Admin only)
 * Only accessible from 'admin' subdomain
 */
export async function getAllSubdomainWorkerStatus() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    // Only allow from admin subdomain
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    // Get all subdomains
    const subdomainResult = await dbSession.run(`
      MATCH (s:SubDomain)
      RETURN s.key as subdomain, s.name as name
      ORDER BY s.key
    `);

    const subdomains = subdomainResult.records.map((record) => ({
      key: record.get("subdomain"),
      name: record.get("name") || record.get("subdomain"),
    }));

    // Get workers for each subdomain
    const subdomainWorkerStatus = [];

    for (const subdomain of subdomains) {
      const subdomainDbSession = (await getDriver()).session({
        database: subdomain.key,
      });

      try {
        // Get worker functions for this subdomain
        const workerQuery = `
          MATCH (f:Function)
          WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
          RETURN f.key as key, f.description as description
          ORDER BY f.key
        `;

        const workerResult = await subdomainDbSession.run(workerQuery);

        const workers = workerResult.records.map((record) => {
          const key = record.get("key");
          const subdomainWorkers = workerState.activeWorkers.get(subdomain.key);
          const active = subdomainWorkers?.has(key) || false;

          return {
            key,
            description: record.get("description"),
            active,
          };
        });

        const subdomainWorkers = workerState.activeWorkers.get(subdomain.key);
        const activeCount = subdomainWorkers?.size || 0;

        subdomainWorkerStatus.push({
          subdomain: subdomain.key,
          name: subdomain.name,
          totalWorkers: workers.length,
          activeWorkers: activeCount,
          workers,
        });
      } finally {
        await subdomainDbSession.close();
      }
    }

    return {
      success: true,
      data: subdomainWorkerStatus,
    };
  } catch (error: any) {
    console.error("[Workers] Error getting all subdomain worker status:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Start a worker for a specific subdomain (Admin only)
 */
export async function startWorkerForSubdomain(
  targetSubdomain: string,
  workerKey: string,
) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    // Only allow from admin subdomain
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    // Prevent managing platform-level workers
    if (workerKey === "emailWorker") {
      return {
        success: false,
        error: "Platform-level workers cannot be controlled from the UI",
      };
    }

    // Check if worker is already running
    const subdomainWorkers = workerState.activeWorkers.get(targetSubdomain);
    if (subdomainWorkers?.has(workerKey)) {
      return {
        success: false,
        error: "Worker is already running",
      };
    }

    // Create unique key for this worker start operation
    const workerStartKey = `${targetSubdomain}:${workerKey}`;

    // Check if already starting this worker
    if (workerState.workerStartPromises.has(workerStartKey)) {
      return await workerState.workerStartPromises.get(workerStartKey)!;
    }

    // Create the start promise
    const startPromise = (async () => {
      console.log(
        `[Workers] Starting worker: ${workerKey} for subdomain: ${targetSubdomain}`,
      );

      // Get or create worker map for this subdomain
      const workers =
        workerState.activeWorkers.get(targetSubdomain) || new Map();
      if (!workerState.activeWorkers.has(targetSubdomain)) {
        workerState.activeWorkers.set(targetSubdomain, workers);
      }

      // Create session for target subdomain
      const targetDbSession = (await getDriver()).session({
        database: targetSubdomain,
      });

      try {
        const workerResult = await executeNamedServerFunction({
          functionName: workerKey,
          contextData: {
            action: "start",
          },
        }, {
          dbSession: targetDbSession,
          subDomain: targetSubdomain,
        });

        if (workerResult.error) {
          console.error(
            `[Workers] Failed to start ${workerKey} for ${targetSubdomain}:`,
            workerResult.error,
          );
          return { success: false, error: workerResult.error };
        }

        // Store worker reference if the function returns a stop method
        if (workerResult.result?.stop) {
          workers.set(workerKey, workerResult.result);
        }

        console.log(
          `[Workers] Successfully started: ${workerKey} for subdomain: ${targetSubdomain}`,
        );
        return { success: true };
      } finally {
        await targetDbSession.close();
      }
    })();

    // Store the promise
    workerState.workerStartPromises.set(workerStartKey, startPromise);

    // Wait for completion
    const result = await startPromise;

    // Clean up the promise after completion
    workerState.workerStartPromises.delete(workerStartKey);

    return result;
  } catch (error: any) {
    console.error(
      `[Workers] Error starting ${workerKey} for ${targetSubdomain}:`,
      error,
    );
    return { success: false, error: error.message };
  } finally {
    await dbSession.close();
  }
}

/**
 * Stop a worker for a specific subdomain (Admin only)
 */
export async function stopWorkerForSubdomain(
  targetSubdomain: string,
  workerKey: string,
) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    // Only allow from admin subdomain
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const subdomainWorkers = workerState.activeWorkers.get(targetSubdomain);
    const worker = subdomainWorkers?.get(workerKey);

    if (!worker) {
      return {
        success: false,
        error: `Worker not found or not running in subdomain: ${targetSubdomain}`,
      };
    }

    console.log(
      `[Workers] Stopping worker: ${workerKey} for subdomain: ${targetSubdomain}`,
    );
    await worker.stop();
    subdomainWorkers!.delete(workerKey);

    // Clean up the start promise tracking for this worker
    const workerStartKey = `${targetSubdomain}:${workerKey}`;
    workerState.workerStartPromises.delete(workerStartKey);

    // If no more workers in this subdomain, remove the subdomain entry
    if (subdomainWorkers!.size === 0) {
      workerState.activeWorkers.delete(targetSubdomain);
    }

    console.log(
      `[Workers] Successfully stopped: ${workerKey} for subdomain: ${targetSubdomain}`,
    );
    return { success: true };
  } catch (error: any) {
    console.error(
      `[Workers] Error stopping ${workerKey} for ${targetSubdomain}:`,
      error,
    );
    return { success: false, error: error.message };
  } finally {
    await dbSession.close();
  }
}

/**
 * Initialize all workers for all subdomains (Admin only)
 */
export async function initAllSubdomainWorkersUI() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    // Only allow from admin subdomain
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    await initAllSubdomainWorkers();
    return { success: true };
  } catch (error: any) {
    console.error("[Workers] Error initializing all subdomain workers:", error);
    return { success: false, error: error.message };
  } finally {
    await dbSession.close();
  }
}

/**
 * Stop all workers for all subdomains (Admin only)
 */
export async function stopAllSubdomainWorkersUI() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    // Only allow from admin subdomain
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    // Stop all workers across all subdomains
    for (const [subdomainKey, subdomainWorkers] of workerState.activeWorkers.entries()) {
      // Skip platform workers
      if (subdomainKey === "platform") continue;

      console.log(`[Workers] Stopping all workers for subdomain: ${subdomainKey}`);
      for (const [workerName, worker] of subdomainWorkers.entries()) {
        try {
          console.log(
            `[Workers] Stopping worker: ${workerName} (subdomain: ${subdomainKey})`,
          );
          await worker.stop();

          // Clean up individual worker start promise
          const workerStartKey = `${subdomainKey}:${workerName}`;
          workerState.workerStartPromises.delete(workerStartKey);
        } catch (error) {
          console.error(`[Workers] Error stopping ${workerName}:`, error);
        }
      }
      subdomainWorkers.clear();
      workerState.activeWorkers.delete(subdomainKey);
      // Clean up the initialization promise
      workerState.subdomainInitPromises.delete(subdomainKey);
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Workers] Error stopping all subdomain workers:", error);
    return { success: false, error: error.message };
  } finally {
    await dbSession.close();
  }
}
