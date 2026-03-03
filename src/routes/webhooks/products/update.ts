import type { APIEvent } from "@solidjs/start/server";

import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * Product Update Webhook
 *
 * Notified when a product is updated in the shop. Calls shopifyProductAfterUpdate with fromWebhook,
 * which enqueues processShopifyProductAfterUpdate; the job syncs the product into Neo4j.
 */
export async function POST({ request }: APIEvent) {
  try {
    const shopify = await getShopify(request);
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });
    try {
      await executeNamedServerFunctionCore(
        {
          functionName: "shopifyProductAfterUpdate",
          contextData: { shop, payload, fromWebhook: true },
        },
        {
          dbSession,
          subDomain,
          functionLookupSubDomain: "decodeproduct",
          nodes: {},
          relationships: {},
        },
      );
    } finally {
      await dbSession.close();
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
