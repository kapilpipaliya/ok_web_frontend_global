import {startEmailWorker, stopEmailWorker} from "~/server/queue/workers/emailWorker";
import {getDBSessionForSubdomain} from "~/cypher/session/getSessionForSubdomain";
import {executeNamedServerFunction} from "~/cypher/get/executeNamedServerFunction";

/**
 * Worker state management
 * Platform workers are stored with subdomain = 'platform'
 * Subdomain workers are stored with their respective subdomain keys
 */
export const workerState = {
  initialized: false,
  activeWorkers: new Map<string, Map<string, { stop: () => Promise<void> }>>()
};

/**
 * Get workers for a specific subdomain
 */
function getSubdomainWorkers(subdomain: string): Map<string, { stop: () => Promise<void> }> {
  if (!workerState.activeWorkers.has(subdomain)) {
    workerState.activeWorkers.set(subdomain, new Map());
  }
  return workerState.activeWorkers.get(subdomain)!;
}

/**
 * Core initialization logic for platform-level workers only
 * Called at app startup in middleware
 * Does NOT initialize subdomain-specific workers
 */
export async function initWorkersCore() {
  if (workerState.initialized) {
    console.log('[Workers] Platform-level workers already initialized');
    return;
  }

  console.log('[Workers] Starting platform-level BullMQ workers...');

  // Note: Redis check is done in middleware before calling this function
  // If we reach here, Redis should be available

  // Start platform-level workers only (currently only email worker)
  const platformWorkers = getSubdomainWorkers('platform');

  try {
    console.log('[Workers] Starting email worker...');
    await startEmailWorker();
    platformWorkers.set('emailWorker', {stop: stopEmailWorker});
    console.log('[Workers] Email worker started successfully');
  } catch (error) {
    console.error('[Workers] Failed to start email worker:', error);
  }

  workerState.initialized = true;

  // Handle graceful shutdown for all workers (platform and all subdomains)
  const shutdown = async () => {
    console.log('[Workers] Shutting down gracefully...');
    await closeAllWorkersForShutdown();
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

  console.log('[Workers] Platform-level workers started successfully');
}

/**
 * Initialize subdomain-specific workers from database
 * Should be called per subdomain, not at app startup
 * Uses current subdomain from request context automatically
 */
export async function initSubdomainWorkers() {
  console.log('[Workers] Starting subdomain-specific workers...');

  // Find and execute all database-defined worker functions
  const {dbSession, subDomain} = await getDBSessionForSubdomain();

  console.log(`[Workers] Initializing workers for subdomain: ${subDomain}`);

  // Get or create worker map for this subdomain
  const subdomainWorkers = getSubdomainWorkers(subDomain);

  try {
    const query = `
      MATCH (f:Function)
      WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
      RETURN f
    `;

    const result = await dbSession.run(query);

    console.log(`[Workers] Found ${result.records.length} subdomain worker functions for ${subDomain}`);

    for (const record of result.records) {
      const functionVertex = record.get('f');
      const functionKey = functionVertex.properties.key;

      try {
        console.log(`[Workers] Initializing subdomain worker ${functionKey} for ${subDomain}`);

        const workerResult = await executeNamedServerFunction({
          functionName: functionKey,
          contextData: {
            action: 'start'
          }
        });

        if (workerResult.error) {
          console.error(`[Workers] Failed to initialize ${functionKey}:`, workerResult.error);
        } else {
          console.log(`[Workers] Successfully initialized: ${functionKey} for ${subDomain}`);
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
    console.error('[Workers] Error finding subdomain worker functions:', error);
  } finally {
    await dbSession.close();
  }

  console.log(`[Workers] Subdomain workers initialization complete for ${subDomain}`);
}

/**
 * Close all active workers for current subdomain
 * Automatically gets the current subdomain from request context
 */
export async function closeAllWorkers() {
  // Get current subdomain from request context
  const {dbSession, subDomain} = await getDBSessionForSubdomain();
  await dbSession.close();

  // Close workers only for the current subdomain
  const subdomainWorkers = workerState.activeWorkers.get(subDomain);

  if (subdomainWorkers) {
    console.log(`[Workers] Stopping all workers for subdomain: ${subDomain}`);
    for (const [workerName, worker] of subdomainWorkers.entries()) {
      try {
        console.log(`[Workers] Stopping worker: ${workerName} (subdomain: ${subDomain})`);
        await worker.stop();
      } catch (error) {
        console.error(`[Workers] Error stopping ${workerName}:`, error);
      }
    }
    subdomainWorkers.clear();
    workerState.activeWorkers.delete(subDomain);
    console.log(`[Workers] All workers stopped for subdomain: ${subDomain}`);
  } else {
    console.log(`[Workers] No workers found for subdomain: ${subDomain}`);
  }
}

/**
 * Close all workers for all subdomains (for graceful shutdown)
 */
export async function closeAllWorkersForShutdown() {
  console.log('[Workers] Stopping all workers for all subdomains (shutdown)');
  for (const [subdomainKey, subdomainWorkers] of workerState.activeWorkers.entries()) {
    console.log(`[Workers] Stopping workers for subdomain: ${subdomainKey}`);
    for (const [workerName, worker] of subdomainWorkers.entries()) {
      try {
        console.log(`[Workers] Stopping worker: ${workerName} (subdomain: ${subdomainKey})`);
        await worker.stop();
      } catch (error) {
        console.error(`[Workers] Error stopping ${workerName}:`, error);
      }
    }
  }
  workerState.activeWorkers.clear();
  console.log('[Workers] All workers stopped for all subdomains');
}