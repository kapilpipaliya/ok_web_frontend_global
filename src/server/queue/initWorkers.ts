/**
 * Initialize BullMQ Workers in the Same Process
 *
 * This module starts workers within the main application process.
 * Workers are always enabled and can be managed via the Worker Management UI.
 */

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";

let workersInitialized = false;
let activeWorkers: Map<string, { stop: () => Promise<void> }> = new Map();

/**
 * Initialize workers
 */
export async function initWorkers() {
  "use server"

  if (workersInitialized) {
    console.log('[Workers] Already initialized');
    return;
  }

  console.log('[Workers] Starting BullMQ workers in-process...');

  // Find and execute all worker functions
  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const query = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
      RETURN f
    `;

    const result = await dbSession.run(query);

    console.log(`[Workers] Found ${result.records.length} worker functions`);

    for (const record of result.records) {
      const functionVertex = record.get('f');
      const functionKey = functionVertex.properties.key;

      try {
        console.log(`[Workers] Initializing worker: ${functionKey}`);

        const workerResult = await executeNamedServerFunction({
          functionName: functionKey,
          contextData: {
            action: 'start'
          }
        });

        if (workerResult.error) {
          console.error(`[Workers] Failed to initialize ${functionKey}:`, workerResult.error);
        } else {
          console.log(`[Workers] Successfully initialized: ${functionKey}`);
          // Store worker reference if the function returns a stop method
          if (workerResult.result?.stop) {
            activeWorkers.set(functionKey, workerResult.result);
          }
        }
      } catch (error) {
        console.error(`[Workers] Error initializing ${functionKey}:`, error);
      }
    }
  } catch (error) {
    console.error('[Workers] Error finding worker functions:', error);
  } finally {
    await dbSession.close();
  }

  workersInitialized = true;

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('[Workers] Shutting down gracefully...');
    await closeAllWorkers();
    console.log('[Workers] Shutdown complete');
  };

  process.on('SIGTERM', async () => {
    await shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await shutdown();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('[Workers] Uncaught exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Workers] Unhandled rejection at:', promise, 'reason:', reason);
  });

  console.log('[Workers] Started successfully');
}

/**
 * Stop workers (useful for testing)
 */
export async function stopWorkers() {
  "use server"
  if (!workersInitialized) {
    return;
  }

  await closeAllWorkers();
  workersInitialized = false;
  console.log('[Workers] Stopped');
}

/**
 * Close all active workers
 */
async function closeAllWorkers() {
  for (const [workerName, worker] of activeWorkers.entries()) {
    try {
      console.log(`[Workers] Stopping worker: ${workerName}`);
      await worker.stop();
    } catch (error) {
      console.error(`[Workers] Error stopping ${workerName}:`, error);
    }
  }
  activeWorkers.clear();
}

/**
 * Get list of all worker functions
 */
export async function getWorkerList() {
  "use server"
  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const query = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
      RETURN f.key as key, f.description as description
      ORDER BY f.key
    `;

    const result = await dbSession.run(query);

    return result.records.map(record => ({
      key: record.get('key'),
      description: record.get('description'),
      active: activeWorkers.has(record.get('key'))
    }));
  } catch (error) {
    console.error('[Workers] Error getting worker list:', error);
    return [];
  } finally {
    await dbSession.close();
  }
}

/**
 * Start a specific worker
 */
export async function startWorker(workerKey: string) {
  "use server"

  try {
    console.log(`[Workers] Starting worker: ${workerKey}`);

    const workerResult = await executeNamedServerFunction({
      functionName: workerKey,
      contextData: {
        action: 'start'
      }
    });

    if (workerResult.error) {
      console.error(`[Workers] Failed to start ${workerKey}:`, workerResult.error);
      return { success: false, error: workerResult.error };
    }

    // Store worker reference if the function returns a stop method
    if (workerResult.result?.stop) {
      activeWorkers.set(workerKey, workerResult.result);
    }

    console.log(`[Workers] Successfully started: ${workerKey}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Workers] Error starting ${workerKey}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Stop a specific worker
 */
export async function stopWorker(workerKey: string) {
  "use server"

  const worker = activeWorkers.get(workerKey);

  if (!worker) {
    return { success: false, error: 'Worker not found or not running' };
  }

  try {
    console.log(`[Workers] Stopping worker: ${workerKey}`);
    await worker.stop();
    activeWorkers.delete(workerKey);
    console.log(`[Workers] Successfully stopped: ${workerKey}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Workers] Error stopping ${workerKey}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Get worker status
 */
export async function getWorkerStatus() {
  "use server"

  const workers = await getWorkerList();

  return {
    initialized: workersInitialized,
    enabled: true,
    totalWorkers: workers.length,
    activeWorkers: activeWorkers.size,
    workers
  };
}
