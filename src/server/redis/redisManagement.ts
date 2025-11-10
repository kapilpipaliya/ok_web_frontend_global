/**
 * Redis Data Management Functions
 * Only accessible from admin subdomain
 * Provides comprehensive Redis and BullMQ queue management
 */

import { Queue } from "bullmq";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getDriver } from "~/cypher/core/driver";
import Redis from "ioredis";

// Redis connection configuration
function getRedisConnection() {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

/**
 * Get all BullMQ queues with their statistics
 */
export async function getAllRedisQueues() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const redis = new Redis(connection);

    // Get all keys that match BullMQ queue patterns
    const queueKeys = await redis.keys("bull:*:id");

    const queues = [];

    for (const key of queueKeys) {
      // Extract queue name from key (bull:{queueName}:id)
      const match = key.match(/^bull:(.+):id$/);
      if (!match) continue;

      const queueName = match[1];

      try {
        const queue = new Queue(queueName, { connection });

        const [waiting, active, completed, failed, delayed, paused] =
          await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
            queue.isPaused(),
          ]);

        queues.push({
          name: queueName,
          waiting,
          active,
          completed,
          failed,
          delayed,
          paused,
          total: waiting + active + completed + failed + delayed,
        });

        await queue.close();
      } catch (error) {
        console.error(`Error getting stats for queue ${queueName}:`, error);
      }
    }

    await redis.quit();

    return {
      success: true,
      data: queues.sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch (error: any) {
    console.error("[Redis] Error getting all queues:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Delete a specific queue completely
 */
export async function deleteQueue(queueName: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    await queue.obliterate({ force: true });
    await queue.close();

    return {
      success: true,
      message: `Queue "${queueName}" deleted successfully`,
    };
  } catch (error: any) {
    console.error(`[Redis] Error deleting queue ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Clean jobs from a queue by state
 */
export async function cleanQueue(
  queueName: string,
  state: "completed" | "failed" | "delayed" | "wait" | "active",
  limit?: number,
) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    let deleted = 0;

    switch (state) {
      case "completed":
        deleted = await queue.clean(0, limit || 1000, "completed");
        break;
      case "failed":
        deleted = await queue.clean(0, limit || 1000, "failed");
        break;
      case "delayed":
        deleted = await queue.clean(0, limit || 1000, "delayed");
        break;
      case "wait":
        deleted = await queue.clean(0, limit || 1000, "wait");
        break;
      case "active":
        deleted = await queue.clean(0, limit || 1000, "active");
        break;
    }

    await queue.close();

    return {
      success: true,
      message: `Deleted ${deleted} ${state} jobs from queue "${queueName}"`,
      deleted,
    };
  } catch (error: any) {
    console.error(`[Redis] Error cleaning queue ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get jobs from a queue by state
 */
export async function getJobsByState(
  queueName: string,
  state: "waiting" | "active" | "completed" | "failed" | "delayed",
  start = 0,
  end = 50,
) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    let jobs: any[] = [];

    switch (state) {
      case "waiting":
        jobs = await queue.getWaiting(start, end);
        break;
      case "active":
        jobs = await queue.getActive(start, end);
        break;
      case "completed":
        jobs = await queue.getCompleted(start, end);
        break;
      case "failed":
        jobs = await queue.getFailed(start, end);
        break;
      case "delayed":
        jobs = await queue.getDelayed(start, end);
        break;
    }

    const jobData = jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      returnvalue: job.returnvalue,
    }));

    await queue.close();

    return {
      success: true,
      data: jobData,
    };
  } catch (error: any) {
    console.error(`[Redis] Error getting jobs from ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get total count of jobs in a queue by state
 */
export async function getJobCount(
  queueName: string,
  state: "waiting" | "active" | "completed" | "failed" | "delayed",
) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    let count = 0;

    switch (state) {
      case "waiting":
        count = await queue.getWaitingCount();
        break;
      case "active":
        count = await queue.getActiveCount();
        break;
      case "completed":
        count = await queue.getCompletedCount();
        break;
      case "failed":
        count = await queue.getFailedCount();
        break;
      case "delayed":
        count = await queue.getDelayedCount();
        break;
    }

    await queue.close();

    return {
      success: true,
      count,
    };
  } catch (error: any) {
    console.error(`[Redis] Error getting job count from ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Delete a specific job by ID
 */
export async function deleteJob(queueName: string, jobId: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    const job = await queue.getJob(jobId);

    if (!job) {
      await queue.close();
      return {
        success: false,
        error: `Job ${jobId} not found in queue ${queueName}`,
      };
    }

    await job.remove();
    await queue.close();

    return {
      success: true,
      message: `Job ${jobId} deleted successfully`,
    };
  } catch (error: any) {
    console.error(`[Redis] Error deleting job ${jobId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Retry failed jobs in a queue
 */
export async function retryFailedJobs(queueName: string, jobIds?: string[]) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    let retriedCount = 0;

    if (jobIds && jobIds.length > 0) {
      // Retry specific jobs
      for (const jobId of jobIds) {
        const job = await queue.getJob(jobId);
        if (job) {
          await job.retry();
          retriedCount++;
        }
      }
    } else {
      // Retry all failed jobs
      const failedJobs = await queue.getFailed(0, 1000);
      for (const job of failedJobs) {
        await job.retry();
        retriedCount++;
      }
    }

    await queue.close();

    return {
      success: true,
      message: `Retried ${retriedCount} jobs in queue "${queueName}"`,
      retriedCount,
    };
  } catch (error: any) {
    console.error(`[Redis] Error retrying jobs in ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Pause a queue
 */
export async function pauseQueue(queueName: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    await queue.pause();
    await queue.close();

    return {
      success: true,
      message: `Queue "${queueName}" paused successfully`,
    };
  } catch (error: any) {
    console.error(`[Redis] Error pausing queue ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Resume a paused queue
 */
export async function resumeQueue(queueName: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    await queue.resume();
    await queue.close();

    return {
      success: true,
      message: `Queue "${queueName}" resumed successfully`,
    };
  } catch (error: any) {
    console.error(`[Redis] Error resuming queue ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Get Redis server info
 */
export async function getRedisInfo() {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const redis = new Redis(connection);

    const info = await redis.info();
    const dbSize = await redis.dbsize();
    const memory = await redis.info("memory");

    await redis.quit();

    // Parse memory info
    const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/);
    const usedMemory = memoryMatch ? memoryMatch[1] : "Unknown";

    const peakMemoryMatch = memory.match(/used_memory_peak_human:([^\r\n]+)/);
    const peakMemory = peakMemoryMatch ? peakMemoryMatch[1] : "Unknown";

    return {
      success: true,
      data: {
        dbSize,
        usedMemory,
        peakMemory,
        info,
      },
    };
  } catch (error: any) {
    console.error("[Redis] Error getting Redis info:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Delete Redis keys by pattern
 */
export async function deleteRedisKeys(pattern: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const redis = new Redis(connection);

    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      await redis.quit();
      return {
        success: true,
        message: `No keys found matching pattern "${pattern}"`,
        deleted: 0,
      };
    }

    await redis.del(...keys);
    await redis.quit();

    return {
      success: true,
      message: `Deleted ${keys.length} keys matching pattern "${pattern}"`,
      deleted: keys.length,
    };
  } catch (error: any) {
    console.error(`[Redis] Error deleting keys with pattern ${pattern}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Empty all jobs from a queue (keep the queue structure)
 */
export async function emptyQueue(queueName: string) {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    if (subDomain !== "admin") {
      return {
        success: false,
        error: "This function is only accessible from the admin subdomain",
      };
    }

    const connection = getRedisConnection();
    const queue = new Queue(queueName, { connection });

    await queue.drain();
    await queue.close();

    return {
      success: true,
      message: `Queue "${queueName}" emptied successfully`,
    };
  } catch (error: any) {
    console.error(`[Redis] Error emptying queue ${queueName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await dbSession.close();
  }
}

/**
 * Delete all queues for a specific subdomain (internal use only)
 * Used when deleting a subdomain - no admin check required
 * Queue names are derived from function names in the subdomain database
 */
export async function deleteAllQueuesForSubdomain(subdomain: string) {
  const connection = getRedisConnection();
  const redis = new Redis(connection);

  try {
    // Get the list of queue names from the subdomain database
    const driver = await getDriver();
    const dbSession = driver.session({ database: subdomain });

    let queueNames: string[] = [];

    try {
      // Find all functions that start with 'background' or 'process'
      // These create BullMQ queues with the function name as the queue name
      const query = `
        MATCH (f:Function)
        WHERE f.key STARTS WITH 'process' OR f.key STARTS WITH 'background'
        RETURN f.key as queueName
      `;

      const result = await dbSession.run(query);
      queueNames = result.records.map((record) => record.get("queueName"));

      console.log(
        `[Redis] Found ${queueNames.length} queue(s) in subdomain ${subdomain} database`,
      );
    } catch (dbError) {
      console.error(
        `[Redis] Error querying subdomain database ${subdomain}:`,
        dbError,
      );
      // Continue with empty queue list if database query fails
    } finally {
      await dbSession.close();
    }

    let deletedCount = 0;

    // Delete each queue found in the database
    for (const queueName of queueNames) {
      try {
        console.log(`[Redis] Deleting queue: ${queueName}`);
        const queue = new Queue(queueName, { connection });
        await queue.obliterate({ force: true });
        await queue.close();
        deletedCount++;
      } catch (error) {
        console.error(`[Redis] Error deleting queue ${queueName}:`, error);
        // Continue deleting other queues even if one fails
      }
    }

    await redis.quit();

    console.log(
      `[Redis] Deleted ${deletedCount} queue(s) for subdomain: ${subdomain}`,
    );

    return {
      success: true,
      deletedCount,
    };
  } catch (error: any) {
    console.error(
      `[Redis] Error deleting queues for subdomain ${subdomain}:`,
      error,
    );
    await redis.quit();
    return {
      success: false,
      error: error.message,
    };
  }
}
