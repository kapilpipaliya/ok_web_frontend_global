import type { APIEvent } from "@solidjs/start/server";

import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * Mandatory compliance webhook: customers/data_request
 *
 * When a customer requests their data from the store owner, Shopify sends
 * this webhook. If the app stores customer/order data, provide it to the
 * store owner. Acknowledge receipt with 200.
 */
export async function POST({ request }: APIEvent) {
  const shopify = await getShopify(request);
  const { topic, shop, payload } = await shopify.authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // If your app stores customer or order data, use payload (customer, orders_requested,
  // data_request) to gather and provide data to the store owner. Otherwise acknowledge.
  void payload;

  return new Response(null, { status: 200 });
}
