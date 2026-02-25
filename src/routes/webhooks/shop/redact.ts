import type { APIEvent } from "@solidjs/start/server";

import {
  deleteShopDataAndDatabase,
  deleteShopVertexFromGlobalDb,
} from "~/lib/shopify/deleteShopDataAndDatabase";
import { authenticate } from "~/lib/shopify/shopify.server";

/**
 * Mandatory compliance webhook: shop/redact
 *
 * 48 hours after a store uninstalls the app, Shopify sends this webhook with
 * shop_id and shop_domain so the app can erase any remaining store data.
 */
export async function POST({ request }: APIEvent) {
  try {
    const { topic, payload } = await authenticate.webhook(request);

    const shopDomain =
      (payload as { shop_domain?: string }).shop_domain ?? "";
    console.log(`Received ${topic} webhook for ${shopDomain}`);

    if (shopDomain) {
      await deleteShopDataAndDatabase(shopDomain);
      await deleteShopVertexFromGlobalDb(shopDomain, request);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
