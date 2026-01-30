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
import { initializeWorkersIfNeeded } from "~/server/initWorkersOnStartup";
import {
  broadcastStartWorkers,
  broadcastStopWorkers,
  getClusterWorkerStatus as getClusterWorkerStatusFromCluster,
  getActiveNodes,
  getCurrentNode,
} from "~/server/cluster/clusterCommunication";

/**
 * Initialize subdomain-specific workers from database
 * This starts only subdomain workers defined in the database
 * Uses current subdomain from request context automatically
 * Broadcasts to all cluster nodes
 */
export async function initSubdomainWorkersUI() {
  "use server";

  const { subDomain } = await getDBSessionForSubdomain();

  // Initialize workers on current node
  const localResult = await initSubdomainWorkers();

  // Broadcast to other cluster nodes
  try {
    await initializeWorkersIfNeeded();

    const broadcastResult = await broadcastStartWorkers(
      subDomain,
      undefined,
      10000,
    );

    if (broadcastResult.totalNodes > 0) {
      console.log(
        `[Workers] Init broadcast: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded in ${broadcastResult.duration}ms`,
      );

      if (broadcastResult.errors.size > 0) {
        console.warn(
          "[Workers] Some nodes failed to init workers:",
          Array.from(broadcastResult.errors.entries()),
        );
      }
    }
  } catch (error) {
    console.error("[Workers] Error broadcasting worker init:", error);
    // Continue - local init succeeded
  }

  return localResult;
}

/**
 * Stop subdomain workers for current subdomain
 * Broadcasts to all cluster nodes
 */
export async function stopWorkers() {
  "use server";

  const { subDomain } = await getDBSessionForSubdomain();

  // Stop workers on current node
  await closeAllWorkers();
  console.log("[Workers] Stopped all workers for current subdomain");

  // Broadcast to other cluster nodes
  try {
    await initializeWorkersIfNeeded();

    const broadcastResult = await broadcastStopWorkers(
      subDomain,
      undefined,
      10000,
    );

    if (broadcastResult.totalNodes > 0) {
      console.log(
        `[Workers] Stop broadcast: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded in ${broadcastResult.duration}ms`,
      );

      if (broadcastResult.errors.size > 0) {
        console.warn(
          "[Workers] Some nodes failed to stop workers:",
          Array.from(broadcastResult.errors.entries()),
        );
      }
    }
  } catch (error) {
    console.error("[Workers] Error broadcasting worker stop:", error);
    // Continue - local stop succeeded
  }
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
 * Core function to start a worker for a specific subdomain
 * Used internally and by cluster handlers
 */
export async function startWorkerForSubdomainCore(
  subDomain: string,
  workerKey: string,
) {
  "use server";
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

    // Create session for subdomain
    const subdomainDbSession = (await getDriver()).session({
      database: subDomain,
    });

      try {
        // Handle database-defined subdomain workers
        // Look up the function in the target subdomain's DB (where worker functions are defined)
        const workerResult = await executeNamedServerFunction(
          {
            functionName: workerKey,
            contextData: {
              action: "start",
            },
          },
          {
            dbSession: subdomainDbSession,
            subDomain: subDomain,
            functionLookupSession: subdomainDbSession,
          },
        );

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
    } finally {
      await subdomainDbSession.close();
    }
  })();

  // Store the promise
  workerState.workerStartPromises.set(workerStartKey, startPromise);

  // Wait for completion
  const result = await startPromise;

  // Clean up the promise after completion (success or failure)
  workerState.workerStartPromises.delete(workerStartKey);

  return result;
}

