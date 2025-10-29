/**
 * Redis Configuration for BullMQ
 *
 * This module provides Redis connection configuration for BullMQ queues and workers.
 */

import type { ConnectionOptions } from 'bullmq';

/**
 * Redis connection configuration
 * Uses environment variables with sensible defaults
 */
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

/**
 * Default job options for all queues
 */
export const defaultJobOptions = {
  attempts: 3,         // Retry failed jobs up to 3 times
  backoff: {
    type: 'exponential',
    delay: 5000,       // Start with 5 second delay, doubles each retry
  },
  removeOnComplete: {
    age: 3600 * 24 * 7,  // Keep completed jobs for 7 days
    count: 1000,         // Keep max 1000 completed jobs
  },
  removeOnFail: {
    age: 3600 * 24 * 30, // Keep failed jobs for 30 days
  },
};
