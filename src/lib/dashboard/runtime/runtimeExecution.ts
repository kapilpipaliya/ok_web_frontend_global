/**
 * Execution coordinator — generational ownership, stale rejection, commit phase.
 */

export type ExecutionStatus =
  | "running"
  | "pending_commit"
  | "committed"
  | "cancelled"
  | "stale";

export type ExecutionRecord = {
  executionId: string;
  runtimeScopeId: string;
  widgetId: string;
  querySignature: string;
  generation: number;
  startedAt: number;
  parentMutationId?: string;
  reason?: string;
  status: ExecutionStatus;
};

export type ExecutionHandle = {
  executionId: string;
  generation: number;
  widgetId: string;
  querySignature: string;
};

export type BeginExecutionParams = {
  runtimeScopeId: string;
  widgetId: string;
  querySignature: string;
  generation?: number;
  parentMutationId?: string;
  reason?: string;
};

export type CommitPayload = {
  generation: number;
};

export type CommitResult =
  | { ok: true; execution: ExecutionRecord }
  | {
      ok: false;
      reason: "stale" | "cancelled" | "not_found" | "invalid_status";
    };

export type ExecutionTimelineEntry = {
  at: number;
  event: string;
  executionId?: string;
  widgetId?: string;
  generation?: number;
  detail?: string;
};

export type DashboardExecutionCoordinator = {
  begin: (params: BeginExecutionParams) => ExecutionHandle | null;
  bumpGeneration: (widgetId: string, runtimeScopeId: string) => number;
  getWidgetGeneration: (widgetId: string, runtimeScopeId: string) => number;
  enterPendingCommit: (executionId: string) => boolean;
  commit: (executionId: string, payload: CommitPayload) => CommitResult;
  cancel: (executionId: string, reason?: string) => void;
  cancelWidget: (widgetId: string, runtimeScopeId: string) => void;
  cancelScope: (runtimeScopeId: string) => void;
  getActiveExecution: (
    widgetId: string,
    runtimeScopeId: string,
  ) => ExecutionRecord | undefined;
  getTimeline: () => ExecutionTimelineEntry[];
  dispose: () => void;
};

function widgetKey(widgetId: string, runtimeScopeId: string) {
  return `${runtimeScopeId}:${widgetId}`;
}

let executionCounter = 0;

export function createDashboardExecutionCoordinator(): DashboardExecutionCoordinator {
  const executions = new Map<string, ExecutionRecord>();
  const generations = new Map<string, number>();
  const activeByWidget = new Map<string, string>();
  const timeline: ExecutionTimelineEntry[] = [];
  const MAX_TIMELINE = 120;

  const log = (event: string, detail: Partial<ExecutionTimelineEntry>) => {
    timeline.push({ at: Date.now(), event, ...detail });
    if (timeline.length > MAX_TIMELINE) timeline.shift();
  };

  return {
    bumpGeneration(widgetId, runtimeScopeId) {
      const key = widgetKey(widgetId, runtimeScopeId);
      const next = (generations.get(key) ?? 0) + 1;
      generations.set(key, next);
      log("generation_bump", {
        widgetId,
        generation: next,
        detail: runtimeScopeId,
      });
      return next;
    },

    getWidgetGeneration(widgetId, runtimeScopeId) {
      return generations.get(widgetKey(widgetId, runtimeScopeId)) ?? 0;
    },

    begin(params) {
      const key = widgetKey(params.widgetId, params.runtimeScopeId);
      const generation = params.generation ?? generations.get(key) ?? 0;

      const previousId = activeByWidget.get(key);
      if (previousId) {
        const prev = executions.get(previousId);
        if (
          prev &&
          (prev.status === "running" || prev.status === "pending_commit")
        ) {
          prev.status = "cancelled";
          log("execution_cancelled", {
            executionId: previousId,
            widgetId: params.widgetId,
            detail: "superseded",
          });
        }
      }

      executionCounter += 1;
      const executionId = `exec_${executionCounter}_${Date.now().toString(36)}`;
      const record: ExecutionRecord = {
        executionId,
        runtimeScopeId: params.runtimeScopeId,
        widgetId: params.widgetId,
        querySignature: params.querySignature,
        generation,
        startedAt: Date.now(),
        parentMutationId: params.parentMutationId,
        reason: params.reason,
        status: "running",
      };
      executions.set(executionId, record);
      activeByWidget.set(key, executionId);
      log("execution_begin", {
        executionId,
        widgetId: params.widgetId,
        generation,
        detail: params.querySignature,
      });
      return {
        executionId,
        generation,
        widgetId: params.widgetId,
        querySignature: params.querySignature,
      };
    },

    enterPendingCommit(executionId) {
      const record = executions.get(executionId);
      if (!record || record.status !== "running") return false;
      const currentGen =
        generations.get(widgetKey(record.widgetId, record.runtimeScopeId)) ?? 0;
      if (record.generation < currentGen) {
        record.status = "stale";
        log("execution_stale", {
          executionId,
          widgetId: record.widgetId,
          generation: record.generation,
        });
        return false;
      }
      record.status = "pending_commit";
      log("pending_commit", { executionId, widgetId: record.widgetId });
      return true;
    },

    commit(executionId, payload) {
      const record = executions.get(executionId);
      if (!record) return { ok: false, reason: "not_found" };
      if (record.status === "cancelled")
        return { ok: false, reason: "cancelled" };
      const currentGen =
        generations.get(widgetKey(record.widgetId, record.runtimeScopeId)) ?? 0;
      if (record.generation < currentGen || payload.generation < currentGen) {
        record.status = "stale";
        log("commit_rejected_stale", {
          executionId,
          widgetId: record.widgetId,
          generation: record.generation,
        });
        return { ok: false, reason: "stale" };
      }
      if (record.status !== "pending_commit" && record.status !== "running") {
        return { ok: false, reason: "invalid_status" };
      }
      record.status = "committed";
      const key = widgetKey(record.widgetId, record.runtimeScopeId);
      if (activeByWidget.get(key) === executionId) activeByWidget.delete(key);
      log("execution_committed", {
        executionId,
        widgetId: record.widgetId,
        generation: record.generation,
      });
      return { ok: true, execution: record };
    },

    cancel(executionId, reason) {
      const record = executions.get(executionId);
      if (!record) return;
      record.status = "cancelled";
      const key = widgetKey(record.widgetId, record.runtimeScopeId);
      if (activeByWidget.get(key) === executionId) activeByWidget.delete(key);
      log("execution_cancelled", {
        executionId,
        widgetId: record.widgetId,
        detail: reason,
      });
    },

    cancelWidget(widgetId, runtimeScopeId) {
      const key = widgetKey(widgetId, runtimeScopeId);
      const activeId = activeByWidget.get(key);
      if (activeId) this.cancel(activeId, "widget_cancelled");
      this.bumpGeneration(widgetId, runtimeScopeId);
    },

    cancelScope(runtimeScopeId) {
      for (const [key, executionId] of activeByWidget.entries()) {
        if (!key.startsWith(`${runtimeScopeId}:`)) continue;
        this.cancel(executionId, "scope_disposed");
      }
    },

    getActiveExecution(widgetId, runtimeScopeId) {
      const activeId = activeByWidget.get(widgetKey(widgetId, runtimeScopeId));
      return activeId ? executions.get(activeId) : undefined;
    },

    getTimeline() {
      return [...timeline];
    },

    dispose() {
      for (const record of executions.values()) {
        record.status = "cancelled";
      }
      executions.clear();
      activeByWidget.clear();
      generations.clear();
      timeline.length = 0;
    },
  };
}
