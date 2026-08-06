/**
 * BullMQ queue: optimize uploaded images into responsive WebP variants.
 */

import { Job, Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "./redisConfig";

export interface ImageOptimizationJobData {
  fileId: string;
  subDomain: string;
  generation: number;
}

export const imageOptimizationQueue = new Queue<ImageOptimizationJobData>(
  "image-optimization",
  {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 3,
    },
  },
);

const JOB_NAME = "optimize-image";

const BLOCKING_JOB_STATES = new Set([
  "waiting",
  "delayed",
  "active",
  "paused",
  "prioritized",
  "waiting-children",
]);

function safeSlug(value: string): string {
  return (value || "").replace(/[^a-z0-9-]/gi, "-");
}

export function createImageOptimizationJobId(
  subDomain: string,
  fileId: string,
): string {
  return `img-opt-${safeSlug(subDomain)}-${safeSlug(fileId)}`;
}

/**
 * Enqueue image optimization for a File vertex.
 * Stable job id per file so replace/delete can cancel/replace pending work.
 */
export async function enqueueImageOptimization(
  data: ImageOptimizationJobData,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const jobId = createImageOptimizationJobId(data.subDomain, data.fileId);

  try {
    const existing = await Job.fromId(imageOptimizationQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        // Replace payload so generation stays current when possible
        try {
          await existing.updateData(data);
        } catch {
          // ignore update failures on active jobs
        }
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await imageOptimizationQueue.add(JOB_NAME, data, { jobId });
    return { ok: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Failed to queue image optimization (is Redis running?): ${msg}`,
    };
  }
}

export async function cancelImageOptimizationJob(
  subDomain: string,
  fileId: string,
): Promise<void> {
  const jobId = createImageOptimizationJobId(subDomain, fileId);
  try {
    const existing = await Job.fromId(imageOptimizationQueue, jobId);
    if (!existing) return;
    const state = await existing.getState();
    if (state === "completed" || state === "failed") {
      await existing.remove({ removeChildren: true }).catch(() => undefined);
      return;
    }
    await existing.remove({ removeChildren: true }).catch(async () => {
      try {
        await existing.moveToFailed(new Error("Cancelled"), "0", true);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore cancel failures
  }
}
