import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import type { Session } from "neo4j-driver";

import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { saveMigrationRequestForAllShops } from "~/lib/shopify/shopMigrationRequest";
import { loadWebsiteSchemasFromDirectory } from "~/page_schema/loader";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { ExportStats } from "~/routes/api/schema/export/performSchemaExport";
import { performSchemaExport } from "~/routes/api/schema/export/performSchemaExport";

import {
  syncSchemaToSingleShop,
  type SchemaSyncShopResult,
} from "./syncSchemaToSingleShop";

export type { SchemaSyncShopResult } from "./syncSchemaToSingleShop";
export { updateShopifyShopSyncFields } from "./syncSchemaToSingleShop";

export interface PerformSchemaSyncInput {
  dbSession: Session;
  subDomain: string;
  user: Vertex;
}

export interface PerformSchemaSyncResult {
  success: boolean;
  message: string;
  exportPath: string;
  exportDetails: ExportStats;
  shops: SchemaSyncShopResult[];
}

export async function performSchemaSync(
  input: PerformSchemaSyncInput,
): Promise<PerformSchemaSyncResult> {
  const { dbSession, subDomain, user } = input;

  const tempRoot = await mkdtemp(join(tmpdir(), "schema-sync-"));

  try {
    const { stats: exportStats, exportPath } = await performSchemaExport({
      dbSession,
      subDomain,
      exportBasePath: tempRoot,
      filterOnly: false,
      includeComponentKeys: [],
      includePageKeys: [],
      includeFunctionKeys: [],
      excludePublicPages: true,
    });

    const shopsResult = await dbSession.run(`
      MATCH (s:ShopifyShop)
      WHERE s.shop IS NOT NULL AND toString(s.shop) <> ''
      RETURN DISTINCT s.shop AS shop
      ORDER BY shop
    `);

    const shops = shopsResult.records
      .map((r) => String(r.get("shop") ?? "").trim())
      .filter((s) => s.length > 0);

    const { schemas: websiteSchemas, categoryPaths } =
      loadWebsiteSchemasFromDirectory(tempRoot, subDomain);
    const shopResults: SchemaSyncShopResult[] = [];

    for (const shop of shops) {
      const result = await syncSchemaToSingleShop({
        mainDbSession: dbSession,
        appSubDomain: subDomain,
        shop,
        user,
        websiteSchemas,
        categoryPaths,
        runMigrationAfterImport: true,
        updateShopifyShopSyncFields: true,
      });
      shopResults.push(result);
      if (!result.success) {
        console.error(`[schema/sync] Failed for shop ${shop}:`, result.error);
      }
    }

    await saveMigrationRequestForAllShops();

    const tx = dbSession.beginTransaction();
    try {
      await createActivityLog(
        tx,
        "schema_sync",
        "Schema",
        subDomain,
        user.P.email,
        `Schema sync for subdomain ${subDomain}: exported app schema and imported into ${shops.length} Shopify shop database(s).`,
      );
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    } finally {
      await tx.close();
    }

    const failures = shopResults.filter((r) => !r.success);

    const message =
      shops.length === 0
        ? "Exported schema to temporary storage; no ShopifyShop rows found for this domain, so no shop databases were updated."
        : failures.length === 0
          ? `Synced schema to ${shopResults.length} shop database(s).`
          : `Synced with ${failures.length} failure(s) out of ${shops.length} shop(s).`;

    return {
      success: failures.length === 0,
      message,
      exportPath,
      exportDetails: exportStats,
      shops: shopResults,
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true }).catch((err) => {
      console.warn("[schema/sync] Failed to remove temp dir:", err);
    });
  }
}