/**
 * Start a specific subdomain worker
 * Platform-level workers cannot be started from the UI
 * Uses Promise-based singleton to prevent duplicate starts
 * Broadcasts to all cluster nodes
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

    // Start worker on current node
    const localResult = await startWorkerForSubdomainCore(subDomain, workerKey);

    if (!localResult.success) {
      return localResult;
    }

    // Broadcast to other cluster nodes
    try {
      await initializeWorkersIfNeeded();

      const broadcastResult = await broadcastStartWorkers(
        subDomain,
        workerKey,
        10000,
      );

      if (broadcastResult.totalNodes > 0) {
        console.log(
          `[Workers] Start worker broadcast: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded in ${broadcastResult.duration}ms`,
        );

        if (broadcastResult.errors.size > 0) {
          console.warn(
            "[Workers] Some nodes failed to start worker:",
            Array.from(broadcastResult.errors.entries()),
          );
        }
      }
    } catch (error) {
      console.error("[Workers] Error broadcasting worker start:", error);
      // Continue - local start succeeded
    }

    return localResult;
  } catch (error: any) {
    console.error(`[Workers] Error starting ${workerKey}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Stop a specific worker from current subdomain
 * Broadcasts to all cluster nodes
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

    // Broadcast to other cluster nodes
    try {
      await initializeWorkersIfNeeded();

      const broadcastResult = await broadcastStopWorkers(
        subDomain,
        workerKey,
        10000,
      );

      if (broadcastResult.totalNodes > 0) {
        console.log(
          `[Workers] Stop worker broadcast: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded in ${broadcastResult.duration}ms`,
        );

        if (broadcastResult.errors.size > 0) {
          console.warn(
            "[Workers] Some nodes failed to stop worker:",
            Array.from(broadcastResult.errors.entries()),
          );
        }
      }
    } catch (error) {
      console.error("[Workers] Error broadcasting worker stop:", error);
      // Continue - local stop succeeded
    }

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
          const active = subdomainWorkers?.has(key);

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
    console.error(
      "[Workers] Error getting all subdomain worker status:",
      error,
    );
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
        // Look up the function in the target subdomain's DB (where worker functions are defined)
        const workerResult = await executeNamedServerFunction(
          {
            functionName: workerKey,
            contextData: {
              action: "start",
            },
          },
          {
            dbSession: targetDbSession,
            subDomain: targetSubdomain,
            functionLookupSession: targetDbSession,
          },
        );

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
 * Broadcasts to all cluster nodes
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

    // Initialize on current node
    await initAllSubdomainWorkers();

    // Get list of all subdomains to broadcast
    const subdomainResult = await dbSession.run(`
      MATCH (s:SubDomain)
      RETURN s.key as subdomain
      ORDER BY s.key
    `);

    const subdomains = subdomainResult.records.map((record) =>
      record.get("subdomain"),
    );

    // Broadcast to other cluster nodes for each subdomain
    try {
      await initializeWorkersIfNeeded();

      // Broadcast init for each subdomain
      for (const sd of subdomains) {
        if (sd === "admin") continue; // Skip admin

        try {
          const broadcastResult = await broadcastStartWorkers(
            sd,
            undefined,
            10000,
          );

          if (broadcastResult.totalNodes > 0) {
            console.log(
              `[Workers] Init all workers broadcast for ${sd}: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded`,
            );
          }
        } catch (error) {
          console.error(`[Workers] Error broadcasting init for ${sd}:`, error);
        }
      }
    } catch (error) {
      console.error("[Workers] Error broadcasting init all workers:", error);
      // Continue - local init succeeded
    }

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
 * Broadcasts to all cluster nodes
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

    // Get list of subdomains to broadcast before stopping
    const subdomainsToStop: string[] = [];
    for (const [subdomainKey] of workerState.activeWorkers.entries()) {
      if (subdomainKey !== "platform") {
        subdomainsToStop.push(subdomainKey);
      }
    }

    // Stop all workers across all subdomains on current node
    for (const [
      subdomainKey,
      subdomainWorkers,
    ] of workerState.activeWorkers.entries()) {
      // Skip platform workers
      if (subdomainKey === "platform") continue;

      console.log(
        `[Workers] Stopping all workers for subdomain: ${subdomainKey}`,
      );
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

    // Broadcast to other cluster nodes for each subdomain
    try {
      await initializeWorkersIfNeeded();

      // Broadcast stop for each subdomain
      for (const sd of subdomainsToStop) {
        try {
          const broadcastResult = await broadcastStopWorkers(
            sd,
            undefined,
            10000,
          );

          if (broadcastResult.totalNodes > 0) {
            console.log(
              `[Workers] Stop all workers broadcast for ${sd}: ${broadcastResult.respondedNodes}/${broadcastResult.totalNodes} nodes responded`,
            );
          }
        } catch (error) {
          console.error(`[Workers] Error broadcasting stop for ${sd}:`, error);
        }
      }
    } catch (error) {
      console.error("[Workers] Error broadcasting stop all workers:", error);
      // Continue - local stop succeeded
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Workers] Error stopping all subdomain workers:", error);
    return { success: false, error: error.message };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get cluster-wide worker status from all nodes (Admin only)
 * Aggregates worker status from all nodes in the cluster
 * Shows ALL configured workers with their status (running/stopped)
 */
