/**
 * Runtime telemetry — metrics for orchestration health.
 */

export type RuntimeTelemetrySnapshot = {
  invalidationFanout: { total: number; avg: number; max: number };
  schedulerQueueDepth: { current: number; max: number };
  staleExecutionRejects: number;
  executionCancellations: number;
  executionDurationMs: { count: number; avg: number; p95: number };
  cacheHits: number;
  cacheMisses: number;
  refreshCoalescingRatio: number;
  entityRefreshRate: number;
  scopeDisposals: number;
  compressionRatio: { avg: number; last: number };
  rawInvalidationEvents: number;
  compressedBatches: number;
};

export type DashboardRuntimeTelemetry = {
  recordInvalidationFanout: (
    widgetCount: number,
    rawEventCount: number,
  ) => void;
  recordCompression: (rawEventCount: number, widgetCount: number) => void;
  recordSchedulerEnqueue: (queueDepth: number) => void;
  recordStaleReject: () => void;
  recordExecutionCancel: () => void;
  recordExecutionDuration: (ms: number) => void;
  recordCacheHit: () => void;
  recordCacheMiss: () => void;
  recordScopeDisposal: () => void;
  recordEntityRefresh: () => void;
  snapshot: () => RuntimeTelemetrySnapshot;
  reset: () => void;
};

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[index];
}

export function createDashboardRuntimeTelemetry(): DashboardRuntimeTelemetry {
  const fanoutSamples: number[] = [];
  let schedulerMaxDepth = 0;
  let schedulerCurrentDepth = 0;
  let staleRejects = 0;
  let executionCancels = 0;
  const durations: number[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;
  let rawInvalidationEvents = 0;
  let compressedBatches = 0;
  let compressionRatioSum = 0;
  let lastCompressionRatio = 1;
  let scopeDisposals = 0;
  let entityRefreshes = 0;
  let coalescedRefreshes = 0;
  let totalScheduledRefreshes = 0;

  return {
    recordInvalidationFanout(widgetCount, rawEventCount) {
      fanoutSamples.push(widgetCount);
      rawInvalidationEvents += rawEventCount;
    },
    recordCompression(rawEventCount, widgetCount) {
      compressedBatches += 1;
      const ratio = rawEventCount / Math.max(widgetCount, 1);
      compressionRatioSum += ratio;
      lastCompressionRatio = ratio;
      coalescedRefreshes += Math.max(0, rawEventCount - widgetCount);
      totalScheduledRefreshes += widgetCount;
    },
    recordSchedulerEnqueue(queueDepth) {
      schedulerCurrentDepth = queueDepth;
      schedulerMaxDepth = Math.max(schedulerMaxDepth, queueDepth);
    },
    recordStaleReject() {
      staleRejects += 1;
    },
    recordExecutionCancel() {
      executionCancels += 1;
    },
    recordExecutionDuration(ms) {
      durations.push(ms);
      if (durations.length > 500) durations.shift();
    },
    recordCacheHit() {
      cacheHits += 1;
    },
    recordCacheMiss() {
      cacheMisses += 1;
    },
    recordScopeDisposal() {
      scopeDisposals += 1;
    },
    recordEntityRefresh() {
      entityRefreshes += 1;
    },
    snapshot() {
      const fanoutTotal = fanoutSamples.reduce((sum, value) => sum + value, 0);
      const fanoutAvg = fanoutSamples.length
        ? fanoutTotal / fanoutSamples.length
        : 0;
      const fanoutMax = fanoutSamples.length ? Math.max(...fanoutSamples) : 0;
      const durationAvg = durations.length
        ? durations.reduce((sum, value) => sum + value, 0) / durations.length
        : 0;
      const cacheTotal = cacheHits + cacheMisses;
      return {
        invalidationFanout: {
          total: fanoutTotal,
          avg: fanoutAvg,
          max: fanoutMax,
        },
        schedulerQueueDepth: {
          current: schedulerCurrentDepth,
          max: schedulerMaxDepth,
        },
        staleExecutionRejects: staleRejects,
        executionCancellations: executionCancels,
        executionDurationMs: {
          count: durations.length,
          avg: durationAvg,
          p95: percentile(durations, 0.95),
        },
        cacheHits,
        cacheMisses,
        refreshCoalescingRatio:
          totalScheduledRefreshes > 0
            ? coalescedRefreshes / totalScheduledRefreshes
            : 0,
        entityRefreshRate: entityRefreshes,
        scopeDisposals,
        compressionRatio: {
          avg:
            compressedBatches > 0 ? compressionRatioSum / compressedBatches : 0,
          last: lastCompressionRatio,
        },
        rawInvalidationEvents,
        compressedBatches,
      };
    },
    reset() {
      fanoutSamples.length = 0;
      schedulerMaxDepth = 0;
      schedulerCurrentDepth = 0;
      staleRejects = 0;
      executionCancels = 0;
      durations.length = 0;
      cacheHits = 0;
      cacheMisses = 0;
      rawInvalidationEvents = 0;
      compressedBatches = 0;
      compressionRatioSum = 0;
      lastCompressionRatio = 1;
      scopeDisposals = 0;
      entityRefreshes = 0;
      coalescedRefreshes = 0;
      totalScheduledRefreshes = 0;
    },
  };
}
