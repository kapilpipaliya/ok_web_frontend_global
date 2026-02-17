import type { APIEvent } from "@solidjs/start/server";

import { getNeo4jSessionStore } from "~/lib/shopify/neo4jSessionStore";
import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * App Uninstalled Webhook Handler
 *
 * Handles the "app/uninstalled" webhook from Shopify. When a merchant
 * uninstalls the app, Shopify sends a POST to this endpoint. Authenticates
 * the request, then deletes all sessions for the shop from Neo4j.
 */
export async function POST({ request }: APIEvent) {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    const sessionStore = getNeo4jSessionStore();
    await sessionStore.deleteSessionsByShop(shop);
  }

  return new Response(null, { status: 200 });
}
