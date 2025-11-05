/**
 * Redis Connection Checker
 *
 * Checks if Redis is running and provides helpful error messages
 */

import { Redis } from "ioredis";

/**
 * Check if Redis is running and accessible
 */
export async function checkRedisConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't retry on connection failure
    lazyConnect: true, // Don't connect automatically
    connectTimeout: 2000, // 2 second timeout
  });

  try {
    await redis.connect();
    await redis.ping();
    await redis.quit();
    return { connected: true };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
    };
  }
}
