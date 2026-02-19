import type { APIEvent } from "@solidjs/start/server";

import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * Mandatory compliance webhook: customers/redact
 *
 * When a store owner requests deletion of customer data, Shopify sends this
 * webhook. If the app stores customer/order data, redact or delete it using
 * payload (customer, orders_to_redact). Acknowledge receipt with 200.
 */
export async function POST({ request }: APIEvent) {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // If your app stores customer or order data, use payload (customer,
  // orders_to_redact) to redact/delete it. Otherwise acknowledge.
  void payload;

  return new Response(null, { status: 200 });
}
