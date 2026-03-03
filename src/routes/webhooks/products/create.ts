import type { APIEvent } from "@solidjs/start/server";

import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * Product Create Webhook
 *
 * Notified when a product is created in the shop. Calls shopifyProductAfterCreate with fromWebhook,
 * which enqueues processShopifyProductAfterCreate; the job syncs the product into Neo4j.
 */
export async function POST({ request }: APIEvent) {
  try {
    const shopify = await getShopify(request);
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);
    console.log('payload', payload);

    const subDomain = getDatabaseNameForShop(shop);
    const driver = await getDriver();
    const dbSession = driver.session({ database: subDomain });
    try {
      await executeNamedServerFunctionCore(
        {
          functionName: "shopifyProductAfterCreate",
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
