/**
 * Realtime invalidation bridge — backend poll/events → logicalKeys/signatures → platformApi.invalidate()
 */

import type { DashboardPlatformAPI } from "../runtime/platformApi";
import type { MutationEvent } from "../contracts/mutationContracts";
import { resolveMutationInvalidationTargets } from "../contracts/mutationContracts";
import type { DashboardDevtoolsCollector } from "../observability/devtools";
import { createRuntimeCausality } from "../observability/runtimeCausality";

export type DashboardRealtimeConfig = {
  enabled?: boolean;
  channel?: string;
  pollingIntervalMs?: number;
  staleWhileRevalidate?: boolean;
  logicalKey?: string;
  entities?: {
    vertexLabel?: string;
    vertex?: string;
    timestampField?: string;
    logicalKeys?: string[];
  }[];
};

export type PollRealtimeEventsFn = (context: {
  dashboardKey: string;
  channel: string;
  watermark: string;
  realtimeConfig: DashboardRealtimeConfig;
}) => Promise<{
  success?: boolean;
  error?: string;
  result?: {
    success?: boolean;
    data?: {
      watermark?: string;
      hasChanges?: boolean;
      events?: MutationEvent[];
      invalidation?: {
        logicalKeys?: string[];
        querySignatures?: string[];
      };
    };
  };
}>;

export type RealtimeInvalidationBridge = {
  start: () => void;
  stop: () => void;
  pollOnce: () => Promise<boolean>;
  getWatermark: () => string;
  dispose: () => void;
};

export type CreateRealtimeBridgeOptions = {
  platformApi: DashboardPlatformAPI;
  dashboardKey: string;
  realtimeConfig: DashboardRealtimeConfig;
  pollEvents: PollRealtimeEventsFn;
  devtools?: DashboardDevtoolsCollector | null;
  onPollError?: (error: unknown) => void;
};

function mergeInvalidationTargets(
  base: { logicalKeys: string[]; querySignatures: string[] },
  events: MutationEvent[],
) {
  const logicalKeys = new Set(base.logicalKeys);
  const querySignatures = new Set(base.querySignatures);

  for (const event of events) {
    const mapped = resolveMutationInvalidationTargets(event);
    for (const key of mapped.logicalKeys) logicalKeys.add(key);
    for (const sig of mapped.querySignatures) querySignatures.add(sig);
  }

  return {
    logicalKeys: [...logicalKeys],
    querySignatures: [...querySignatures],
  };
}

export function createRealtimeInvalidationBridge(
  options: CreateRealtimeBridgeOptions,
): RealtimeInvalidationBridge {
  const { platformApi, dashboardKey, realtimeConfig, pollEvents, devtools } =
    options;
  const channel = String(realtimeConfig.channel || "dashboard");
  const intervalMs = Number(realtimeConfig.pollingIntervalMs || 30000);
  const staleWhileRevalidate = realtimeConfig.staleWhileRevalidate !== false;

  let watermark = new Date(Date.now() - intervalMs).toISOString();
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let polling = false;
  let disposed = false;

  const pollOnce = async (): Promise<boolean> => {
    if (disposed || polling) return false;
    polling = true;
    try {
      const response = await pollEvents({
        dashboardKey,
        channel,
        watermark,
        realtimeConfig,
      });

      if (response?.error) {
        options.onPollError?.(response.error);
        return false;
      }

      const payload = response?.result?.data;
      if (!payload) return false;

      if (payload.watermark) watermark = payload.watermark;

      const serverInvalidation = payload.invalidation || {
        logicalKeys: [],
        querySignatures: [],
      };
      const events = Array.isArray(payload.events) ? payload.events : [];
      const merged = mergeInvalidationTargets(
        {
          logicalKeys: serverInvalidation.logicalKeys || [],
          querySignatures: serverInvalidation.querySignatures || [],
        },
        events,
      );

      const shouldInvalidate =
        payload.hasChanges === true ||
        merged.logicalKeys.length > 0 ||
        events.length > 0;

      if (!shouldInvalidate) return false;

      if (devtools) {
        devtools.pushExecution({
          phase: "realtime_bridge",
          channel,
          eventCount: events.length,
          logicalKeys: merged.logicalKeys,
        });
      }

      const realtimeEventId =
        events.length === 1 && events[0]?.entityId
          ? `rt_${events[0].type}_${events[0].entityId}`
          : `rt_batch_${events.length}`;

      platformApi.invalidate({
        logicalKeys: merged.logicalKeys,
        querySignatures: merged.querySignatures,
        reason: "realtime_event",
        source: "realtime",
        staleWhileRevalidate,
        rawEventCount: Math.max(events.length, 1),
        realtimeEventId,
        causality: createRuntimeCausality({
          source: "realtime",
          cause: "realtime_event",
          realtimeEventId,
        }),
      });

      return true;
    } catch (error) {
      options.onPollError?.(error);
      return false;
    } finally {
      polling = false;
    }
  };

  return {
    getWatermark() {
      return watermark;
    },
    start() {
      if (disposed || pollTimer) return;
      void pollOnce();
      pollTimer = setInterval(() => {
        void pollOnce();
      }, intervalMs);
    },
    stop() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    },
    pollOnce,
    dispose() {
      disposed = true;
      this.stop();
    },
  };
}
