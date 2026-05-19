/**
 * BullMQ worker: sync main-domain company logos to all Shopify shop databases.
 */

import { Worker, type Job } from "bullmq";
import { syncCompanyLogosToShopDatabases } from "~/lib/settings/syncCompanyLogosToShopDatabases";
import { logger } from "~/lib/logger";
import { redisConnection } from "../redisConfig";
import type { CompanyLogosShopSyncJobData } from "../companyLogosShopSyncQueue";

declare global {
  var __companyLogosShopSyncWorker:
    | Worker<CompanyLogosShopSyncJobData>
    | undefined;
  var __companyLogosShopSyncWorkerStartPromise:
    | Promise<Worker<CompanyLogosShopSyncJobData>>
    | undefined;
}

if (!global.__companyLogosShopSyncWorker) {
  global.__companyLogosShopSyncWorker = undefined;
}
if (!global.__companyLogosShopSyncWorkerStartPromise) {
  global.__companyLogosShopSyncWorkerStartPromise = undefined;
}

async function processJob(job: Job<CompanyLogosShopSyncJobData>) {
  const start = Date.now();
  const bullId = String(job.id ?? "");

  logger.logJob({
    jobId: bullId,
    jobName: "company-logos-shop-sync",
    queueName: "company-logos-shop-sync",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  try {
    const result = await syncCompanyLogosToShopDatabases(
      job.data.mainDatabaseName,
    );
    logger.logJob({
      jobId: bullId,
      jobName: "company-logos-shop-sync",
      queueName: "company-logos-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "completed",
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.logJob({
      jobId: bullId,
      jobName: "company-logos-shop-sync",
      queueName: "company-logos-shop-sync",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "failed",
      error: message,
    });
    throw error;
  }
}

export async function startCompanyLogosShopSyncWorker() {
  if (global.__companyLogosShopSyncWorkerStartPromise) {
    return global.__companyLogosShopSyncWorkerStartPromise;
  }

  global.__companyLogosShopSyncWorkerStartPromise = (async () => {
    logger.info("Starting company logos shop sync worker...");

    const w = new Worker<CompanyLogosShopSyncJobData>(
      "company-logos-shop-sync",
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
          queueName: "company-logos-shop-sync",
          error: err instanceof Error ? err.message : String(err),
        },
        "Company logos shop sync worker error",
      );
    });

    global.__companyLogosShopSyncWorker = w;
    logger.info("Company logos shop sync worker started");
    return w;
  })();

  return global.__companyLogosShopSyncWorkerStartPromise;
}

export async function stopCompanyLogosShopSyncWorker(force = false) {
  if (!global.__companyLogosShopSyncWorker) {
    return;
  }
  logger.info(
    `Stopping company logos shop sync worker${force ? " (force)" : ""}...`,
  );
  await global.__companyLogosShopSyncWorker.close(force);
  global.__companyLogosShopSyncWorker = undefined;
  global.__companyLogosShopSyncWorkerStartPromise = undefined;
  logger.info("Company logos shop sync worker stopped");
}
