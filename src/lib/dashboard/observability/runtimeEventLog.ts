/**
 * Compact replayable runtime event log + chronological timeline.
 */

import type { RuntimeCausality } from "./runtimeCausality";

export type RuntimeTimelineEventType =
  | "mutation"
  | "invalidate"
  | "compress"
  | "scheduler_enqueue"
  | "scheduler_flush"
  | "execution_begin"
  | "execution_pending_commit"
  | "execution_commit"
  | "execution_stale"
  | "execution_cancel"
  | "lifecycle"
  | "cache_hit"
  | "cache_miss"
  | "scope_dispose";

export type RuntimeTimelineEntry = {
  at: number;
  type: RuntimeTimelineEventType;
  causality?: RuntimeCausality;
  detail?: Record<string, unknown>;
};

export type DashboardRuntimeEventLog = {
  push: (type: RuntimeTimelineEventType, detail?: Record<string, unknown>, causality?: RuntimeCausality) => void;
  getTimeline: () => RuntimeTimelineEntry[];
  getWaterfall: (invalidationId?: string) => RuntimeTimelineEntry[];
  snapshot: () => { timeline: RuntimeTimelineEntry[] };
  clear: () => void;
};

const MAX_ENTRIES = 400;

export function createDashboardRuntimeEventLog(): DashboardRuntimeEventLog {
  const entries: RuntimeTimelineEntry[] = [];

  return {
    push(type, detail, causality) {
      entries.push({
        at: Date.now(),
        type,
        causality: causality ? { ...causality } : undefined,
        detail: detail ? { ...detail } : undefined,
      });
      if (entries.length > MAX_ENTRIES) entries.shift();
    },
    getTimeline() {
      return [...entries].sort((a, b) => a.at - b.at);
    },
    getWaterfall(invalidationId) {
      if (!invalidationId) return this.getTimeline();
      const relatedIds = new Set<string>([invalidationId]);
      for (const entry of entries) {
        if (entry.causality?.invalidationId) relatedIds.add(entry.causality.invalidationId);
        if (entry.causality?.parentInvalidationId) relatedIds.add(entry.causality.parentInvalidationId);
        if (entry.causality?.batchId) relatedIds.add(entry.causality.batchId);
      }
      return entries
        .filter((entry) => {
          const c = entry.causality;
          if (!c) return false;
          return (
            (c.invalidationId && relatedIds.has(c.invalidationId)) ||
            (c.batchId && relatedIds.has(c.batchId)) ||
            (c.parentInvalidationId && relatedIds.has(c.parentInvalidationId))
          );
        })
        .sort((a, b) => a.at - b.at);
    },
    snapshot() {
      return { timeline: this.getTimeline() };
    },
    clear() {
      entries.length = 0;
    },
  };
}
