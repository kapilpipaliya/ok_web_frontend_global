import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * App Uninstalled Webhook Handler
 *
 * Handles the "app/uninstalled" webhook from Shopify. When a merchant
 * uninstalls the app, Shopify sends a POST to this endpoint. Authenticates
 * the request, then deletes all sessions for the shop and drops the shop's
 * Neo4j database.
 */
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const shopify = await getShopify(subDomain, dbSession);
    const { shop, topic } = await shopify.authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    const deletedCount = await shopify.sessionStorage.deleteSessionsByShop(shop);
    console.log(`Deleted ${deletedCount} sessions for ${shop}`);

    return new Response(null, { status: 200 });
  } finally {
    await dbSession.close();
  }
}
