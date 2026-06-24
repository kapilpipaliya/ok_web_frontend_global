import type { Node, Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDatabaseNameForShop } from "~/lib/shopify/getDatabaseNameForShop";
import { getDBSessionForShop } from "~/lib/shopify/shopifyHelpers";

export interface SyncCompanyLogosResult {
  success: boolean;
  message: string;
  mainDatabaseName: string;
  shopsAttempted: number;
  shopsSynced: number;
  shops?: { shop: string; database: string; ok: boolean; error?: string }[];
}

function propsForShopWrite(vertex: Vertex): Record<string, unknown> {
  const p = vertex.P as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

const COMPANY_LOGO_RELATIONS = [
  { rel: "CompanyRectangularLogo", field: "rectangular" },
  { rel: "CompanySquareLogo", field: "square" },
  { rel: "CompanyFavicon", field: "favicon" },
] as const;

type CompanyLogoFiles = {
  rectangular: Vertex | null;
  square: Vertex | null;
  favicon: Vertex | null;
};

async function fetchCompanyLogosFromMain(mainSession: Session): Promise<{
  globalSettingKey: string;
  logos: CompanyLogoFiles;
  hasGlobalSetting: boolean;
}> {
  const result = await mainSession.run(`
    MATCH (g:GlobalSetting)
    OPTIONAL MATCH (g)-[:CompanyRectangularLogo]->(rect:File)
    OPTIONAL MATCH (g)-[:CompanySquareLogo]->(sq:File)
    OPTIONAL MATCH (g)-[:CompanyFavicon]->(fav:File)
    RETURN g.key AS globalSettingKey, rect, sq, fav
    LIMIT 1
  `);

  if (result.records.length === 0) {
    return {
      globalSettingKey: "Default",
      logos: { rectangular: null, square: null, favicon: null },
      hasGlobalSetting: false,
    };
  }

  const record = result.records[0];
  const toFile = (node: Node | null | undefined): Vertex | null =>
    node ? (convertNodeToJson(node) as Vertex) : null;

  const key = record.get("globalSettingKey");
  return {
    globalSettingKey:
      typeof key === "string" && key.length > 0 ? key : "Default",
    logos: {
      rectangular: toFile(record.get("rect") as Node | null),
      square: toFile(record.get("sq") as Node | null),
      favicon: toFile(record.get("fav") as Node | null),
    },
    hasGlobalSetting: true,
  };
}

async function syncCompanyLogosOnShopSession(
  shopSession: Session,
  globalSettingKey: string,
  logos: CompanyLogoFiles,
): Promise<void> {
  const key = globalSettingKey.length > 0 ? globalSettingKey : "Default";

  await shopSession.run(
    `MERGE (g:GlobalSetting {key: $key})
     ON CREATE SET g.createdAt = datetime(), g.updatedAt = datetime()
     SET g.updatedAt = datetime()`,
    { key },
  );

  for (const { rel, field } of COMPANY_LOGO_RELATIONS) {
    const file = logos[field];
    if (!file) {
      // await shopSession.run(
      //   `MATCH (g:GlobalSetting {key: $key})-[r:${rel}]->()
      //    DELETE r`,
      //   { key },
      // );
      continue;
    }

    const props = propsForShopWrite(file);
    const fileName = props.fileName;
    if (typeof fileName !== "string" || fileName.length === 0) {
      continue;
    }

    const existingResult = await shopSession.run(
      `MATCH (g:GlobalSetting {key: $key})-[:${rel}]->(f:File)
       RETURN f.fileName AS shopFileName
       LIMIT 1`,
      { key },
    );
    const shopFileNameRaw = existingResult.records[0]?.get("shopFileName");
    const shopFileName =
      shopFileNameRaw == null ? "" : String(shopFileNameRaw).trim();
    const mainFileName = String(fileName).trim();

    // Shop has a different file (custom upload) — do not overwrite.
    if (shopFileName !== "" && shopFileName !== mainFileName) {
      continue;
    }

    await shopSession.run(
      `MATCH (g:GlobalSetting {key: $key})-[r:${rel}]->()
       DELETE r`,
      { key },
    );

    await shopSession.run(
      `MERGE (f:File {fileName: $fileName})
       SET f += $data
       WITH f
       MATCH (g:GlobalSetting {key: $key})
       MERGE (g)-[:${rel}]->(f)`,
      { key, fileName: mainFileName, data: props },
    );
  }
}

/**
 * Copies company logo File nodes and relationships into one Shopify shop database.
 */
export async function syncCompanyLogosToSingleShop(
  mainDatabaseName: string,
  shop: string,
): Promise<{ ok: boolean; error?: string }> {
  const driver = await getDriver();
  const mainSession = driver.session({ database: mainDatabaseName });

  try {
    const { globalSettingKey, logos, hasGlobalSetting } =
      await fetchCompanyLogosFromMain(mainSession);

    if (!hasGlobalSetting) {
      return { ok: true };
    }

    const { dbSession: shopSession } = await getDBSessionForShop(
      shop,
      mainDatabaseName,
    );

    try {
      await syncCompanyLogosOnShopSession(shopSession, globalSettingKey, logos);
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
 * Copies company logo File nodes and relationships into each Shopify shop database.
 */
export async function syncCompanyLogosToShopDatabases(
  mainDatabaseName: string,
): Promise<SyncCompanyLogosResult> {
  const driver = await getDriver();
  const mainSession = driver.session({ database: mainDatabaseName });

  try {
    const { hasGlobalSetting } = await fetchCompanyLogosFromMain(mainSession);

    if (!hasGlobalSetting) {
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

        const syncResult = await syncCompanyLogosToSingleShop(
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
          ? "No ShopifyShop rows; company logos unchanged on shop DBs."
          : `Synced company logos to ${shopsSynced}/${shops.length} shop database(s).`,
      mainDatabaseName,
      shopsAttempted: shops.length,
      shopsSynced,
      shops: shopOut,
    };
  } finally {
    await mainSession.close();
  }
}
