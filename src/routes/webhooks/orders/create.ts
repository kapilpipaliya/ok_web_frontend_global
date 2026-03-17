import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * Order Create Webhook
 *
 * Notified when an order is created in the shop.
 * Acknowledge with 200. Add server function call here if you need to sync orders.
 */
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const shopify = await getShopify(subDomain, dbSession);
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  } finally {
    await dbSession.close();
  }
}
