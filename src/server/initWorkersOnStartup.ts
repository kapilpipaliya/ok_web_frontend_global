/**
 * Worker Initialization at Startup
 *
 * This module initializes workers when the server starts.
 * It checks Redis availability first and only starts workers if Redis is running.
 */

// Use global shared state to prevent duplicate initialization across module instances
// (Vinxi dev mode creates multiple module instances in separate contexts)
declare global {
  var __workerInitPromise: Promise<void> | undefined;
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
      const { checkRedisConnection } = await import("./queue/checkRedis");
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

      // Initialize workers
      console.log("[Server] Initializing workers...");
      const { initWorkersCore } = await import("./queue/initWorkersCore");
      await initWorkersCore();
      console.log("[Server] ✓ Workers initialized successfully");
    } catch (error) {
      console.error("[Server] Failed to initialize workers:", error);
      // Don't throw - let the app continue even if worker init fails
    }
  })();

  return global.__workerInitPromise;
}
