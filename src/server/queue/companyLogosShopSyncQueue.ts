/**
 * BullMQ queue: propagate main-domain company logo File nodes to shop databases.
 */

import { Job, Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "./redisConfig";

export interface CompanyLogosShopSyncJobData {
  mainDatabaseName: string;
}

export const companyLogosShopSyncQueue =
  new Queue<CompanyLogosShopSyncJobData>("company-logos-shop-sync", {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 2,
    },
  });

const JOB_NAME = "sync-company-logos-to-shops";

/** Non-terminal Bull states — do not enqueue another job with the same id. */
const BLOCKING_JOB_STATES = new Set([
  "waiting",
  "delayed",
  "active",
  "paused",
  "prioritized",
  "waiting-children",
]);

function safeDatabaseSlug(name: string): string {
  return (name || "").replace(/[^a-z0-9-]/gi, "-");
}

export function createCompanyLogosShopSyncJobId(
  mainDatabaseName: string,
): string {
  return `sync-company-logos-${safeDatabaseSlug(mainDatabaseName)}`;
}

/**
 * After saving company logos on the main subdomain, enqueue a sync to all shop DBs.
 * One pending/active job per main database (stable job id).
 */
export async function enqueueCompanyLogosShopSync(
  mainDatabaseName: string,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const jobId = createCompanyLogosShopSyncJobId(mainDatabaseName);
  const data: CompanyLogosShopSyncJobData = { mainDatabaseName };

  try {
    const existing = await Job.fromId(companyLogosShopSyncQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await companyLogosShopSyncQueue.add(JOB_NAME, data, { jobId });
    return { ok: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Failed to queue company logos shop sync (is Redis running?): ${msg}`,
    };
  }
}