export async function getClusterWorkerStatus() {
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

    // Ensure cluster communication is initialized
    await initializeWorkersIfNeeded();

    // Get worker status from all cluster nodes
    const result = await getClusterWorkerStatusFromCluster(undefined, 5000); // 5 second timeout

    // Get active nodes info
    const nodes = await getActiveNodes();
    const currentNode = getCurrentNode();

    // First, get ALL configured workers from each subdomain database
    const subdomainResult = await dbSession.run(`
      MATCH (s:SubDomain)
      RETURN s.key as subdomain
      ORDER BY s.key
    `);

    const subdomains = subdomainResult.records.map((record) =>
      record.get("subdomain"),
    );

    // Map to store all configured workers per subdomain
    const subdomainMap = new Map<
      string,
      {
        subdomain: string;
        workers: Array<{
          workerKey: string;
          nodeId: string;
          hostname: string;
          status: string;
        }>;
        configuredWorkers: Set<string>; // All configured worker keys
      }
    >();

    // Query each subdomain database for configured workers
    for (const subdomainKey of subdomains) {
      if (subdomainKey === "admin") continue; // Skip admin

      const subdomainDbSession = (await getDriver()).session({
        database: subdomainKey,
      });

      try {
        const workerQuery = `
          MATCH (f:Function)
          WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
          RETURN f.key as key
          ORDER BY f.key
        `;

        const workerResult = await subdomainDbSession.run(workerQuery);
        const configuredWorkers = new Set<string>(
          workerResult.records.map((record) => record.get("key")),
        );

        subdomainMap.set(subdomainKey, {
          subdomain: subdomainKey,
          workers: [],
          configuredWorkers,
        });
      } finally {
        await subdomainDbSession.close();
      }
    }

    // Process responses from all nodes and mark running workers
    for (const [nodeId, response] of result.responses.entries()) {
      for (const worker of response.workers) {
        const subdomainData = subdomainMap.get(worker.subdomain);
        if (!subdomainData) continue;

        subdomainData.workers.push({
          workerKey: worker.workerKey,
          nodeId: response.nodeInfo.nodeId,
          hostname: response.nodeInfo.hostname,
          status: worker.status,
        });
      }
    }

    // Add local node workers (if not already included in responses)
    if (currentNode) {
      for (const [
        subdomainKey,
        workers,
      ] of workerState.activeWorkers.entries()) {
        if (subdomainKey === "platform") continue;

        const subdomainData = subdomainMap.get(subdomainKey);
        if (!subdomainData) continue;

        for (const [workerKey] of workers.entries()) {
          // Check if this worker is already in the list (from cluster response)
          const alreadyExists = subdomainData.workers.some(
            (w) => w.workerKey === workerKey && w.nodeId === currentNode.nodeId,
          );

          if (!alreadyExists) {
            subdomainData.workers.push({
              workerKey,
              nodeId: currentNode.nodeId,
              hostname: currentNode.hostname,
              status: "running",
            });
          }
        }
      }
    }

    // Now add stopped workers for each subdomain
    // For each configured worker that's not running, add it with "stopped" status
    for (const [subdomainKey, subdomainData] of subdomainMap.entries()) {
      for (const workerKey of subdomainData.configuredWorkers) {
        const hasRunningInstance = subdomainData.workers.some(
          (w) => w.workerKey === workerKey,
        );

        if (!hasRunningInstance) {
          // Add a stopped entry
          subdomainData.workers.push({
            workerKey,
            nodeId: "-",
            hostname: "-",
            status: "stopped",
          });
        }
      }

      // Sort workers by key for consistent display
      subdomainData.workers.sort((a, b) =>
        a.workerKey.localeCompare(b.workerKey),
      );
    }

    // Convert map to array, removing the configuredWorkers set
    const subdomainWorkers = Array.from(subdomainMap.values()).map(
      ({ subdomain, workers }) => ({
        subdomain,
        workers,
      }),
    );

    return {
      success: true,
      data: {
        nodes,
        currentNode,
        subdomains: subdomainWorkers,
        clusterResult: {
          // result.totalNodes only counts OTHER nodes (excludes current node)
          // Add 1 to include the current node in the total
          totalNodes: result.totalNodes + 1,
          respondedNodes: result.respondedNodes + 1,
          timedOutNodes: result.timedOutNodes,
          duration: result.duration,
        },
      },
    };
  } catch (error: any) {
    console.error("[Workers] Error getting cluster worker status:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get all active nodes in the cluster (Admin only)
 */
export async function getClusterNodes() {
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

    // Ensure cluster communication is initialized
    await initializeWorkersIfNeeded();

    const nodes = await getActiveNodes();
    const currentNode = getCurrentNode();

    return {
      success: true,
      data: {
        nodes,
        currentNode,
        totalNodes: nodes.length,
      },
    };
  } catch (error: any) {
    console.error("[Workers] Error getting cluster nodes:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get cluster-wide worker status for the current subdomain
 * Shows workers from all nodes for this specific subdomain
 */
export async function getSubdomainClusterWorkerStatus() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (!subDomain || subDomain === "admin") {
      return {
        success: false,
        error: "This function is not available for the admin subdomain",
      };
    }

    // Ensure cluster communication is initialized
    await initializeWorkersIfNeeded();

    // Get worker status from all cluster nodes for this subdomain
    const result = await getClusterWorkerStatusFromCluster(subDomain, 5000); // 5 second timeout

    // Get active nodes info
    const nodes = await getActiveNodes();
    const currentNode = getCurrentNode();

    // Collect workers for this subdomain from all nodes
    const workers: Array<{
      key: string;
      description: string;
      active: boolean;
      nodeId: string;
      hostname: string;
    }> = [];

    // Get worker definitions from database
    const workerQuery = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
      RETURN f.key as key, f.description as description
      ORDER BY f.key
    `;

    const workerResult = await dbSession.run(workerQuery);

    // Create a map of worker keys to their definitions
    const workerDefMap = new Map(
      workerResult.records.map((record) => [
        record.get("key"),
        record.get("description") || "",
      ]),
    );

    // Track which nodes have which workers active
    const activeWorkersOnNodes = new Map<string, Set<string>>(); // workerKey -> Set<nodeId>

    // Process responses from all nodes
    for (const [nodeId, response] of result.responses.entries()) {
      for (const worker of response.workers) {
        if (worker.subdomain === subDomain) {
          if (!activeWorkersOnNodes.has(worker.workerKey)) {
            activeWorkersOnNodes.set(worker.workerKey, new Set());
          }
          activeWorkersOnNodes
            .get(worker.workerKey)!
            .add(response.nodeInfo.nodeId);
        }
      }
    }

    // Add local node workers (if not already included in responses)
    if (currentNode) {
      const localWorkers = workerState.activeWorkers.get(subDomain);
      if (localWorkers) {
        for (const [workerKey] of localWorkers.entries()) {
          if (!activeWorkersOnNodes.has(workerKey)) {
            activeWorkersOnNodes.set(workerKey, new Set());
          }
          activeWorkersOnNodes.get(workerKey)!.add(currentNode.nodeId);
        }
      }
    }

    // Build workers array with all defined workers and their node information
    for (const [workerKey, description] of workerDefMap.entries()) {
      const nodesWithWorker = activeWorkersOnNodes.get(workerKey);
      const isActive = nodesWithWorker && nodesWithWorker.size > 0;

      if (isActive && nodesWithWorker) {
        // Create an entry for each node running this worker
        for (const nodeId of nodesWithWorker) {
          const node = nodes.find((n) => n.nodeId === nodeId) || currentNode;
          workers.push({
            key: workerKey,
            description,
            active: true,
            nodeId: nodeId,
            hostname: node?.hostname || "unknown",
          });
        }
      } else {
        // Worker is not active on any node
        workers.push({
          key: workerKey,
          description,
          active: false,
          nodeId: "-",
          hostname: "-",
        });
      }
    }

    // Calculate stats
    const totalWorkers = workerDefMap.size;
    const activeWorkerKeys = new Set(
      workers.filter((w) => w.active).map((w) => w.key),
    );
    const activeWorkers = activeWorkerKeys.size;

    // Check if workers are initialized (at least one worker is running)
    const initialized = workers.some((w) => w.active);

    return {
      success: true,
      data: {
        initialized,
        enabled: true, // Always enabled for subdomains
        totalWorkers,
        activeWorkers,
        workers,
        nodes: nodes.filter((n) =>
          Array.from(activeWorkersOnNodes.values()).some((nodeSet) =>
            nodeSet.has(n.nodeId),
          ),
        ),
        currentNode,
        clusterInfo: {
          // result.totalNodes only counts OTHER nodes (excludes current node)
          // Add 1 to include the current node in the total
          totalNodes: result.totalNodes + 1,
          respondedNodes: result.respondedNodes + 1,
          timedOutNodes: result.timedOutNodes,
          duration: result.duration,
        },
      },
    };
  } catch (error: any) {
    console.error(
      "[Workers] Error getting subdomain cluster worker status:",
      error,
    );
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}
