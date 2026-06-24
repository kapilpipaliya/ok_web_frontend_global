import type { APIEvent } from "@solidjs/start/server";

import { getDriver } from "~/cypher/core/driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";

/**
 * Deletes the ShopifyShop vertex from the subdomain database (the DB for the request's host, not per-shop).
 * Called when a shop is deleted (shop/redact webhook) so the admin shops list stays in sync.
 * Uses the request to resolve which DB holds the shops list (same host/subdomain as the app).
 */
export async function deleteShopVertexFromGlobalDb(
  shop: string,
  request?: APIEvent["request"],
): Promise<void> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    await dbSession.run("MATCH (s:ShopifyShop {shop: $shop}) DELETE s", {
      shop,
    });
    console.log(`Deleted ShopifyShop vertex for ${shop} from subdomain DB`);
  } catch (error) {
    console.error(`Failed to delete ShopifyShop vertex for ${shop}:`, error);
  } finally {
    await dbSession.close();
  }
}

/**
 * Deletes all Shopify sessions for the shop and drops the shop's Neo4j database.
 * appSubDomain is the request subdomain so the correct per-subdomain shop DB is dropped.
 */
export async function deleteShopDataAndDatabase(
  shop: string,
  appSubDomain: string,
): Promise<void> {
  const shopDatabaseName = getDatabaseNameForShop(shop, appSubDomain);
  const driver = await getDriver();
  const systemSession = driver.session();

  try {
    await systemSession.run(`DROP DATABASE ${shopDatabaseName} IF EXISTS`);
    console.log(`Dropped database ${shopDatabaseName} for ${shop}`);
  } catch (error) {
    console.error(
      `Failed to drop database ${shopDatabaseName} for ${shop}:`,
      error,
    );
  } finally {
    await systemSession.close();
  }
}
