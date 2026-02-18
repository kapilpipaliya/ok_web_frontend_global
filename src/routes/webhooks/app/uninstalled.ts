import type { APIEvent } from "@solidjs/start/server";

import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";
import { getNeo4jSessionStore } from "~/lib/shopify/neo4jSessionStore";
import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * Deletes all Shopify sessions for the shop and drops the shop's Neo4j database.
 * Used when the app is uninstalled (webhook) or for manual cleanup.
 */
async function deleteShopDataAndDatabase(shop: string): Promise<void> {
  const sessionStore = getNeo4jSessionStore();
  const deletedCount = await sessionStore.deleteSessionsByShop(shop);
  console.log(`Deleted ${deletedCount} sessions for ${shop}`);

  const dbName = getDatabaseNameForShop(shop);
  const driver = await getDriver();
  const systemSession = driver.session();

  try {
    await systemSession.run(`DROP DATABASE ${dbName} IF EXISTS`);
    console.log(`Dropped database ${dbName} for ${shop}`);
  } catch (error) {
    console.error(`Failed to drop database ${dbName} for ${shop}:`, error);
  } finally {
    await systemSession.close();
  }
}

/**
 * App Uninstalled Webhook Handler
 *
 * Handles the "app/uninstalled" webhook from Shopify. When a merchant
 * uninstalls the app, Shopify sends a POST to this endpoint. Authenticates
 * the request, then deletes all sessions for the shop and drops the shop's
 * Neo4j database.
 */
export async function POST({ request }: APIEvent) {
  debugger;
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  await deleteShopDataAndDatabase(shop);

  return new Response(null, { status: 200 });
}
