/**
 * BullMQ queue: optimize uploaded media (images + videos).
 */

import { Job, Queue } from "bullmq";
import { redisConnection, defaultJobOptions } from "./redisConfig";
import type { MediaType } from "~/lib/files/mediaOptimizationConfig";

export interface MediaOptimizationJobData {
  fileId: string;
  subDomain: string;
  generation: number;
  mediaType?: MediaType;
}

/** @deprecated Use MediaOptimizationJobData */
export type ImageOptimizationJobData = MediaOptimizationJobData;

export const mediaOptimizationQueue = new Queue<MediaOptimizationJobData>(
  "media-optimization",
  {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 3,
    },
  },
);

/** Alias for backward compatibility */
export const imageOptimizationQueue = mediaOptimizationQueue;

const JOB_NAME = "optimize-media";

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

export function createMediaOptimizationJobId(
  subDomain: string,
  fileId: string,
): string {
  return `media-opt-${safeSlug(subDomain)}-${safeSlug(fileId)}`;
}

/** @deprecated Prefer createMediaOptimizationJobId */
export const createImageOptimizationJobId = createMediaOptimizationJobId;

/**
 * Enqueue media optimization for a File vertex.
 * Stable job id per file so replace/delete can cancel/replace pending work.
 */
export async function enqueueMediaOptimization(
  data: MediaOptimizationJobData,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const jobId = createMediaOptimizationJobId(data.subDomain, data.fileId);

  try {
    const existing = await Job.fromId(mediaOptimizationQueue, jobId);
    if (existing) {
      const state = await existing.getState();
      if (BLOCKING_JOB_STATES.has(state)) {
        try {
          await existing.updateData(data);
        } catch {
          // ignore update failures on active jobs
        }
        return { ok: true, jobId };
      }
      await existing.remove({ removeChildren: true });
    }

    await mediaOptimizationQueue.add(JOB_NAME, data, { jobId });
    return { ok: true, jobId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Failed to queue media optimization (is Redis running?): ${msg}`,
    };
  }
}

/** @deprecated Prefer enqueueMediaOptimization */
export async function enqueueImageOptimization(
  data: MediaOptimizationJobData,
): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  return enqueueMediaOptimization({
    ...data,
    mediaType: data.mediaType || "image",
  });
}

export async function cancelMediaOptimizationJob(
  subDomain: string,
  fileId: string,
): Promise<void> {
  const jobId = createMediaOptimizationJobId(subDomain, fileId);
  try {
    const existing = await Job.fromId(mediaOptimizationQueue, jobId);
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

/** @deprecated Prefer cancelMediaOptimizationJob */
export const cancelImageOptimizationJob = cancelMediaOptimizationJob;
