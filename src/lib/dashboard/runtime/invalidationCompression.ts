/**
 * Invalidation compression — merge burst invalidations before scheduler enqueue.
 */

import type { RuntimeCausality } from "../observability/runtimeCausality";
import type { QuerySubscriptionGraph } from "../query/subscriptionGraph";

export type InvalidationRequest = {
  logicalKeys?: string[];
  querySignatures?: string[];
  widgetIds?: string[];
  reason?: string;
  priority?: "low" | "normal" | "high";
  staleWhileRevalidate?: boolean;
  causality?: RuntimeCausality;
  rawEventCount?: number;
};

export type CompressedInvalidationBatch = {
  batchId: string;
  widgetIds: string[];
  logicalKeys: string[];
  querySignatures: string[];
  rawEventCount: number;
  compressedLogicalKeyCount: number;
  compressionRatio: number;
  reason?: string;
  priority: "low" | "normal" | "high";
  staleWhileRevalidate: boolean;
  causality: RuntimeCausality;
};

export type InvalidationCompressionLayer = {
  ingest: (request: InvalidationRequest) => CompressedInvalidationBatch | null;
  flush: () => CompressedInvalidationBatch | null;
  clear: () => void;
  getPending: () => {
    rawEventCount: number;
    logicalKeyCount: number;
    widgetIdCount: number;
  };
};

let batchCounter = 0;

export function createInvalidationCompressionLayer(options: {
  subscriptionGraph: QuerySubscriptionGraph | null;
  debounceMs?: number;
  onFlush?: (batch: CompressedInvalidationBatch) => void;
}): InvalidationCompressionLayer {
  const debounceMs = options.debounceMs ?? 16;
  const logicalKeys = new Set<string>();
  const querySignatures = new Set<string>();
  const widgetIds = new Set<string>();
  let rawEventCount = 0;
  let lastPriority: "low" | "normal" | "high" = "normal";
  let lastSwr = false;
  let lastReason: string | undefined;
  let lastCausality: RuntimeCausality | undefined;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const buildBatch = (): CompressedInvalidationBatch | null => {
    if (
      logicalKeys.size === 0 &&
      querySignatures.size === 0 &&
      widgetIds.size === 0
    ) {
      return null;
    }

    const resolvedWidgets = new Set(widgetIds);
    const logicalList = [...logicalKeys];
    const signatureList = [...querySignatures];

    if (options.subscriptionGraph) {
      for (const key of logicalList) {
        for (const id of options.subscriptionGraph.resolveWidgetsForLogicalKeys(
          [key],
        )) {
          resolvedWidgets.add(id);
        }
      }
      for (const sig of signatureList) {
        for (const id of options.subscriptionGraph.resolveWidgetsForSignatures([
          sig,
        ])) {
          resolvedWidgets.add(id);
        }
      }
    }

    batchCounter += 1;
    const batchId = `invbatch_${batchCounter}_${Date.now().toString(36)}`;
    const compressedLogicalKeyCount = logicalList.length;
    const raw = rawEventCount || 1;
    const compressionRatio =
      raw > 0 ? raw / Math.max(resolvedWidgets.size, 1) : 1;

    const batch: CompressedInvalidationBatch = {
      batchId,
      widgetIds: [...resolvedWidgets],
      logicalKeys: logicalList,
      querySignatures: signatureList,
      rawEventCount: raw,
      compressedLogicalKeyCount,
      compressionRatio,
      reason: lastReason,
      priority: lastPriority,
      staleWhileRevalidate: lastSwr,
      causality: lastCausality || {
        source: "system",
        cause: lastReason,
        batchId,
      },
    };
    batch.causality.batchId = batchId;

    logicalKeys.clear();
    querySignatures.clear();
    widgetIds.clear();
    rawEventCount = 0;
    lastReason = undefined;
    lastCausality = undefined;

    return batch;
  };

  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      flushTimer = null;
      const batch = buildBatch();
      if (batch) options.onFlush?.(batch);
    }, debounceMs);
  };

  return {
    ingest(request) {
      const count = Number(request.rawEventCount || 1);
      rawEventCount += count;

      for (const key of request.logicalKeys || []) logicalKeys.add(key);
      for (const sig of request.querySignatures || []) querySignatures.add(sig);
      for (const id of request.widgetIds || []) widgetIds.add(id);

      if (request.priority) lastPriority = request.priority;
      if (request.staleWhileRevalidate === true) lastSwr = true;
      if (request.reason) lastReason = request.reason;
      if (request.causality) {
        lastCausality = {
          ...request.causality,
          cause: request.causality.cause || request.reason,
        };
      }

      scheduleFlush();
      return null;
    },
    flush() {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      const batch = buildBatch();
      if (batch) options.onFlush?.(batch);
      return batch;
    },
    clear() {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      logicalKeys.clear();
      querySignatures.clear();
      widgetIds.clear();
      rawEventCount = 0;
    },
    getPending() {
      return {
        rawEventCount,
        logicalKeyCount: logicalKeys.size,
        widgetIdCount: widgetIds.size,
      };
    },
  };
}
