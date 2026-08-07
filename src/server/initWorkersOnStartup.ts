/**
 * Worker Initialization at Startup
 *
 * This module initializes workers when the server starts.
 * It checks Redis availability first and only starts workers if Redis is running.
 *
 * Platform BullMQ workers (email send, schema-jobs, settings/logos→shops sync) are
 * registered inside `initWorkersCore()` — invoked below after Redis is healthy.
 */
import { checkRedisConnection } from "~/server/queue/checkRedis";
import {
  initAllSubdomainWorkers,
  initWorkersCore,
} from "~/server/queue/initWorkersCore";
import { initClusterCommunication } from "~/server/cluster/clusterCommunication";
// Use global shared state to prevent duplicate initialization across module instances
// (Vinxi dev mode creates multiple module instances in separate contexts)
declare global {
  var __workerInitPromise: Promise<void> | undefined;
  var __eagerWorkerInitScheduled: boolean | undefined;
}

// Initialize global if not exists
if (!global.__workerInitPromise) {
  global.__workerInitPromise = undefined;
}

/**
 * Initialize workers on first request (checks Redis first)
 * Uses global Promise-based singleton to prevent duplicate initialization
 * across multiple module instances (Vinxi creates separate contexts)
 */
export async function initializeWorkersIfNeeded() {
  // If already initializing or initialized, wait for/return the same promise
  if (global.__workerInitPromise) {
    return global.__workerInitPromise;
  }

  // Create the initialization promise
  global.__workerInitPromise = (async () => {
    try {
      // First, check if Redis is running
      console.log("[Server] Checking if Redis is running...");
      const redisCheck = await checkRedisConnection();

      if (!redisCheck.connected) {
        console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.warn("⚠️  Redis is not running");
        console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.warn("");
        console.warn(
          "Workers will NOT be started. Email queueing will not work.",
        );
        console.warn("The application will continue to run normally.");
        console.warn("");
        console.warn("To enable email queueing, start Redis:");
        console.warn("  macOS: brew services start redis");
        console.warn("  Linux: sudo systemctl start redis-server");
        console.warn("  Docker: docker run -d -p 6379:6379 redis:latest");
        console.warn("");
        console.warn("Then restart the application.");
        console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return;
      }

      console.log("[Server] ✓ Redis is running");

      // Initialize cluster communication
      console.log("[Server] Initializing cluster communication...");
      await initClusterCommunication();
      console.log("[Server] ✓ Cluster communication initialized successfully");

      // Initialize platform workers
      console.log("[Server] Initializing platform workers...");
      await initWorkersCore();
      console.log("[Server] ✓ Platform workers initialized successfully");

      // App SubDomain DBs + synced Shopify shop DBs (each shop has its own worker set)
      console.log(
        "[Server] Initializing subdomain and shop database workers...",
      );
      await initAllSubdomainWorkers();
      console.log("[Server] ✓ All workers initialized successfully");
    } catch (error) {
      console.error("[Server] Failed to initialize workers:", error);
      // Don't throw - let the app continue even if worker init fails
    }
  })();

  return global.__workerInitPromise;
}

/**
 * Start BullMQ/cluster init as soon as this module loads in production.
 * Without this, only the first process that receives HTTP (often sticky keep-alive
 * from LiteSpeed) ever warms up; other cluster workers stay idle.
 */
export function scheduleEagerWorkerInit() {
  if (typeof window !== "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (global.__eagerWorkerInitScheduled) return;
  global.__eagerWorkerInitScheduled = true;

  setImmediate(() => {
    void initializeWorkersIfNeeded().catch((error) => {
      console.error("[Server] Eager worker init failed:", error);
    });
  });
}

scheduleEagerWorkerInit();
