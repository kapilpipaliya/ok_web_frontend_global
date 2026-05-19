/**
 * BullMQ queue: propagate main-domain email `Setting` to all Shopify shop databases.
 */

import { Job, Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "./redisConfig";

export interface EmailSettingsShopSyncJobData {
  mainDatabaseName: string;
}

export const emailSettingsShopSyncQueue =
  new Queue<EmailSettingsShopSyncJobData>("email-settings-shop-sync", {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 2,
    },
  });

const JOB_NAME = "sync-email-settings-to-shops";

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

export function createEmailSettingsShopSyncJobId(mainDatabaseName: string): string {
  return `sync-email-settings-${safeDatabaseSlug(mainDatabaseName)}`;
}

/**
 * After saving email settings on the main subdomain, enqueue a sync to all shop DBs.
 * One pending/active job per main database (stable job id).
 */
export async function enqueueEmailSettingsShopSync(
  mainDatabaseName: string,
): Promise<
  | { ok: true; jobId: string }
  | { ok: false; error: string }
> {
  const jobId = createEmailSettingsShopSyncJobId(mainDatabaseName);
  const data: EmailSettingsShopSyncJobData = { mainDatabaseName };

  try {
    const existing = await Job.fromId(emailSettingsShopSyncQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await emailSettingsShopSyncQueue.add(JOB_NAME, data, { jobId });
    return { ok: true, jobId };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Failed to queue email settings shop sync (is Redis running?): ${msg}`,
    };
  }
}
