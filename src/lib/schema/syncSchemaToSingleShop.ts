import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import type { Session } from "neo4j-driver";

import { createAppState } from "~/createAppState";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import {
  createSchemaImportActivityLog,
  importSchemas,
  type ImportStats,
} from "~/lib/schema/importSchemas";
import { runMigration } from "~/lib/schema/runMigration";
import { getDatabaseNameForShop } from "~/lib/shopify/getDatabaseNameForShop";
import {
  loadWebsiteSchemasFromDirectory,
  type WebsiteSchemas,
} from "~/page_schema/loader";
import type { Vertex } from "~/lib/graph/type/vertex";
import { filterWebsiteSchemasForShopSync } from "~/lib/schema/filterSchemasForShopSync";
import { performSchemaExport } from "~/routes/api/schema/export/performSchemaExport";
import { restartSubdomainWorkersForSubdomain } from "~/server/queue/initWorkersCore";

export interface SchemaSyncShopResult {
  shop: string;
  database: string;
  success: boolean;
  error?: string;
  importSummary?: {
    importedCount: number;
    totalVertices: number;
    totalEdges: number;
  };
  migration?: { success: boolean; functionName?: string; error?: string };
}

export async function updateShopifyShopSyncFields(
  mainDbSession: Session,
  shop: string,
  syncStatus: string,
  lastSyncedIso?: string | null,
): Promise<void> {
  if (lastSyncedIso) {
    await mainDbSession.run(
      `MATCH (s:ShopifyShop {shop: $shop})
       SET s.syncStatus = $syncStatus, s.lastSynced = $lastSynced`,
      { shop, syncStatus, lastSynced: lastSyncedIso },
    );
  } else {
    await mainDbSession.run(
      `MATCH (s:ShopifyShop {shop: $shop})
       SET s.syncStatus = $syncStatus`,
      { shop, syncStatus },
    );
  }
}

export interface SyncSchemaToSingleShopInput {
  mainDbSession: Session;
  appSubDomain: string;
  shop: string;
  user: Vertex;
  /** Pre-loaded schemas (bulk sync); when omitted, exports from the app subdomain DB. */
  websiteSchemas?: WebsiteSchemas;
  /** Run shop migration after import (schema/sync worker path). */
  runMigrationAfterImport?: boolean;
  /** Update ShopifyShop.syncStatus on the app subdomain graph. */
  updateShopifyShopSyncFields?: boolean;
}

/**
 * Export app subdomain schema and import pages, components, functions, etc. into one shop DB.
 * Same per-shop logic as {@link performSchemaSync} / POST /api/schema/sync.
 */
export async function syncSchemaToSingleShop(
  input: SyncSchemaToSingleShopInput,
): Promise<SchemaSyncShopResult> {
  const {
    mainDbSession,
    appSubDomain,
    shop,
    user,
    runMigrationAfterImport = false,
    updateShopifyShopSyncFields: updateSyncFields = false,
  } = input;

  const shopDatabaseName = getDatabaseNameForShop(shop, appSubDomain);
  let tempRoot: string | null = null;
  let websiteSchemas = input.websiteSchemas;

  try {
    if (!websiteSchemas) {
      tempRoot = await mkdtemp(join(tmpdir(), "schema-sync-shop-"));
      await performSchemaExport({
        dbSession: mainDbSession,
        subDomain: appSubDomain,
        exportBasePath: tempRoot,
        filterOnly: false,
        includeComponentKeys: [],
        includePageKeys: [],
        includeFunctionKeys: [],
        excludePublicPages: true,
      });
      websiteSchemas = loadWebsiteSchemasFromDirectory(tempRoot, appSubDomain);
    }

    websiteSchemas = filterWebsiteSchemasForShopSync(websiteSchemas);

    if (updateSyncFields) {
      await updateShopifyShopSyncFields(mainDbSession, shop, "running");
    }

    try {
      await createDatabase(shopDatabaseName);
    } catch (err: unknown) {
      console.warn(
        `[schema/sync] createDatabase(${shopDatabaseName}) (may already exist):`,
        err instanceof Error ? err.message : err,
      );
    }

    const driver = await getDriver();
    const shopDbSession = driver.session({ database: shopDatabaseName });

    try {
      let stats: ImportStats;

      const tx = shopDbSession.beginTransaction();
      try {
        const [graph, setGraph] = createAppState();
        stats = await importSchemas(websiteSchemas, tx, graph, setGraph);

        await createSchemaImportActivityLog(
          tx,
          shopDatabaseName,
          user.P.email,
          stats,
        );

        await tx.commit();
      } catch (err: unknown) {
        await tx.rollback();
        throw err;
      } finally {
        await tx.close();
      }

      let migration:
        | SchemaSyncShopResult["migration"]
        | undefined;

      if (runMigrationAfterImport) {
        const migrationResult = await runMigration(
          shopDbSession,
          shopDatabaseName,
          user,
          {
            dryRun: false,
            contextData: { shop },
            appSubDomain,
          },
        );
        migration = migrationResult.functionName
          ? {
              success: migrationResult.success,
              functionName: migrationResult.functionName,
              error: migrationResult.error,
            }
          : undefined;
      }

      if (updateSyncFields) {
        const nowIso = new Date().toISOString();
        await updateShopifyShopSyncFields(
          mainDbSession,
          shop,
          "success",
          nowIso,
        );
      }

      try {
        await restartSubdomainWorkersForSubdomain(shopDatabaseName);
      } catch (workerError) {
        console.error(
          `[schema/sync] Worker restart failed for ${shopDatabaseName}:`,
          workerError,
        );
      }

      return {
        shop,
        database: shopDatabaseName,
        success: true,
        importSummary: {
          importedCount: stats.importedItems.length,
          totalVertices: stats.totalVertices,
          totalEdges: stats.totalEdges,
        },
        migration,
      };
    } finally {
      await shopDbSession.close();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (updateSyncFields) {
      const nowIso = new Date().toISOString();
      await updateShopifyShopSyncFields(
        mainDbSession,
        shop,
        "failed",
        nowIso,
      ).catch(() => undefined);
    }
    return {
      shop,
      database: shopDatabaseName,
      success: false,
      error: message,
    };
  } finally {
    if (tempRoot) {
      await rm(tempRoot, { recursive: true, force: true }).catch((err) => {
        console.warn("[schema/sync] Failed to remove temp dir:", err);
      });
    }
  }
}
