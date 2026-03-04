import type { APIEvent } from "@solidjs/start/server";
import { Session } from "@shopify/shopify-api";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";

/**
 * App Scopes Update Webhook Handler
 *
 * Handles the "app/scopes_update" webhook from Shopify. When a merchant updates
 * the app's permissions (scopes), Shopify sends a POST to this endpoint.
 * Authenticates the request, then updates the session's scope in Neo4j.
 */
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const shopify = await getShopify(subDomain, dbSession);
    const { payload, session, topic, shop } =
      await shopify.authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    const scopeString = Array.isArray(current)
      ? current.join(",")
      : typeof current === "string"
        ? current
        : String(current ?? "");

    if (session) {
      const sessionData = session.toObject();
      sessionData.scope = scopeString;
      const updatedSession = new Session(sessionData);
      await shopify.sessionStorage.storeSession(updatedSession);
    }

    return new Response(null, { status: 200 });
  } finally {
    await dbSession.close();
  }
}
