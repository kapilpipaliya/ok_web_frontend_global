import { createAsync } from "@solidjs/router";
import { createMemo, createSignal, onCleanup, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getSchemaOperationsStatus,
  listSchemaOperationDatabases,
  startSchemaOperations,
  type SchemaDatabaseScope,
  type SchemaJobStatusRow,
  type SchemaOperation,
} from "~/server/schema/schemaOperationsManagement";
import {
  getAppSubdomainSignInUrl,
  getShopDatabaseSignInUrl,
  SchemaDatabaseTableSection,
} from "~/pages/global/schema/SchemaDatabaseTableSection";

const TERMINAL_STATUSES = new Set([
  "success",
  "failed",
  "enqueue_failed",
]);

const APP_OPERATIONS = ["import", "export", "sync"] as const;
const SHOP_OPERATIONS = ["import", "export"] as const;

function isTerminal(status: string) {
  return TERMINAL_STATUSES.has(status);
}

function operationLabel(op: SchemaOperation) {
  switch (op) {
    case "export":
      return "Export";
    case "import":
      return "Import";
    case "sync":
      return "Sync";
  }
}

export function SchemaOperationsManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [busy, setBusy] = createSignal(false);
  const [activeOperation, setActiveOperation] =
    createSignal<SchemaOperation | null>(null);
  const [batchRows, setBatchRows] = createSignal<SchemaJobStatusRow[]>([]);

  let pollTimer: ReturnType<typeof setInterval> | undefined;

  const stopPolling = () => {
    if (pollTimer !== undefined) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  };

  const databaseGroups = createAsync(
    async () => {
      refreshKey();
      return await listSchemaOperationDatabases();
    },
    { deferStream: true },
  );

  const statusByDb = createMemo(() => {
    const map = new Map<string, SchemaJobStatusRow>();
    for (const row of batchRows()) {
      map.set(row.databaseName, row);
    }
    return map;
  });

  const batchSummary = createMemo(() => {
    const rows = batchRows();
    return {
      total: rows.length,
      complete: rows.filter((r) => isTerminal(r.status)).length,
      running: rows.filter((r) => r.status === "running").length,
      queued: rows.filter((r) => r.status === "queued").length,
      failed: rows.filter(
        (r) => r.status === "failed" || r.status === "enqueue_failed",
      ).length,
    };
  });

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
      setBusy(false);
      return;
    }

    setBatchRows(res.data);

    if (res.data.every((r) => isTerminal(r.status))) {
      stopPolling();
      setBusy(false);
      const failed = res.data.filter(
        (r) => r.status === "failed" || r.status === "enqueue_failed",
      ).length;
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
    }
  };

  const startPolling = () => {
    stopPolling();
    void pollOnce();
    pollTimer = setInterval(() => {
      void pollOnce();
    }, 1200);
  };

  onCleanup(() => {
    stopPolling();
  });

  const runOperation = async (
    operation: SchemaOperation,
    options?: { databaseNames?: string[]; scope?: SchemaDatabaseScope },
  ) => {
    if (busy()) return;

    setBusy(true);
    setActiveOperation(operation);
    setBatchRows([]);

    try {
      const res = await startSchemaOperations({
        operation,
        databaseNames: options?.databaseNames,
        scope:
          options?.databaseNames && options.databaseNames.length > 0
            ? undefined
            : options?.scope,
      });

      if (!res.success) {
        showErrorToast(res.error || "Failed to start operations");
        setBusy(false);
        setActiveOperation(null);
        return;
      }

      setBatchRows(res.data);

      if (res.data.every((r) => isTerminal(r.status))) {
        setBusy(false);
        const failed = res.data.filter(
          (r) => r.status === "failed" || r.status === "enqueue_failed",
        ).length;
        if (failed === 0) {
          showSuccessToast(`${operationLabel(operation)} completed`);
        } else {
          showErrorToast(
            `${operationLabel(operation)} finished with ${failed} failure(s)`,
          );
        }
        return;
      }

      startPolling();
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : String(e));
      setBusy(false);
      setActiveOperation(null);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    showSuccessToast("Refreshed");
  };

  const clearProgress = () => {
    if (busy()) return;
    setBatchRows([]);
    setActiveOperation(null);
  };

  return (
    <As
      as="motionFragment"
      css={`return \`._id {
  padding: 2rem;
}\`;`}
    >
      <As
        as="motionFragment"
        css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}\`;`}
      >
        <As
          as="h1"
          css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
        >
          Schema Operations
        </As>
        <As
          as="motionFragment"
          css={`return \`._id {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}\`;`}
        >
          <As
            as="button"
            type="button"
            disabled={busy()}
            onClick={handleRefresh}
            css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.background_dark_300};
  color: \${args.theme.var.color.background_dark_300_text};
}
._id:disabled { opacity: 0.55; cursor: not-allowed; }\`;`}
          >
            Refresh
          </As>
          <Show when={batchRows().length > 0 && !busy()}>
            <As
              as="button"
              type="button"
              onClick={clearProgress}
              css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}\`;`}
            >
              Clear progress
            </As>
          </Show>
        </As>
      </As>

      <As
        as="p"
        css={`return \`._id {
  margin: 0 0 1.5rem 0;
  color: \${args.theme.var.color.muted};
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 52rem;
}\`;`}
      >
        Export writes schema from a database to files; import loads files into a
        database. Sync runs on app/subdomain databases only and pushes schema to
        linked Shopify shop databases.
      </As>

      <Show when={batchRows().length > 0}>
        <As
          as="motionFragment"
          css={`return \`._id {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background_light_100};
}\`;`}
        >
          <As
            as="h2"
            css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}\`;`}
          >
            {activeOperation()
              ? `${operationLabel(activeOperation()!)} progress`
              : "Progress"}
            {busy() ? " (updating…)" : ""}
          </As>
          <As
            as="motionFragment"
            css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}\`;`}
          >
            <As as="span">
              Complete: {batchSummary().complete} / {batchSummary().total}
            </As>
            <As as="span">Running: {batchSummary().running}</As>
            <As as="span">Queued: {batchSummary().queued}</As>
            <Show when={batchSummary().failed > 0}>
              <As
                as="span"
                css={`return \`._id { color: \${args.theme.var.color.error}; font-weight: 600; }\`;`}
              >
                Failed: {batchSummary().failed}
              </As>
            </Show>
          </As>
          <As
            as="div"
            css={`return \`._id {
  height: 0.5rem;
  border-radius: 9999px;
  background: \${args.theme.var.color.background_light_300};
  overflow: hidden;
}\`;`}
          >
            <As
              as="motionFragment"
              css={() => {
                const pct =
                  batchSummary().total > 0
                    ? Math.round(
                        (batchSummary().complete / batchSummary().total) * 100,
                      )
                    : 0;
                return `return \`._id {
  height: 100%;
  width: ${pct}%;
  background: \${args.theme.var.color.primary};
  transition: width 0.3s ease;
}\`;`;
              }}
            />
          </As>
        </As>
      </Show>

      <Show when={databaseGroups()?.success}>
        {() => {
          const data = databaseGroups()!.data!;
          return (
            <As as="motionFragment">
              <SchemaDatabaseTableSection
                title="App / subdomain databases"
                description="Main application Neo4j databases (e.g. attendra, admin). Sync exports from here and updates all ShopifyShop-linked shop DBs."
                databases={data.appDatabases}
                operations={APP_OPERATIONS}
                busy={busy()}
                activeOperation={activeOperation()}
                statusByDb={statusByDb}
                onRunAll={(op) => void runOperation(op, { scope: "app" })}
                onRunOne={(op, name) =>
                  void runOperation(op, { databaseNames: [name] })
                }
                getSignInUrl={getAppSubdomainSignInUrl}
              />
              <SchemaDatabaseTableSection
                title="Shopify shop databases"
                description="Per-merchant shop databases (names start with shop). Use export/import here; schema sync to shops is triggered from the app database above. Sign in opens the shop host (database name as subdomain)."
                databases={data.shopDatabases}
                operations={SHOP_OPERATIONS}
                busy={busy()}
                activeOperation={activeOperation()}
                statusByDb={statusByDb}
                onRunAll={(op) => void runOperation(op, { scope: "shop" })}
                onRunOne={(op, name) =>
                  void runOperation(op, { databaseNames: [name] })
                }
                getSignInUrl={getShopDatabaseSignInUrl}
              />
            </As>
          );
        }}
      </Show>

      <Show when={databaseGroups()?.success === false}>
        <As
          as="p"
          css={`return \`._id {
  color: \${args.theme.var.color.error};
  margin-top: 1rem;
}\`;`}
        >
          {databaseGroups()?.error || "Failed to load databases"}
        </As>
      </Show>
    </As>
  );
}
