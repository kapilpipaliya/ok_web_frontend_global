/**
 * BullMQ worker: generate WebP image variants and update File vertex metadata.
 */

import { Worker, type Job } from "bullmq";

import { getDriver } from "~/cypher/core/driver";
import { loadImageOptimizationConfig } from "~/lib/files/imageOptimizationConfig";
import {
  loadFileVertexById,
  patchFileMetadata,
} from "~/lib/files/patchFileMetadata";
import { processImageVariants } from "~/lib/files/processImageVariants";
import { deleteVariantDiskArtifacts } from "~/lib/files/deleteFileDiskArtifacts";
import { logger } from "~/lib/logger";
import { redisConnection } from "../redisConfig";
import type { ImageOptimizationJobData } from "../imageOptimizationQueue";

declare global {
  var __imageOptimizationWorker: Worker<ImageOptimizationJobData> | undefined;
  var __imageOptimizationWorkerStartPromise:
    | Promise<Worker<ImageOptimizationJobData>>
    | undefined;
}

if (!global.__imageOptimizationWorker) {
  global.__imageOptimizationWorker = undefined;
}
if (!global.__imageOptimizationWorkerStartPromise) {
  global.__imageOptimizationWorkerStartPromise = undefined;
}

async function processJob(job: Job<ImageOptimizationJobData>) {
  const start = Date.now();
  const bullId = String(job.id ?? "");
  const { fileId, subDomain, generation } = job.data;

  logger.logJob({
    jobId: bullId,
    jobName: "image-optimization",
    queueName: "image-optimization",
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
        "Image optimization skipped: File not found",
      );
      return { skipped: true, reason: "file_not_found" };
    }

    const currentGeneration = Number(file.P?.optimizationGeneration) || 0;
    if (generation != null && currentGeneration !== generation) {
      logger.info(
        { fileId, subDomain, generation, currentGeneration },
        "Image optimization skipped: generation mismatch",
      );
      return { skipped: true, reason: "generation_mismatch" };
    }

    const filePath =
      file.P?.filePath != null ? String(file.P.filePath).trim() : "";
    if (!filePath) {
      await patchFileMetadata(session, fileId, {
        status: "failed",
        optimizationError: "Missing filePath",
      });
      return { skipped: true, reason: "missing_path" };
    }

    const { config } = await loadImageOptimizationConfig(session);
    if (!config.enabled) {
      await patchFileMetadata(session, fileId, {
        status: "ready",
        variantsJson: "{}",
        optimizationError: null,
        optimizedAt: new Date().toISOString(),
      });
      return { skipped: true, reason: "disabled" };
    }

    // Clear previous variants before rewriting
    await deleteVariantDiskArtifacts(file.P);

    const result = await processImageVariants(filePath, config);

    // Re-check generation after expensive work
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

    await patchFileMetadata(session, fileId, {
      status: "ready",
      width: result.width,
      height: result.height,
      aspectRatio: result.aspectRatio,
      variantsJson: result.variantsJson,
      optimizedAt: new Date().toISOString(),
      optimizationError: null,
    });

    logger.logJob({
      jobId: bullId,
      jobName: "image-optimization",
      queueName: "image-optimization",
      attemptsMade: job.attemptsMade,
      duration: Date.now() - start,
      status: "completed",
    });

    return {
      ok: true,
      variants: Object.keys(result.variants),
      width: result.width,
      height: result.height,
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
      jobName: "image-optimization",
      queueName: "image-optimization",
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

export async function startImageOptimizationWorker() {
  if (global.__imageOptimizationWorkerStartPromise) {
    return global.__imageOptimizationWorkerStartPromise;
  }

  global.__imageOptimizationWorkerStartPromise = (async () => {
    logger.info("Starting image optimization worker...");

    const w = new Worker<ImageOptimizationJobData>(
      "image-optimization",
      processJob,
      {
        connection: redisConnection,
        concurrency: 2,
      },
    );

    w.on("error", (err) => {
      logger.error(
        {
          type: "worker_error",
          queueName: "image-optimization",
          error: err instanceof Error ? err.message : String(err),
        },
        "Image optimization worker error",
      );
    });

    global.__imageOptimizationWorker = w;
    logger.info("Image optimization worker started");
    return w;
  })();

  return global.__imageOptimizationWorkerStartPromise;
}

export async function stopImageOptimizationWorker(force = false) {
  if (!global.__imageOptimizationWorker) {
    return;
  }
  logger.info(
    `Stopping image optimization worker${force ? " (force)" : ""}...`,
  );
  await global.__imageOptimizationWorker.close(force);
  global.__imageOptimizationWorker = undefined;
  global.__imageOptimizationWorkerStartPromise = undefined;
  logger.info("Image optimization worker stopped");
}
