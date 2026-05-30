/**
 * Causality metadata for invalidations, executions, and scheduler batches.
 */

export type RuntimeEventSource =
  | "mutation"
  | "realtime"
  | "interaction"
  | "filter"
  | "manual"
  | "scheduler"
  | "execution"
  | "system";

let idCounter = 0;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Date.now().toString(36)}`;
}

export type RuntimeCausality = {
  invalidationId?: string;
  mutationId?: string;
  realtimeEventId?: string;
  executionId?: string;
  batchId?: string;
  source: RuntimeEventSource;
  cause?: string;
  parentInvalidationId?: string;
};

export function createRuntimeCausality(
  partial: Partial<RuntimeCausality> & { source: RuntimeEventSource },
): RuntimeCausality {
  return {
    invalidationId: partial.invalidationId || nextId("inv"),
    mutationId: partial.mutationId,
    realtimeEventId: partial.realtimeEventId,
    executionId: partial.executionId,
    batchId: partial.batchId,
    source: partial.source,
    cause: partial.cause,
    parentInvalidationId: partial.parentInvalidationId,
  };
}
