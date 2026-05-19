/**
 * BullMQ queue: propagate main-domain GlobalSetting to all Shopify shop databases.
 */

import { Job, Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "./redisConfig";

export interface GlobalSettingsShopSyncJobData {
  mainDatabaseName: string;
}

export const globalSettingsShopSyncQueue =
  new Queue<GlobalSettingsShopSyncJobData>("global-settings-shop-sync", {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 2,
    },
  });

const JOB_NAME = "sync-global-settings-to-shops";

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

export function createGlobalSettingsShopSyncJobId(
  mainDatabaseName: string,
): string {
  return `sync-global-settings-${safeDatabaseSlug(mainDatabaseName)}`;
}

/**
 * After saving global settings on the main subdomain, enqueue a sync to all shop DBs.
 * One pending/active job per main database (stable job id).
 */
export async function enqueueGlobalSettingsShopSync(
  mainDatabaseName: string,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const jobId = createGlobalSettingsShopSyncJobId(mainDatabaseName);
  const data: GlobalSettingsShopSyncJobData = { mainDatabaseName };

  try {
    const existing = await Job.fromId(globalSettingsShopSyncQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await globalSettingsShopSyncQueue.add(JOB_NAME, data, { jobId });
    return { ok: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Failed to queue global settings shop sync (is Redis running?): ${msg}`,
    };
  }
}
