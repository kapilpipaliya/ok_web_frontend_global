import { createMemo, createSignal, onCleanup } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import {
  getSchemaOperationsStatus,
  startSchemaOperations,
  type SchemaDatabaseScope,
  type SchemaJobStatusRow,
  type SchemaOperation,
} from "~/server/schema/schemaOperationsManagement";
import { playCompletionBeep } from "~/lib/audio/playCompletionBeep";
import {
  countFailures,
  isTerminal,
  operationLabel,
  succeededDatabaseNames,
} from "~/pages/global/schema/schemaOperationsUtils";

const POLL_MS = 1200;

type RunBatchOptions = {
  databaseNames?: string[];
  scope?: SchemaDatabaseScope;
  silent?: boolean;
  /** Allow starting while a batch is already running (Import & Sync chain). */
  chain?: boolean;
  onComplete?: (rows: SchemaJobStatusRow[]) => void;
};

type ImportSyncPipeline = {
  kind: "import_sync";
  step: "import" | "sync";
};

function resolveScope(options?: RunBatchOptions): {
  databaseNames?: string[];
  scope?: SchemaDatabaseScope;
} {
  if (options?.databaseNames && options.databaseNames.length > 0) {
    return { databaseNames: options.databaseNames };
  }
  return { scope: options?.scope };
}

