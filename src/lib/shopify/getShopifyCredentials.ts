import type { APIEvent } from "@solidjs/start/server";

import { getDriver } from "~/cypher/core/driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

export interface ShopifyCredentials {
  apiKey: string;
  apiSecretKey: string;
  shopifyAppUrl: string;
  shopifyScopes: string;
}

/**
 * Load Shopify credentials from the CredentialsJson vertex for the given subdomain.
 * Returns shopifyAPIKey, shopifyAPISecret, and shopifyAppUrl from the vertex JSON (no env fallback).
 */
export async function getShopifyCredentialsForSubdomain(
  subDomain: string,
): Promise<ShopifyCredentials> {
  const driver = await getDriver();
  const dbSession = driver.session({ database: subDomain });

  try {
    const result = await dbSession.run(
      `MATCH (c:CredentialsJson) RETURN c.credentialsJson as credentialsJson LIMIT 1`,
    );
    const raw =
      (result.records[0]?.get("credentialsJson") as string | undefined) ?? "";

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return {
          apiKey: typeof parsed.shopifyAPIKey === "string" ? parsed.shopifyAPIKey : "",
          apiSecretKey: typeof parsed.shopifyAPISecret === "string" ? parsed.shopifyAPISecret : "",
          shopifyAppUrl: typeof parsed.shopifyAppUrl === "string" ? parsed.shopifyAppUrl : "",
          shopifyScopes: typeof parsed.shopifyScopes === "string" ? parsed.shopifyScopes : "",
        };
      } catch {
        // invalid JSON
      }
    }
  } finally {
    await dbSession.close();
  }

  return {
    apiKey: "",
    apiSecretKey: "",
    shopifyAppUrl: "",
    shopifyScopes: "",
  };
}

/**
 * Load Shopify credentials from the CredentialsJson vertex for the request's subdomain.
 */
export async function getShopifyCredentials(
  request: APIEvent["request"],
): Promise<ShopifyCredentials> {
  const { subDomain } = await getDBSessionForSubdomain(request);
  return getShopifyCredentialsForSubdomain(subDomain);
}
