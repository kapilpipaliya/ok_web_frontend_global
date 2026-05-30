/**
 * Internal dashboard diagnostics collector + timeline hooks.
 */

import type { RuntimeTelemetrySnapshot } from "./runtimeTelemetry";
import type { RuntimeTimelineEntry } from "./runtimeEventLog";

const MAX_LOG = 80;

export type DevtoolsLogEntry = {
  at: number;
  kind: string;
  data: unknown;
};

export type DashboardDevtoolsCollector = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  pushInteraction: (event: unknown) => void;
  pushInvalidation: (event: unknown, widgetIds: string[]) => void;
  pushScheduler: (state: unknown) => void;
  pushMutation: (event: unknown) => void;
  pushExecution: (event: unknown) => void;
  pushTimeline: (entry: RuntimeTimelineEntry) => void;
  pushCompression: (batch: unknown) => void;
  setTelemetry: (snapshot: RuntimeTelemetrySnapshot) => void;
  snapshot: () => {
    interactions: DevtoolsLogEntry[];
    invalidations: DevtoolsLogEntry[];
    scheduler: DevtoolsLogEntry[];
    mutations: DevtoolsLogEntry[];
    executions: DevtoolsLogEntry[];
    timeline: DevtoolsLogEntry[];
    compression: DevtoolsLogEntry[];
    telemetry: RuntimeTelemetrySnapshot | null;
  };
  clear: () => void;
};

function ringPush(list: DevtoolsLogEntry[], kind: string, data: unknown) {
  list.push({ at: Date.now(), kind, data });
  if (list.length > MAX_LOG) list.shift();
}

export function createDashboardDevtoolsCollector(
  initialEnabled = false,
): DashboardDevtoolsCollector {
  let enabled = initialEnabled;
  const interactions: DevtoolsLogEntry[] = [];
  const invalidations: DevtoolsLogEntry[] = [];
  const scheduler: DevtoolsLogEntry[] = [];
  const mutations: DevtoolsLogEntry[] = [];
  const executions: DevtoolsLogEntry[] = [];
  const timeline: DevtoolsLogEntry[] = [];
  const compression: DevtoolsLogEntry[] = [];
  let telemetrySnapshot: RuntimeTelemetrySnapshot | null = null;

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(value) {
      enabled = value;
    },
    pushInteraction(event) {
      if (!enabled) return;
      ringPush(interactions, "interaction", event);
    },
    pushInvalidation(event, widgetIds) {
      if (!enabled) return;
      ringPush(invalidations, "invalidation", { event, widgetIds });
    },
    pushScheduler(state) {
      if (!enabled) return;
      ringPush(scheduler, "scheduler", state);
    },
    pushMutation(event) {
      if (!enabled) return;
      ringPush(mutations, "mutation", event);
    },
    pushExecution(event) {
      if (!enabled) return;
      ringPush(executions, "execution", event);
    },
    pushTimeline(entry) {
      if (!enabled) return;
      ringPush(timeline, "timeline", entry);
    },
    pushCompression(batch) {
      if (!enabled) return;
      ringPush(compression, "compression", batch);
    },
    setTelemetry(snapshot) {
      if (!enabled) return;
      telemetrySnapshot = snapshot;
    },
    snapshot() {
      return {
        interactions: [...interactions],
        invalidations: [...invalidations],
        scheduler: [...scheduler],
        mutations: [...mutations],
        executions: [...executions],
        timeline: [...timeline],
        compression: [...compression],
        telemetry: telemetrySnapshot,
      };
    },
    clear() {
      interactions.length = 0;
      invalidations.length = 0;
      scheduler.length = 0;
      mutations.length = 0;
      executions.length = 0;
      timeline.length = 0;
      compression.length = 0;
      telemetrySnapshot = null;
    },
  };
}
