import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";

const JSON_HEADERS = { "Content-Type": "application/json" };

/**
 * Catch-all route for Shopify auth (authorization code grant).
 * Handles /api/shopify/auth/*. Returns JSON only.
 * On success: { ok: true, shop }. On redirect (OAuth): returns that Response. On error: { ok: false, error }.
 */
export async function handleAuthRequest(request: Request): Promise<Response> {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    const shopify = await getShopify(subDomain, dbSession);
    const result = await shopify.authenticate.admin(request);
    const shop = result.session?.shop ?? null;
    return new Response(JSON.stringify({ ok: true, shop }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  } finally {
    await dbSession.close();
  }
}
