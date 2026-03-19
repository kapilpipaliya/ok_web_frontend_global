import type { APIEvent } from "@solidjs/start/server";

import { executeNamedServerFunctionCore } from "~/cypher/get/executeNamedServerFunctionCore";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getDriver } from "~/cypher/core/driver";
import { getDatabaseNameForShop } from "~/lib/shopify/shopifyHelpers";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * File Delete Webhook
 *
 * Notified when a file is deleted in the shop. Calls shopifyFileAfterDelete with fromWebhook,
 * which enqueues processShopifyFileAfterDelete; the job removes the file from Neo4j.
 */
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const shopify = await getShopify(subDomain, dbSession);
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const shopDatabaseName = getDatabaseNameForShop(shop, subDomain);
    const driver = await getDriver();
    const shopDbSession = driver.session({ database: shopDatabaseName });
    try {
      await executeNamedServerFunctionCore(
        {
          functionName: "shopifyFileAfterDelete",
          contextData: { shop, payload, fromWebhook: true },
        },
        {
          dbSession: shopDbSession,
          subDomain: shopDatabaseName,
          rawSubDomain: subDomain,
          rawDbSession: dbSession,
          functionLookupSubDomain: "decodefile",
          nodes: {},
          relationships: {},
        },
      );
    } finally {
      await shopDbSession.close();
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  } finally {
    await dbSession.close();
  }
}
