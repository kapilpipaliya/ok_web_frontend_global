/**
 * Shopify Server Configuration
 *
 * Credentials are loaded from the CredentialsJson vertex per subdomain.
 * Pass dbSession when you have one (e.g. request); otherwise a short-lived session is used (e.g. jobs).
 */

import type { Session } from "neo4j-driver";

import "@shopify/shopify-app-react-router/adapters/node";

import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

import {
  getShopifyCredentialsForSubdomain,
  getShopifyCredentialsFromSession,
  type ShopifyCredentials,
} from "./getShopifyCredentials";
import { getNeo4jSessionStore } from "./neo4jSessionStore";

type ShopifyAppInstance = ReturnType<typeof shopifyApp>;

const appCache = new Map<string, ShopifyAppInstance>();

function createShopifyAppInstance(
  credentials: ShopifyCredentials,
  appSubDomain: string,
): ShopifyAppInstance {
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
    sessionStorage: getNeo4jSessionStore(appSubDomain),
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
 * Get the Shopify app instance for the given subdomain.
 * Pass dbSession when available (e.g. HTTP request); omit for jobs (uses short-lived session for credentials).
 */
export async function getShopify(
  appSubDomain: string,
  dbSession?: Session,
): Promise<ShopifyAppInstance> {
  let app = appCache.get(appSubDomain);
  if (!app) {
    const credentials = dbSession
      ? await getShopifyCredentialsFromSession(dbSession)
      : await getShopifyCredentialsForSubdomain(appSubDomain);
    app = createShopifyAppInstance(credentials, appSubDomain);
    appCache.set(appSubDomain, app);
  }
  return app;
}
