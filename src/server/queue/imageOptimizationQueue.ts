/**
 * Backward-compatible re-exports for image optimization queue callers.
 * Prefer mediaOptimizationQueue for new code.
 */

export {
  cancelImageOptimizationJob,
  cancelMediaOptimizationJob,
  createImageOptimizationJobId,
  createMediaOptimizationJobId,
  enqueueImageOptimization,
  enqueueMediaOptimization,
  imageOptimizationQueue,
  mediaOptimizationQueue,
  type ImageOptimizationJobData,
  type MediaOptimizationJobData,
} from "../mediaOptimizationQueue";
