import type { Session } from "neo4j-driver";

import { getDriver } from "~/cypher/core/driver";

export interface ShopifyCredentials {
  apiKey: string;
  apiSecretKey: string;
  shopifyAppUrl: string;
  shopifyScopes: string;
}

function parseCredentialsJson(raw: string): ShopifyCredentials {
  const empty = {
    apiKey: "",
    apiSecretKey: "",
    shopifyAppUrl: "",
    shopifyScopes: "",
  };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      apiKey: typeof parsed.shopifyAPIKey === "string" ? parsed.shopifyAPIKey : "",
      apiSecretKey: typeof parsed.shopifyAPISecret === "string" ? parsed.shopifyAPISecret : "",
      shopifyAppUrl: typeof parsed.shopifyAppUrl === "string" ? parsed.shopifyAppUrl : "",
      shopifyScopes: typeof parsed.shopifyScopes === "string" ? parsed.shopifyScopes : "",
    };
  } catch {
    return empty;
  }
}

/**
 * Load Shopify credentials from the CredentialsJson vertex using an existing session.
 * Does not close the session.
 */
export async function getShopifyCredentialsFromSession(
  dbSession: Session,
): Promise<ShopifyCredentials> {
  const empty: ShopifyCredentials = {
    apiKey: "",
    apiSecretKey: "",
    shopifyAppUrl: "",
    shopifyScopes: "",
  };
  try {
    const result = await dbSession.run(
      `MATCH (c:CredentialsJson) RETURN c.credentialsJson as credentialsJson LIMIT 1`,
    );
    const raw =
      (result.records[0]?.get("credentialsJson") as string | undefined) ?? "";
    return parseCredentialsJson(raw);
  } catch {
    return empty;
  }
}

/**
 * Load credentials for a subdomain by opening a short-lived session.
 * Use when no session is available (e.g. job/worker context).
 */
export async function getShopifyCredentialsForSubdomain(
  subDomain: string,
): Promise<ShopifyCredentials> {
  const driver = await getDriver();
  const session = driver.session({ database: subDomain });
  try {
    return await getShopifyCredentialsFromSession(session);
  } finally {
    await session.close();
  }
}
