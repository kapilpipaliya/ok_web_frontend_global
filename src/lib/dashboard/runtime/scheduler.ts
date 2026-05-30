import type { WidgetLifecyclePhase } from "./widgetLifecycle";
import type { RuntimeCausality } from "../observability/runtimeCausality";

export type RefreshPriority = "low" | "normal" | "high";

export type ScheduleRefreshOptions = {
  priority?: RefreshPriority;
  reason?: string;
  staleWhileRevalidate?: boolean;
  debounceMs?: number;
  causality?: RuntimeCausality;
  batchId?: string;
  rawEventCount?: number;
};

export type SchedulerFlushMeta = {
  reason?: string;
  staleWhileRevalidate?: boolean;
  causality?: RuntimeCausality;
  batchId?: string;
  widgetCount?: number;
  rawEventCount?: number;
  coalescedWidgetCount?: number;
};

export type RefreshExecutor = (
  widgetIds: string[],
  meta: SchedulerFlushMeta,
) => void | Promise<void>;

export type SchedulerState = {
  queue: { widgetId: string; priority: number; reason?: string; swr?: boolean }[];
  pendingFlush: boolean;
  lastFlushAt: number;
  flushCount: number;
};

export type DashboardRuntimeScheduler = {
  schedule: (widgetIds: string | string[], options?: ScheduleRefreshOptions) => void;
  flush: () => Promise<void>;
  clear: () => void;
  getState: () => SchedulerState;
  onLifecycle?: (widgetId: string, phase: WidgetLifecyclePhase) => void;
  onFlush?: (meta: SchedulerFlushMeta) => void;
};

const PRIORITY_MAP: Record<RefreshPriority, number> = {
  low: 0,
  normal: 5,
  high: 10,
};

export function createDashboardRuntimeScheduler(
  execute: RefreshExecutor,
  defaults: { debounceMs?: number; batchWindowMs?: number } = {},
): DashboardRuntimeScheduler {
  const debounceMs = defaults.debounceMs ?? 50;
  const batchWindowMs = defaults.batchWindowMs ?? 16;

  const queue = new Map<
    string,
    { priority: number; reason?: string; swr?: boolean; rawEventCount: number }
  >();

  let lastCausality: RuntimeCausality | undefined;
  let lastBatchId: string | undefined;
  let pendingRawEventCount = 0;
  let onFlushHook: ((meta: SchedulerFlushMeta) => void) | undefined;

  let pendingFlush = false;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let batchTimer: ReturnType<typeof setTimeout> | null = null;
  let flushCount = 0;
  let lastFlushAt = 0;
  let onLifecycle: ((widgetId: string, phase: WidgetLifecyclePhase) => void) | undefined;

  const flushNow = async () => {
    if (queue.size === 0) return;
    const jobs = [...queue.entries()]
      .sort((a, b) => b[1].priority - a[1].priority)
      .map(([widgetId, meta]) => ({ widgetId, ...meta }));
    queue.clear();
    pendingFlush = false;
    flushCount += 1;
    lastFlushAt = Date.now();

    const widgetIds = jobs.map((j) => j.widgetId);
    const swr = jobs.some((j) => j.swr);
    const reason = jobs.map((j) => j.reason).filter(Boolean).join("; ") || undefined;
    const rawEventCount = pendingRawEventCount || jobs.reduce((sum, j) => sum + (j.rawEventCount || 1), 0);
    const coalescedWidgetCount = Math.max(0, rawEventCount - widgetIds.length);
    pendingRawEventCount = 0;

    const meta: SchedulerFlushMeta = {
      reason,
      staleWhileRevalidate: swr,
      causality: lastCausality,
      batchId: lastBatchId,
      widgetCount: widgetIds.length,
      rawEventCount,
      coalescedWidgetCount,
    };
    lastCausality = undefined;
    lastBatchId = undefined;

    onFlushHook?.(meta);

    for (const id of widgetIds) {
      onLifecycle?.(id, swr ? "STALE" : "REFRESHING");
    }

    try {
      await execute(widgetIds, meta);
      for (const id of widgetIds) onLifecycle?.(id, "READY");
    } catch (e) {
      console.error("DashboardRuntimeScheduler flush error:", e);
      for (const id of widgetIds) onLifecycle?.(id, "ERROR");
    }
  };

  const scheduleFlush = (delayMs: number) => {
    if (flushTimer) clearTimeout(flushTimer);
    pendingFlush = true;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      if (batchTimer) clearTimeout(batchTimer);
      batchTimer = setTimeout(() => {
        batchTimer = null;
        void flushNow();
      }, batchWindowMs);
    }, delayMs);
  };

  return {
    get onLifecycle() {
      return onLifecycle;
    },
    set onLifecycle(handler) {
      onLifecycle = handler;
    },
    get onFlush() {
      return onFlushHook;
    },
    set onFlush(handler) {
      onFlushHook = handler;
    },
    schedule(widgetIds, options = {}) {
      const ids = Array.isArray(widgetIds) ? widgetIds : [widgetIds];
      const priority = PRIORITY_MAP[options.priority || "normal"];
      pendingRawEventCount += Number(options.rawEventCount || ids.length || 1);
      if (options.causality) lastCausality = options.causality;
      if (options.batchId) lastBatchId = options.batchId;
      for (const widgetId of ids) {
        if (!widgetId) continue;
        const existing = queue.get(widgetId);
        queue.set(widgetId, {
          priority: Math.max(existing?.priority ?? 0, priority),
          reason: options.reason || existing?.reason,
          swr: options.staleWhileRevalidate ?? existing?.swr,
          rawEventCount: (existing?.rawEventCount || 0) + Number(options.rawEventCount || 1),
        });
      }
      scheduleFlush(options.debounceMs ?? debounceMs);
    },
    async flush() {
      if (flushTimer) clearTimeout(flushTimer);
      if (batchTimer) clearTimeout(batchTimer);
      flushTimer = null;
      batchTimer = null;
      await flushNow();
    },
    clear() {
      queue.clear();
      if (flushTimer) clearTimeout(flushTimer);
      if (batchTimer) clearTimeout(batchTimer);
      flushTimer = null;
      batchTimer = null;
      pendingFlush = false;
    },
    getState() {
      return {
        queue: [...queue.entries()].map(([widgetId, meta]) => ({
          widgetId,
          priority: meta.priority,
          reason: meta.reason,
          swr: meta.swr,
        })),
        pendingFlush,
        lastFlushAt,
        flushCount,
      };
    },
  };
}
