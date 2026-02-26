import type { APIEvent } from "@solidjs/start/server";

import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * Product Create Webhook
 *
 * Notified when a product is created in the shop.
 * Payload contains the product data (admin_graphql_api_id, title, etc.).
 */
export async function POST({ request }: APIEvent) {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    // payload contains the created product; add sync/notification logic here
    void payload;
    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
