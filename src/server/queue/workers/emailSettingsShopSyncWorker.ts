/**
 * BullMQ worker: sync main-domain email Setting to all Shopify shop databases.
 */

import { Worker, type Job } from "bullmq";
import { syncEmailSettingsToShopDatabases } from "~/lib/email/syncEmailSettingsToShopDatabases";
import { logger } from "~/lib/logger";
import { redisConnection } from "../redisConfig";
import type { EmailSettingsShopSyncJobData } from "../emailSettingsShopSyncQueue";

declare global {
  var __emailSettingsShopSyncWorker: Worker<EmailSettingsShopSyncJobData> | undefined;
  var __emailSettingsShopSyncWorkerStartPromise:
    | Promise<Worker<EmailSettingsShopSyncJobData>>
    | undefined;
}

if (!global.__emailSettingsShopSyncWorker) {
  global.__emailSettingsShopSyncWorker = undefined;
}
if (!global.__emailSettingsShopSyncWorkerStartPromise) {
  global.__emailSettingsShopSyncWorkerStartPromise = undefined;
}

async function processJob(job: Job<EmailSettingsShopSyncJobData>) {
  const start = Date.now();
  const bullId = String(job.id ?? "");

  logger.logJob({
    jobId: bullId,
    jobName: "email-settings-shop-sync",
    queueName: "email-settings-shop-sync",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  try {
    const result = await syncEmailSettingsToShopDatabases(
      job.data.mainDatabaseName,
    );
    logger.logJob({
      jobId: bullId,
      jobName: "email-settings-shop-sync",
      queueName: "email-settings-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "completed",
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.logJob({
      jobId: bullId,
      jobName: "email-settings-shop-sync",
      queueName: "email-settings-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "failed",
      error: message,
    });
    throw error;
  }
}

export async function startEmailSettingsShopSyncWorker() {
  if (global.__emailSettingsShopSyncWorkerStartPromise) {
    return global.__emailSettingsShopSyncWorkerStartPromise;
  }

  global.__emailSettingsShopSyncWorkerStartPromise = (async () => {
    logger.info("Starting email settings shop sync worker...");

    const w = new Worker<EmailSettingsShopSyncJobData>(
      "email-settings-shop-sync",
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
          queueName: "email-settings-shop-sync",
          error: err instanceof Error ? err.message : String(err),
        },
        "Email settings shop sync worker error",
      );
    });

    global.__emailSettingsShopSyncWorker = w;
    logger.info("Email settings shop sync worker started");
    return w;
  })();

  return global.__emailSettingsShopSyncWorkerStartPromise;
}

export async function stopEmailSettingsShopSyncWorker(force = false) {
  if (!global.__emailSettingsShopSyncWorker) {
    return;
  }
  logger.info(
    `Stopping email settings shop sync worker${force ? " (force)" : ""}...`,
  );
  await global.__emailSettingsShopSyncWorker.close(force);
  global.__emailSettingsShopSyncWorker = undefined;
  global.__emailSettingsShopSyncWorkerStartPromise = undefined;
  logger.info("Email settings shop sync worker stopped");
}
