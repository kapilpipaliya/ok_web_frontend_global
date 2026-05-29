/**
 * BullMQ queue for schema export/import/sync/migrate jobs.
 */

import { Job, Queue } from "bullmq";
import type { SchemaJobQueueData } from "~/lib/schema/schemaJobs/schemaJobTypes";
import { redisConnection, defaultJobOptions } from "./redisConfig";

export const schemaJobQueue = new Queue<SchemaJobQueueData>("schema-jobs", {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 3,
  },
});

const RUN_SCHEMA_JOB = "run-schema-job";

/** Non-terminal states: do not enqueue another job with the same id. */
const BLOCKING_JOB_STATES = new Set([
  "waiting",
  "delayed",
  "active",
  "paused",
  "prioritized",
  "waiting-children",
]);

/**
 * Stable BullMQ job id (no timestamp): one pending/active job per database + operation.
 * Same pattern as `createJobId` in shopifyQueueHelpers.hjson, without the trailing `ts`
 * so a second job is not queued until the first is finished and removed from Redis.
 */
export function createSchemaJobBullId(
  databaseName: string,
  operation: SchemaJobQueueData["operation"],
): string {
  const safeDatabase = (databaseName || "").replace(/[^a-z0-9-]/gi, "-");
  return `${RUN_SCHEMA_JOB}-${safeDatabase}-${operation}`;
}

/** Decode path/query value for `Job.fromId` (same string returned from enqueue). */
export function parseSchemaJobIdParam(raw: string): string {
  return decodeURIComponent(raw.trim());
}

/**
 * Enqueue a schema job. Returns `jobId` (Bull id) for `GET /api/schema/jobs/:jobId`.
 * If a job with the same id is already waiting, delayed, active, or paused, returns that
 * id without adding a duplicate. After a job completes/fails, Redis may still hold it
 * briefly; that record is removed before adding a new run so the id can be reused.
 */
export async function enqueueSchemaJob(
  data: SchemaJobQueueData,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const jobId = createSchemaJobBullId(data.databaseName, data.operation);

  try {
    const existing = await Job.fromId(schemaJobQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await schemaJobQueue.add(RUN_SCHEMA_JOB, data, {
      jobId,
    });
    return { ok: true, jobId };
  } catch (e) {
    const msg = `Failed to queue job (is Redis running?): ${
      e instanceof Error ? e.message : String(e)
    }`;
    return { ok: false, error: msg };
  }
}
