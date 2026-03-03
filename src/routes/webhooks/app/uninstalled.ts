import type { APIEvent } from "@solidjs/start/server";

import { deleteShopDataAndDatabase } from "~/lib/shopify/deleteShopDataAndDatabase";
import { getShopify } from "~/lib/shopify/shopify.server";
import { getNeo4jSessionStore } from "~/lib/shopify/neo4jSessionStore";

/**
 * App Uninstalled Webhook Handler
 *
 * Handles the "app/uninstalled" webhook from Shopify. When a merchant
 * uninstalls the app, Shopify sends a POST to this endpoint. Authenticates
 * the request, then deletes all sessions for the shop and drops the shop's
 * Neo4j database.
 */
export async function POST({ request }: APIEvent) {
  const shopify = await getShopify(request);
  const { shop, topic } = await shopify.authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const sessionStore = getNeo4jSessionStore();
  const deletedCount = await sessionStore.deleteSessionsByShop(shop);
  console.log(`Deleted ${deletedCount} sessions for ${shop}`);

  return new Response(null, { status: 200 });
}
