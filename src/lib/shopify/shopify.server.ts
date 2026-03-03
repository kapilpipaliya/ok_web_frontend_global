/**
 * Shopify Server Configuration
 *
 * Credentials (apiKey, apiSecretKey, shopifyAppUrl) are loaded from the CredentialsJson vertex
 * per subdomain. Subdomain is always derived from the request.
 */

import "@shopify/shopify-app-react-router/adapters/node";

import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

import { getNeo4jSessionStore } from "./neo4jSessionStore";
import {
  getShopifyCredentials,
  type ShopifyCredentials,
} from "./getShopifyCredentials";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

type ShopifyAppInstance = ReturnType<typeof shopifyApp>;

const appCache = new Map<string, ShopifyAppInstance>();

function createShopifyAppInstance(credentials: ShopifyCredentials): ShopifyAppInstance {
  return shopifyApp({
    apiKey: credentials.apiKey,
    apiSecretKey: credentials.apiSecretKey,
    apiVersion: ApiVersion.October25,
    scopes: credentials.shopifyScopes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    appUrl: credentials.shopifyAppUrl,
    authPathPrefix: "/auth",
    sessionStorage: getNeo4jSessionStore(),
    distribution: AppDistribution.AppStore,
    future: {
      expiringOfflineAccessTokens: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
      ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
      : {}),
  });
}

/**
 * Get the Shopify app instance for the request's subdomain.
 * Credentials are loaded from the CredentialsJson vertex (shopifyAPIKey, shopifyAPISecret, shopifyAppUrl).
 */
export async function getShopify(request: Request): Promise<ShopifyAppInstance> {
  const { subDomain } = await getDBSessionForSubdomain(request);
  let app = appCache.get(subDomain);
  if (!app) {
    const credentials = await getShopifyCredentials(request);
    app = createShopifyAppInstance(credentials);
    appCache.set(subDomain, app);
  }
  return app;
}
