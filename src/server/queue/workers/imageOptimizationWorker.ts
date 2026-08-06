/**
 * Backward-compatible re-exports for image optimization worker callers.
 * Prefer mediaOptimizationWorker for new code.
 */

export {
  startImageOptimizationWorker,
  startMediaOptimizationWorker,
  stopImageOptimizationWorker,
  stopMediaOptimizationWorker,
} from "./mediaOptimizationWorker";
