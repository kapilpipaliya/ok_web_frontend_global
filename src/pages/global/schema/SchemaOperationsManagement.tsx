import { createAsync } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import { listSchemaOperationDatabases } from "~/server/schema/schemaOperationsManagement";
import { SchemaDatabaseTableSection } from "~/pages/global/schema/SchemaDatabaseTableSection";
import { SchemaProgressPanel } from "~/pages/global/schema/SchemaProgressPanel";
import {
  APP_OPERATIONS,
  getAppSubdomainAdminPageUrl,
  getAppSubdomainSignInUrl,
  getShopDatabaseSignInUrl,
  SCHEMA_APP_DATABASE_ADMIN_LINKS,
  schemaOpButtonCss,
  SHOP_OPERATIONS,
} from "~/pages/global/schema/schemaOperationsUtils";
import { useSchemaOperationsBatch } from "~/pages/global/schema/useSchemaOperationsBatch";

export function SchemaOperationsManagement() {
  const { showSuccessToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);

  const batch = useSchemaOperationsBatch();

  const databaseGroups = createAsync(
    async () => {
      refreshKey();
      return await listSchemaOperationDatabases();
    },
    { deferStream: true },
  );

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    showSuccessToast("Refreshed");
  };

  const sectionProps = () => ({
    busy: batch.busy(),
    activeOperation: batch.activeOperation(),
    pipelineStep: batch.pipelineStep,
    statusByDb: batch.statusByDb,
    jobOutputByDb: batch.jobOutputByDb,
  });

  return (
    <As
      as="motionFragment"
      css={`return \`._id { padding: 2rem; max-width: 90rem; }\`;`}
    >
      <As
        as="header"
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
          as="div"
          css={`return \`._id { display: flex; gap: 0.75rem; flex-wrap: wrap; }\`;`}
        >
          <As
            as="button"
            type="button"
            disabled={batch.busy()}
            onClick={handleRefresh}
            css={schemaOpButtonCss("secondary")}
          >
            Refresh
          </As>
          <Show when={batch.batchRows().length > 0 && !batch.busy()}>
            <As
              as="button"
              type="button"
              onClick={batch.clearProgress}
              css={schemaOpButtonCss("ghost", "md")}
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
        database. Sync runs on app databases and pushes schema to linked Shopify
        shop databases. Use Import & Sync to run both in sequence.
      </As>

      <Show when={batch.batchRows().length > 0}>
        <SchemaProgressPanel
          title={batch.progressTitle()}
          updating={batch.busy()}
          complete={batch.batchSummary().complete}
          total={batch.batchSummary().total}
          running={batch.batchSummary().running}
          queued={batch.batchSummary().queued}
          failed={batch.batchSummary().failed}
        />
      </Show>

      <Show when={databaseGroups()?.success}>
        {() => {
          const data = databaseGroups()!.data!;
          const shared = sectionProps();
          return (
            <>
              <SchemaDatabaseTableSection
                title="App / subdomain databases"
                description="Main application Neo4j databases. Sync pushes schema to all ShopifyShop-linked shop DBs."
                databases={data.appDatabases}
                operations={APP_OPERATIONS}
                {...shared}
                onRunAll={(op) => void batch.runOperation(op, { scope: "app" })}
                onRunOne={(op, name) =>
                  void batch.runOperation(op, { databaseNames: [name] })
                }
                onRunAllImportThenSync={() =>
                  void batch.runImportThenSync({ scope: "app" })
                }
                onRunOneImportThenSync={(name) =>
                  void batch.runImportThenSync({ databaseNames: [name] })
                }
                getSignInUrl={getAppSubdomainSignInUrl}
                adminPageLinks={SCHEMA_APP_DATABASE_ADMIN_LINKS}
                getAdminPageUrl={getAppSubdomainAdminPageUrl}
              />
              <SchemaDatabaseTableSection
                title="Shopify shop databases"
                description="Per-merchant shop DBs (name starts with shop). Sign in uses the DB name as host."
                databases={data.shopDatabases}
                operations={SHOP_OPERATIONS}
                {...shared}
                onRunAll={(op) => void batch.runOperation(op, { scope: "shop" })}
                onRunOne={(op, name) =>
                  void batch.runOperation(op, { databaseNames: [name] })
                }
                getSignInUrl={getShopDatabaseSignInUrl}
              />
            </>
          );
        }}
      </Show>

      <Show when={databaseGroups()?.success === false}>
        <As
          as="p"
          css={`return \`._id { color: \${args.theme.var.color.error}; margin-top: 1rem; }\`;`}
        >
          {databaseGroups()?.error || "Failed to load databases"}
        </As>
      </Show>
    </As>
  );
}
