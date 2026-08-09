/**
 * BullMQ worker: dispatch image (Sharp) or video (FFmpeg) optimization.
 */

import { Worker, type Job } from "bullmq";

import { getDriver } from "~/cypher/core/driver";
import {
  CURRENT_MEDIA_PROCESSING_VERSION,
  detectMediaType,
  loadMediaOptimizationConfig,
} from "~/lib/files/mediaOptimizationConfig";
import {
  loadFileVertexById,
  patchFileMetadata,
} from "~/lib/files/patchFileMetadata";
import { processImageVariants } from "~/lib/files/processImageVariants";
import {
  processVideoVariants,
  probeVideo,
} from "~/lib/files/processVideoVariants";
import { deleteVariantDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import { logger } from "~/lib/logger";
import { redisConnection } from "../redisConfig";
import type { MediaOptimizationJobData } from "../mediaOptimizationQueue";

declare global {
  var __mediaOptimizationWorker: Worker<MediaOptimizationJobData> | undefined;
  var __mediaOptimizationWorkerStartPromise:
    | Promise<Worker<MediaOptimizationJobData>>
    | undefined;
  var __imageOptimizationWorker: Worker<MediaOptimizationJobData> | undefined;
  var __imageOptimizationWorkerStartPromise:
    | Promise<Worker<MediaOptimizationJobData>>
    | undefined;
}

if (!global.__mediaOptimizationWorker) {
  global.__mediaOptimizationWorker = undefined;
}
if (!global.__mediaOptimizationWorkerStartPromise) {
  global.__mediaOptimizationWorkerStartPromise = undefined;
}

async function processJob(job: Job<MediaOptimizationJobData>) {
  const start = Date.now();
  const bullId = String(job.id ?? "");
  const { fileId, subDomain, generation } = job.data;

  logger.logJob({
    jobId: bullId,
    jobName: "media-optimization",
    queueName: "media-optimization",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  const driver = await getDriver();
  const session = driver.session({ database: subDomain });

  try {
    const file = await loadFileVertexById(session, fileId);
    if (!file) {
      logger.info(
        { fileId, subDomain },
        "Media optimization skipped: File not found",
      );
      return { skipped: true, reason: "file_not_found" };
    }

    const currentGeneration = Number(file.P?.optimizationGeneration) || 0;
    if (generation != null && currentGeneration !== generation) {
      logger.info(
        { fileId, subDomain, generation, currentGeneration },
        "Media optimization skipped: generation mismatch",
      );
      return { skipped: true, reason: "generation_mismatch" };
    }

    const filePath =
      file.P?.filePath == null ? "" : String(file.P.filePath).trim();
    if (!filePath) {
      await patchFileMetadata(session, fileId, {
        status: "failed",
        optimizationError: "Missing filePath",
      });
      return { skipped: true, reason: "missing_path" };
    }

    const mediaType =
      job.data.mediaType ||
      (file.P?.mediaType as "image" | "video" | undefined) ||
      detectMediaType({
        mimeType: file.P?.mimeType == null ? null : String(file.P.mimeType),
        fileName: file.P?.fileName == null ? null : String(file.P.fileName),
        isVideoProbe: Boolean(await probeVideo(filePath)),
      });

    if (!mediaType) {
      await patchFileMetadata(session, fileId, {
        status: "ready",
        variantsJson: "{}",
        processingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
        optimizationError: null,
        optimizedAt: new Date().toISOString(),
      });
      return { skipped: true, reason: "not_media" };
    }

    const { config } = await loadMediaOptimizationConfig(session);

    if (mediaType === "image") {
      if (!config.image.enabled) {
        await patchFileMetadata(session, fileId, {
          status: "ready",
          mediaType: "image",
          variantsJson: "{}",
          processingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
          optimizationError: null,
          optimizedAt: new Date().toISOString(),
        });
        return { skipped: true, reason: "image_disabled" };
      }

      await deleteVariantDiskArtifacts(file.P);
      const result = await processImageVariants(filePath, config.image);

      const fresh = await loadFileVertexById(session, fileId);
      if (!fresh) {
        await deleteVariantDiskArtifacts({
          variantsJson: result.variantsJson,
        });
        return { skipped: true, reason: "deleted_during_processing" };
      }
      const freshGeneration = Number(fresh.P?.optimizationGeneration) || 0;
      if (generation != null && freshGeneration !== generation) {
        await deleteVariantDiskArtifacts({
          variantsJson: result.variantsJson,
        });
        return { skipped: true, reason: "stale_after_processing" };
      }

      const patched = await patchFileMetadata(session, fileId, {
        status: "ready",
        mediaType: "image",
        width: result.width,
        height: result.height,
        aspectRatio: result.aspectRatio,
        variantsJson: result.variantsJson,
        processingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
        optimizedAt: new Date().toISOString(),
        optimizationError: null,
      });
      if (!patched) {
        await deleteVariantDiskArtifacts({
          variantsJson: result.variantsJson,
        });
        throw new Error(
          `Media optimization patch failed: File ${fileId} not found after processing`,
        );
      }

      logger.logJob({
        jobId: bullId,
        jobName: "media-optimization",
        queueName: "media-optimization",
        attemptsMade: job.attemptsMade,
        duration: Date.now() - start,
        status: "completed",
      });

      return {
        ok: true,
        mediaType: "image",
        variants: Object.keys(result.variants),
      };
    }

    // video
    if (!config.video.enabled) {
      await patchFileMetadata(session, fileId, {
        status: "ready",
        mediaType: "video",
        variantsJson: "{}",
        processingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
        optimizationError: null,
        optimizedAt: new Date().toISOString(),
      });
      return { skipped: true, reason: "video_disabled" };
    }

    await deleteVariantDiskArtifacts(file.P);
    const result = await processVideoVariants(filePath, config.video);

    const fresh = await loadFileVertexById(session, fileId);
    if (!fresh) {
      await deleteVariantDiskArtifacts({
        variantsJson: result.variantsJson,
      });
      return { skipped: true, reason: "deleted_during_processing" };
    }
    const freshGeneration = Number(fresh.P?.optimizationGeneration) || 0;
    if (generation != null && freshGeneration !== generation) {
      await deleteVariantDiskArtifacts({
        variantsJson: result.variantsJson,
      });
      return { skipped: true, reason: "stale_after_processing" };
    }

    const patched = await patchFileMetadata(session, fileId, {
      status: "ready",
      mediaType: "video",
      width: result.width,
      height: result.height,
      aspectRatio: result.aspectRatio,
      duration: result.duration,
      fps: result.fps,
      bitrate: result.bitrate,
      codec: result.codec,
      audioCodec: result.audioCodec,
      variantsJson: result.variantsJson,
      processingVersion: CURRENT_MEDIA_PROCESSING_VERSION,
      optimizedAt: new Date().toISOString(),
      optimizationError: null,
    });
    if (!patched) {
      await deleteVariantDiskArtifacts({
        variantsJson: result.variantsJson,
      });
      throw new Error(
        `Media optimization patch failed: File ${fileId} not found after processing`,
      );
    }

    logger.logJob({
      jobId: bullId,
      jobName: "media-optimization",
      queueName: "media-optimization",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "completed",
    });

    return {
      ok: true,
      mediaType: "video",
      variants: Object.keys(result.variants),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await patchFileMetadata(session, fileId, {
        status: "failed",
        optimizationError: message.slice(0, 1000),
      });
    } catch {
      // ignore patch failure
    }
    logger.logJob({
      jobId: bullId,
      jobName: "media-optimization",
      queueName: "media-optimization",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "failed",
      error: message,
    });
    throw error;
  } finally {
    await session.close();
  }
}

export async function startMediaOptimizationWorker() {
  if (global.__mediaOptimizationWorkerStartPromise) {
    return global.__mediaOptimizationWorkerStartPromise;
  }

  global.__mediaOptimizationWorkerStartPromise = (async () => {
    logger.info("Starting media optimization worker...");

    // Concurrency 1 keeps video transcodes from starving the host;
    // images share the same queue and still process sequentially here.
    const w = new Worker<MediaOptimizationJobData>(
      "media-optimization",
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
          queueName: "media-optimization",
          error: err instanceof Error ? err.message : String(err),
        },
        "Media optimization worker error",
      );
    });

    global.__mediaOptimizationWorker = w;
    global.__imageOptimizationWorker = w;
    logger.info("Media optimization worker started");
    return w;
  })();

  global.__imageOptimizationWorkerStartPromise =
    global.__mediaOptimizationWorkerStartPromise;

  return global.__mediaOptimizationWorkerStartPromise;
}

export async function stopMediaOptimizationWorker(force = false) {
  if (!global.__mediaOptimizationWorker) {
    return;
  }
  logger.info(
    `Stopping media optimization worker${force ? " (force)" : ""}...`,
  );
  await global.__mediaOptimizationWorker.close(force);
  global.__mediaOptimizationWorker = undefined;
  global.__mediaOptimizationWorkerStartPromise = undefined;
  global.__imageOptimizationWorker = undefined;
  global.__imageOptimizationWorkerStartPromise = undefined;
  logger.info("Media optimization worker stopped");
}

/** @deprecated Prefer startMediaOptimizationWorker */
export const startImageOptimizationWorker = startMediaOptimizationWorker;
/** @deprecated Prefer stopMediaOptimizationWorker */
export const stopImageOptimizationWorker = stopMediaOptimizationWorker;
