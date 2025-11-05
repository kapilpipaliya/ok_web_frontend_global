import { auth, driver as createDriver, type Driver } from "neo4j-driver";

import { boltPort } from "./boltConstant";

/**
 * Singleton driver instance - prevents creating multiple drivers
 *
 * IMPORTANT: This MUST be a singleton to prevent connection pool exhaustion.
 * Creating multiple drivers leads to:
 * - Hundreds of connections to Neo4j
 * - Memory leaks
 * - Neo4j becoming unresponsive after some time
 *
 * Each driver maintains its own connection pool. With ~20 places calling getDriver(),
 * without singleton pattern we'd have 20 drivers × 50 connections = 1000+ connections!
 */
let driverInstance: Driver | null = null;

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
  // Return existing driver if already created
  if (driverInstance) {
    return driverInstance;
  }

  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "";

  // Create driver with optimized connection pool settings
  driverInstance = createDriver(
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

  return driverInstance;
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
  if (driverInstance) {
    console.log('[Neo4j Driver] Closing connection pool...');
    await driverInstance.close();
    driverInstance = null;
    console.log('[Neo4j Driver] Connection pool closed successfully');
  } else {
    console.log('[Neo4j Driver] No active driver instance to close');
  }
}
