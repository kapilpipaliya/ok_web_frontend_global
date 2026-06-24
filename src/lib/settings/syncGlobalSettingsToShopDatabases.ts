import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDatabaseNameForShop } from "~/lib/shopify/getDatabaseNameForShop";
import { getDBSessionForShop } from "~/lib/shopify/shopifyHelpers";

export interface SyncGlobalSettingsResult {
  success: boolean;
  message: string;
  mainDatabaseName: string;
  shopsAttempted: number;
  shopsSynced: number;
  shops?: { shop: string; database: string; ok: boolean; error?: string }[];
}

function propsForShopWrite(globalSetting: Vertex): Record<string, unknown> {
  const p = globalSetting.P as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

async function upsertGlobalSettingOnShopSession(
  shopSession: Session,
  props: Record<string, unknown>,
): Promise<void> {
  const key =
    typeof props.key === "string" && props.key.length > 0
      ? props.key
      : "Default";

  const updateResult = await shopSession.run(
    `MATCH (s:GlobalSetting {key: $key})
     SET s += $data,
         s.updatedAt = datetime()
     RETURN s`,
    { key, data: props },
  );

  if (updateResult.records.length > 0) {
    return;
  }

  await shopSession.run(
    `CREATE (s:GlobalSetting {
       key: $key,
       createdAt: datetime(),
       updatedAt: datetime()
     })
     SET s += $data`,
    { key, data: props },
  );
}

/**
 * Copies the main subdomain `GlobalSetting` properties into one Shopify shop database.
 */
export async function syncGlobalSettingsToSingleShop(
  mainDatabaseName: string,
  shop: string,
): Promise<{ ok: boolean; error?: string }> {
  const driver = await getDriver();
  const mainSession = driver.session({ database: mainDatabaseName });

  try {
    const settingResult = await mainSession.run(
      "MATCH (s:GlobalSetting) RETURN s LIMIT 1",
    );

    if (settingResult.records.length === 0) {
      return { ok: true };
    }

    const globalSetting = convertNodeToJson(
      settingResult.records[0].get("s"),
    ) as Vertex;
    const props = propsForShopWrite(globalSetting);

    const { dbSession: shopSession } = await getDBSessionForShop(
      shop,
      mainDatabaseName,
    );

    try {
      await upsertGlobalSettingOnShopSession(shopSession, props);
      return { ok: true };
    } finally {
      await shopSession.close();
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    await mainSession.close();
  }
}

/**
 * Copies the main subdomain `GlobalSetting` properties into each Shopify shop database.
 */
export async function syncGlobalSettingsToShopDatabases(
  mainDatabaseName: string,
): Promise<SyncGlobalSettingsResult> {
  const driver = await getDriver();
  const mainSession = driver.session({ database: mainDatabaseName });

  try {
    const settingResult = await mainSession.run(
      "MATCH (s:GlobalSetting) RETURN s LIMIT 1",
    );

    if (settingResult.records.length === 0) {
      return {
        success: true,
        message: "No GlobalSetting on main database; nothing to sync.",
        mainDatabaseName,
        shopsAttempted: 0,
        shopsSynced: 0,
      };
    }

    const shopsResult = await mainSession.run(`
      MATCH (s:ShopifyShop)
      WHERE s.shop IS NOT NULL AND toString(s.shop) <> ''
      RETURN DISTINCT s.shop AS shop
      ORDER BY shop
    `);

    const shops = shopsResult.records
      .map((r) => String(r.get("shop") ?? "").trim())
      .filter((s) => s.length > 0);

    const shopOut: {
      shop: string;
      database: string;
      ok: boolean;
      error?: string;
    }[] = [];

    for (const shop of shops) {
      const shopDbName = getDatabaseNameForShop(shop, mainDatabaseName);
      try {
        try {
          await createDatabase(shopDbName);
        } catch {
          /* database may already exist */
        }

        const syncResult = await syncGlobalSettingsToSingleShop(
          mainDatabaseName,
          shop,
        );
        if (syncResult.ok) {
          shopOut.push({ shop, database: shopDbName, ok: true });
        } else {
          shopOut.push({
            shop,
            database: shopDbName,
            ok: false,
            error: syncResult.error,
          });
        }
      } catch (e) {
        shopOut.push({
          shop,
          database: shopDbName,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const shopsSynced = shopOut.filter((x) => x.ok).length;

    return {
      success: shopOut.every((x) => x.ok),
      message:
        shops.length === 0
          ? "No ShopifyShop rows; global settings unchanged on shop DBs."
          : `Synced global settings to ${shopsSynced}/${shops.length} shop database(s).`,
      mainDatabaseName,
      shopsAttempted: shops.length,
      shopsSynced,
      shops: shopOut,
    };
  } finally {
    await mainSession.close();
  }
}