export function useSchemaOperationsBatch() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [busy, setBusy] = createSignal(false);
  const [activeOperation, setActiveOperation] =
    createSignal<SchemaOperation | null>(null);
  const [pipeline, setPipeline] = createSignal<ImportSyncPipeline | null>(null);
  const [batchRows, setBatchRows] = createSignal<SchemaJobStatusRow[]>([]);
  /** Import rows kept after Import & Sync moves to sync (batchRows then holds sync only). */
  const [pipelineImportRows, setPipelineImportRows] = createSignal<
    SchemaJobStatusRow[]
  >([]);

  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let batchCompleteHandler: ((rows: SchemaJobStatusRow[]) => void) | null =
    null;
  let batchSilent = false;

  const stopPolling = () => {
    if (pollTimer !== undefined) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  };

  const resetBatchCallbacks = () => {
    batchCompleteHandler = null;
    batchSilent = false;
  };

  const releaseBusy = () => {
    setBusy(false);
    setActiveOperation(null);
    setPipeline(null);
    resetBatchCallbacks();
  };

  const finishBatch = (rows: SchemaJobStatusRow[]) => {
    const handler = batchCompleteHandler;
    const silent = batchSilent;
    batchCompleteHandler = null;
    batchSilent = false;

    if (handler) {
      handler(rows);
      return;
    }

    setBusy(false);
    playCompletionBeep();

    if (silent) {
      return;
    }

    const failed = countFailures(rows);
    const op = activeOperation();
    if (failed === 0) {
      showSuccessToast(
        op
          ? `${operationLabel(op)} completed for selected databases`
          : "Operations completed",
      );
    } else {
      showErrorToast(
        op
          ? `${operationLabel(op)} finished with ${failed} failure(s)`
          : `Finished with ${failed} failure(s)`,
      );
    }
  };

  const pollOnce = async () => {
    const rows = batchRows();
    if (rows.length === 0) {
      stopPolling();
      setBusy(false);
      return;
    }

    const res = await getSchemaOperationsStatus({
      rows: rows.map((r) => ({
        databaseName: r.databaseName,
        operation: r.operation,
        jobId: r.jobId,
      })),
    });

    if (!res.success) {
      showErrorToast(res.error || "Failed to refresh job status");
      stopPolling();
      releaseBusy();
      return;
    }

    setBatchRows(res.data);

    if (res.data.every((r) => isTerminal(r.status))) {
      stopPolling();
      finishBatch(res.data);
    }
  };

  const startPolling = () => {
    stopPolling();
    void pollOnce();
    pollTimer = setInterval(() => {
      void pollOnce();
    }, POLL_MS);
  };

  onCleanup(() => {
    stopPolling();
  });

  const runOperation = async (
    operation: SchemaOperation,
    options?: RunBatchOptions,
  ) => {
    if (busy() && !options?.chain) {
      return;
    }

    batchCompleteHandler = options?.onComplete ?? null;
    batchSilent = options?.silent ?? false;

    setBusy(true);
    setActiveOperation(operation);
    if (!options?.onComplete) {
      setPipeline(null);
    }
    if (!options?.chain) {
      setPipelineImportRows([]);
    }
    setBatchRows([]);

    try {
      const res = await startSchemaOperations({
        operation,
        ...resolveScope(options),
      });

      if (!res.success) {
        showErrorToast(res.error || "Failed to start operations");
        releaseBusy();
        return;
      }

      setBatchRows(res.data);

      if (res.data.every((r) => isTerminal(r.status))) {
        finishBatch(res.data);
        return;
      }

      startPolling();
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : String(e));
      releaseBusy();
    }
  };

  const runImportThenSync = (options?: {
    databaseNames?: string[];
    scope?: SchemaDatabaseScope;
  }) => {
    if (busy()) {
      return;
    }

    setPipeline({ kind: "import_sync", step: "import" });

    void runOperation("import", {
      ...options,
      silent: true,
      onComplete: (importRows) => {
        const succeeded = succeededDatabaseNames(importRows);
        const importFailed = importRows.length - succeeded.length;

        if (succeeded.length === 0) {
          releaseBusy();
          showErrorToast("Import failed; sync was not started.");
          playCompletionBeep();
          return;
        }

        if (importFailed > 0) {
          showErrorToast(
            `Import finished with ${importFailed} failure(s); starting sync for ${succeeded.length} database(s).`,
          );
        }

        setPipelineImportRows(importRows);
        setPipeline({ kind: "import_sync", step: "sync" });

        void runOperation("sync", {
          databaseNames: succeeded,
          silent: true,
          chain: true,
          onComplete: (syncRows) => {
            releaseBusy();
            const syncFailed = countFailures(syncRows);
            playCompletionBeep();
            if (syncFailed === 0 && importFailed === 0) {
              showSuccessToast("Import & Sync completed");
            } else if (syncFailed === 0) {
              showSuccessToast(
                `Sync completed (${importFailed} import failure(s) earlier)`,
              );
            } else {
              showErrorToast(
                `Sync finished with ${syncFailed} failure(s) after import`,
              );
            }
          },
        });
      },
    });
  };

  const pipelineStep = () => pipeline()?.step ?? null;

  const progressTitle = createMemo(() => {
    const p = pipeline();
    if (p?.kind === "import_sync") {
      return p.step === "import"
        ? "Import & Sync — import"
        : "Import & Sync — sync";
    }
    const op = activeOperation();
    return op ? `${operationLabel(op)} progress` : "Progress";
  });

  const batchSummary = createMemo(() => {
    const rows = batchRows();
    return {
      total: rows.length,
      complete: rows.filter((r) => isTerminal(r.status)).length,
      running: rows.filter((r) => r.status === "running").length,
      queued: rows.filter((r) => r.status === "queued").length,
      failed: countFailures(rows),
    };
  });

  const statusByDb = createMemo(() => {
    const map = new Map<string, SchemaJobStatusRow>();
    for (const row of pipelineImportRows()) {
      map.set(row.databaseName, row);
    }
    for (const row of batchRows()) {
      map.set(row.databaseName, row);
    }
    return map;
  });

  const jobOutputByDb = createMemo(() => {
    const map = new Map<
      string,
      { import?: SchemaJobStatusRow; sync?: SchemaJobStatusRow }
    >();
    for (const row of pipelineImportRows()) {
      const entry = map.get(row.databaseName) ?? {};
      entry.import = row;
      map.set(row.databaseName, entry);
    }
    for (const row of batchRows()) {
      const entry = map.get(row.databaseName) ?? {};
      if (row.operation === "import") {
        entry.import = row;
      } else if (row.operation === "sync") {
        entry.sync = row;
      }
      map.set(row.databaseName, entry);
    }
    return map;
  });

  const clearProgress = () => {
    if (busy()) {
      return;
    }
    setBatchRows([]);
    setPipelineImportRows([]);
    setActiveOperation(null);
    setPipeline(null);
  };

  return {
    busy,
    activeOperation,
    pipelineStep,
    batchRows,
    batchSummary,
    statusByDb,
    jobOutputByDb,
    progressTitle,
    runOperation,
    runImportThenSync,
    clearProgress,
  };
}
