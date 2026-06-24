/**
 * BullMQ worker: runs schema export/import/sync from queue payload.
 */

import { Worker, type Job } from "bullmq";
import { redisConnection } from "../redisConfig";
import type { SchemaJobQueueData } from "~/lib/schema/schemaJobs/schemaJobTypes";
import { executeSchemaQueueJob } from "~/lib/schema/schemaJobs/schemaJobWorker";
import { logger } from "~/lib/logger";

declare global {
  var __schemaJobsQueueWorker: Worker<SchemaJobQueueData> | undefined;
  var __schemaJobsQueueWorkerStartPromise:
    | Promise<Worker<SchemaJobQueueData>>
    | undefined;
}

if (!global.__schemaJobsQueueWorker) {
  global.__schemaJobsQueueWorker = undefined;
}
if (!global.__schemaJobsQueueWorkerStartPromise) {
  global.__schemaJobsQueueWorkerStartPromise = undefined;
}

function normalizeSchemaJobError(error: unknown): Error {
  if (error instanceof Error) {
    const maybeHint =
      "hint" in error && typeof error.hint === "string"
        ? error.hint.trim()
        : "";
    if (!maybeHint) {
      return error;
    }
    const message = `${error.message}\nHint: ${maybeHint}`;
    const enriched = new Error(message);
    enriched.name = error.name;
    if (error.stack) {
      enriched.stack = error.stack;
    }
    return enriched;
  }
  return new Error(String(error));
}

async function processSchemaJob(job: Job<SchemaJobQueueData>) {
  const startTime = Date.now();
  const bullJobId = String(job.id ?? "");

  logger.logJob({
    jobId: bullJobId,
    jobName: "schema-job",
    queueName: "schema-jobs",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  try {
    const result = await executeSchemaQueueJob(job.data, bullJobId);
    const duration = Date.now() - startTime;
    logger.logJob({
      jobId: bullJobId,
      jobName: "schema-job",
      queueName: "schema-jobs",
      attemptsMade: job.attemptsMade,
      duration,
      status: "completed",
    });
    return result;
  } catch (error) {
    const normalizedError = normalizeSchemaJobError(error);
    const duration = Date.now() - startTime;
    const message = normalizedError.message;
    logger.logJob({
      jobId: bullJobId,
      jobName: "schema-job",
      queueName: "schema-jobs",
      attemptsMade: job.attemptsMade,
      duration,
      status: "failed",
      error: message,
    });
    throw normalizedError;
  }
}

export async function startSchemaJobsQueueWorker() {
  if (global.__schemaJobsQueueWorkerStartPromise) {
    return global.__schemaJobsQueueWorkerStartPromise;
  }

  global.__schemaJobsQueueWorkerStartPromise = (async () => {
    logger.info("Starting schema jobs queue worker...");

    const newWorker = new Worker<SchemaJobQueueData>(
      "schema-jobs",
      processSchemaJob,
      {
        connection: redisConnection,
        concurrency: 2,
      },
    );

    newWorker.on("error", (err) => {
      logger.error(
        {
          type: "worker_error",
          queueName: "schema-jobs",
          error: err instanceof Error ? err.message : String(err),
        },
        "Schema jobs queue worker error",
      );
    });

    global.__schemaJobsQueueWorker = newWorker;
    logger.info("Schema jobs queue worker started successfully");
    return newWorker;
  })();

  return global.__schemaJobsQueueWorkerStartPromise;
}

export async function stopSchemaJobsQueueWorker(force = false) {
  if (!global.__schemaJobsQueueWorker) {
    logger.debug("Schema jobs queue worker not running");
    return;
  }

  logger.info(`Stopping schema jobs queue worker${force ? " (force)" : ""}...`);
  await global.__schemaJobsQueueWorker.close(force);
  global.__schemaJobsQueueWorker = undefined;
  global.__schemaJobsQueueWorkerStartPromise = undefined;
  logger.info("Schema jobs queue worker stopped");
}
