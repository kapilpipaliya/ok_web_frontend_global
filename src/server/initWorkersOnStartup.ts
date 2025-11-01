/**
 * Worker Initialization at Startup
 *
 * This module initializes workers when the server starts.
 * It checks Redis availability first and only starts workers if Redis is running.
 */

// Track worker initialization state
let workersInitialized = false;
let workersInitializing = false;
let redisChecked = false;
let redisAvailable = false;

/**
 * Initialize workers on first request (checks Redis first)
 */
export async function initializeWorkersIfNeeded() {
  if (workersInitialized || workersInitializing) {
    return;
  }

  workersInitializing = true;

  try {
    // First, check if Redis is running
    if (!redisChecked) {
      console.log('[Server] Checking if Redis is running...');
      const { checkRedisConnection } = await import("./queue/checkRedis");
      const redisCheck = await checkRedisConnection();
      redisChecked = true;
      redisAvailable = redisCheck.connected;

      if (!redisAvailable) {
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('⚠️  Redis is not running');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('');
        console.warn('Workers will NOT be started. Email queueing will not work.');
        console.warn('The application will continue to run normally.');
        console.warn('');
        console.warn('To enable email queueing, start Redis:');
        console.warn('  macOS: brew services start redis');
        console.warn('  Linux: sudo systemctl start redis-server');
        console.warn('  Docker: docker run -d -p 6379:6379 redis:latest');
        console.warn('');
        console.warn('Then restart the application.');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        workersInitialized = true; // Mark as "done" so we don't keep checking
        return;
      }

      console.log('[Server] ✓ Redis is running');
    }

    // Only initialize workers if Redis is available
    if (redisAvailable && !workersInitialized) {
      console.log('[Server] Initializing workers...');
      const { initWorkersCore } = await import("./queue/initWorkersCore");
      await initWorkersCore();
      workersInitialized = true;
      console.log('[Server] ✓ Workers initialized successfully');
    }
  } catch (error) {
    console.error('[Server] Failed to initialize workers:', error);
    workersInitialized = true; // Mark as done to avoid retrying every request
  } finally {
    workersInitializing = false;
  }
}
