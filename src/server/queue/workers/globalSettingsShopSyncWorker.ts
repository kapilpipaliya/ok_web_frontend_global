/**
 * BullMQ worker: sync main-domain GlobalSetting to all Shopify shop databases.
 */

import { Worker, type Job } from "bullmq";
import { syncGlobalSettingsToShopDatabases } from "~/lib/settings/syncGlobalSettingsToShopDatabases";
import { logger } from "~/lib/logger";
import { redisConnection } from "../redisConfig";
import type { GlobalSettingsShopSyncJobData } from "../globalSettingsShopSyncQueue";

declare global {
  var __globalSettingsShopSyncWorker:
    | Worker<GlobalSettingsShopSyncJobData>
    | undefined;
  var __globalSettingsShopSyncWorkerStartPromise:
    | Promise<Worker<GlobalSettingsShopSyncJobData>>
    | undefined;
}

if (!global.__globalSettingsShopSyncWorker) {
  global.__globalSettingsShopSyncWorker = undefined;
}
if (!global.__globalSettingsShopSyncWorkerStartPromise) {
  global.__globalSettingsShopSyncWorkerStartPromise = undefined;
}

async function processJob(job: Job<GlobalSettingsShopSyncJobData>) {
  const start = Date.now();
  const bullId = String(job.id ?? "");

  logger.logJob({
    jobId: bullId,
    jobName: "global-settings-shop-sync",
    queueName: "global-settings-shop-sync",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  try {
    const result = await syncGlobalSettingsToShopDatabases(
      job.data.mainDatabaseName,
    );
    logger.logJob({
      jobId: bullId,
      jobName: "global-settings-shop-sync",
      queueName: "global-settings-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "completed",
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.logJob({
      jobId: bullId,
      jobName: "global-settings-shop-sync",
      queueName: "global-settings-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "failed",
      error: message,
    });
    throw error;
  }
}

export async function startGlobalSettingsShopSyncWorker() {
  if (global.__globalSettingsShopSyncWorkerStartPromise) {
    return global.__globalSettingsShopSyncWorkerStartPromise;
  }

  global.__globalSettingsShopSyncWorkerStartPromise = (async () => {
    logger.info("Starting global settings shop sync worker...");

    const w = new Worker<GlobalSettingsShopSyncJobData>(
      "global-settings-shop-sync",
      processJob,
      {
        connection: redisConnection,
        concurrency: 1,
      },
    );

    w.on("error", (err) => {
      logger.error(
        {
          type: "worker_error",
          queueName: "global-settings-shop-sync",
          error: err instanceof Error ? err.message : String(err),
        },
        "Global settings shop sync worker error",
      );
    });

    global.__globalSettingsShopSyncWorker = w;
    logger.info("Global settings shop sync worker started");
    return w;
  })();

  return global.__globalSettingsShopSyncWorkerStartPromise;
}

export async function stopGlobalSettingsShopSyncWorker(force = false) {
  if (!global.__globalSettingsShopSyncWorker) {
    return;
  }
  logger.info(
    `Stopping global settings shop sync worker${force ? " (force)" : ""}...`,
  );
  await global.__globalSettingsShopSyncWorker.close(force);
  global.__globalSettingsShopSyncWorker = undefined;
  global.__globalSettingsShopSyncWorkerStartPromise = undefined;
  logger.info("Global settings shop sync worker stopped");
}
