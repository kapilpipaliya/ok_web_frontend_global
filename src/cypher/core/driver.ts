import { auth, driver as createDriver, type Driver } from "neo4j-driver";

import { boltPort } from "./boltConstant";
import { logger } from "~/lib/logger";

/**
 * Global driver state management
 *
 * Uses global state to persist across HMR (Hot Module Reload) in development.
 * Without this, Vite/Vinxi module reloads would reset the singleton to null,
 * causing multiple driver instances to be created.
 *
 * Similar pattern to workerState in initWorkersCore.ts
 */
declare global {
  var __neo4jDriverState:
    | {
        driverInstance: Driver | null;
        driverPromise: Promise<Driver> | null;
        driverWasClosed: boolean;
      }
    | undefined;
}

// Initialize global driver state if not exists
if (!global.__neo4jDriverState) {
  logger.debug("Initializing Neo4j global driver state");
  global.__neo4jDriverState = {
    driverInstance: null,
    driverPromise: null,
    driverWasClosed: false,
  };
}

// Export reference to global state for easy access
const driverState = global.__neo4jDriverState;

/**
 * Get the Neo4j driver instance (singleton pattern)
 *
 * This function returns the same driver instance across all calls, ensuring
 * efficient connection pooling and preventing resource exhaustion.
 *
 * The driver manages a pool of connections that are reused across queries.
 * Sessions (NOT drivers) should be created/closed for each operation.
 *
 * Pattern:
 * ✅ CORRECT: const driver = await getDriver(); const session = driver.session(); ... session.close();
 * ❌ WRONG: Create new driver for each query
 *
 * @returns Promise<Driver> - Singleton Neo4j driver instance with connection pooling
 */
export async function getDriver(): Promise<Driver> {
  // If already creating driver, wait for that promise
  if (driverState.driverPromise) {
    return driverState.driverPromise;
  }

  // If driver exists and wasn't explicitly closed, return it
  // We don't do health checks on every call as they're wasteful
  if (driverState.driverInstance && !driverState.driverWasClosed) {
    return driverState.driverInstance;
  }

  // If driver was closed or doesn't exist, create a new one
  // Create promise for driver initialization
  // This prevents race conditions where multiple concurrent calls create multiple drivers
  driverState.driverPromise = (async () => {
    const username = process.env.NEO4J_USERNAME || "neo4j";
    const password = process.env.NEO4J_PASSWORD || "";

    logger.logDatabase({
      operation: "driver_init",
      database: `bolt://localhost:${boltPort}`,
    });

    // Create driver with optimized connection pool settings
    const driver = createDriver(
      `bolt://localhost:${boltPort}`,
      auth.basic(username, password),
      {
        disableLosslessIntegers: true,

        // Connection Pool Configuration
        // These settings prevent connection exhaustion and ensure healthy connection lifecycle

        maxConnectionPoolSize: 50,
        // Maximum number of connections in the pool per host
        // Default: 100. Reduced to 50 to prevent overwhelming Neo4j server
        // Each connection consumes memory on both client and server

        connectionAcquisitionTimeout: 60000,
        // Time (ms) to wait for an available connection from the pool
        // Default: 60000 (60 seconds)
        // If all connections are busy, new requests wait up to this time
        // Prevents indefinite blocking when server is under load

        maxConnectionLifetime: 3600000,
        // Maximum lifetime (ms) of a pooled connection
        // Default: 3600000 (1 hour)
        // Connections older than this are closed and replaced
        // Prevents stale connections and allows load rebalancing

        connectionTimeout: 30000,
        // Time (ms) to establish a new connection to the database
        // Default: 30000 (30 seconds)
        // Fails fast if Neo4j is unreachable instead of hanging indefinitely

        maxTransactionRetryTime: 30000,
        // Maximum time (ms) to retry transient errors (e.g., deadlocks, timeouts)
        // Default: 30000 (30 seconds)
        // Driver automatically retries failed transactions within this window
      },
    );

    logger.info("Neo4j connection pool created successfully");
    driverState.driverInstance = driver;
    driverState.driverPromise = null; // Clear promise after successful creation
    driverState.driverWasClosed = false; // Reset flag
    return driver;
  })();

  return driverState.driverPromise;
}

/**
 * Close the driver connection pool and clean up resources
 *
 * Should be called on application shutdown to gracefully close all connections.
 * This ensures:
 * - All active connections are properly closed
 * - Neo4j server is notified of client disconnect
 * - No connection leaks remain
 *
 * Note: After calling this, getDriver() will create a new driver instance
 *
 * Called automatically on:
 * - SIGTERM (graceful shutdown, e.g., docker stop, kubernetes pod termination)
 * - SIGINT (Ctrl+C in terminal)
 * - Uncaught exceptions
 * - Unhandled promise rejections
 */
export async function closeDriver() {
  if (driverState.driverInstance) {
    logger.logDatabase({
      operation: "driver_close",
    });

    await driverState.driverInstance.close();
    driverState.driverInstance = null;
    driverState.driverPromise = null; // Clear promise as well
    driverState.driverWasClosed = true; // Mark driver as closed

    logger.info("Neo4j connection pool closed successfully");
  } else {
    logger.debug("No active Neo4j driver instance to close");
  }
}
