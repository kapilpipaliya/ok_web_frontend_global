import type { APIEvent } from "@solidjs/start/server";

import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * Product Delete Webhook
 *
 * Notified when a product is deleted in the shop.
 * Payload contains the product id (admin_graphql_api_id).
 */
export async function POST({ request }: APIEvent) {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    // payload contains the deleted product id; add cleanup/notification logic here
    void payload;
    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
