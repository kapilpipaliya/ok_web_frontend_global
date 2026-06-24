import type { DashboardCache } from "../query/cacheManager";
import type {
  RuntimeCausality,
  RuntimeEventSource,
} from "../observability/runtimeCausality";

export type InvalidationEvent = {
  type?: "invalidate";
  querySignatures?: string[];
  logicalKeys?: string[];
  widgetIds?: string[];
  entityType?: string;
  entityId?: string;
  reason?: string;
  priority?: "low" | "normal" | "high";
  staleWhileRevalidate?: boolean;
  source?: RuntimeEventSource;
  causality?: RuntimeCausality;
  mutationId?: string;
  realtimeEventId?: string;
  rawEventCount?: number;
  immediate?: boolean;
};

export type InvalidationListener = (
  event: InvalidationEvent,
  affectedWidgetIds: string[],
) => void;

export type DashboardInvalidationBus = {
  publish: (event: InvalidationEvent) => string[];
  subscribe: (listener: InvalidationListener) => () => void;
};

export function createInvalidationBus(
  cache: DashboardCache,
): DashboardInvalidationBus {
  const listeners = new Set<InvalidationListener>();

  return {
    publish(event) {
      const affected = new Set<string>();
      if (event.querySignatures?.length) {
        for (const widgetId of cache.invalidateSignatures(
          event.querySignatures,
        )) {
          affected.add(widgetId);
        }
      }
      if (event.widgetIds?.length) {
        cache.invalidateWidgets(event.widgetIds);
        for (const id of event.widgetIds) affected.add(id);
      }
      const list = [...affected];
      for (const listener of listeners) {
        try {
          listener(event, list);
        } catch (e) {
          console.error("DashboardInvalidationBus listener error:", e);
        }
      }
      return list;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
