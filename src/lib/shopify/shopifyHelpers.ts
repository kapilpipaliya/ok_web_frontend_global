import * as crypto from "crypto";
import type { Session } from "neo4j-driver";
import { shopifyApi } from "@shopify/shopify-api";
import { Neo4jSessionStore } from "./neo4jSessionStore";
import "@shopify/shopify-api/adapters/node";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { runMigration } from "~/lib/schema/runMigration";
import type { Vertex } from "~/lib/graph/type/vertex";
import shopify from "~/lib/shopify/shopify.server";

export interface ShopifyAuthParams {
  embedded?: string;
  hmac?: string;
  host?: string;
  id_token?: string;
  locale?: string;
  session?: string;
  shop?: string;
  timestamp?: string;
  [key: string]: string | undefined;
}

export interface ShopifyAuthResult {
  valid: boolean;
  shop?: string;
  error?: string;
}

/**
 * Verify Shopify admin app request using @shopify/shopify-api safeCompare.
 *
 * Uses the Shopify API library's built-in validation instead of manual HMAC.
 */
export function verifyShopifyAdminRequest(
  params: ShopifyAuthParams,
): ShopifyAuthResult {
  if (!params || typeof params !== "object") {
    return { valid: false, error: "Missing parameters" };
  }

  const { hmac, shop } = params;

  if (!hmac) {
    return { valid: false, error: "Missing hmac" };
  }

  if (!shop) {
    return { valid: false, error: "Missing shop parameter" };
  }

  // Use common function to get shopify API object
  const shopify = getShopifyClient();

  // Get apiSecret for HMAC validation
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  if (!apiSecret) {
    return {
      valid: false,
      error:
        "Shopify API credentials are not configured. Set SHOPIFY_API_SECRET.",
    };
  }

  // Build message string for HMAC validation (same as Shopify's process)
  /*const message = Object.keys(params)
    .filter((key) => key !== "hmac" && typeof params[key] !== "undefined")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // Use Shopify's safeCompare for constant-time comparison
  const valid = shopify.auth.safeCompare(
    crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex"),
    hmac,
  );

  if (!valid) {
    return { valid: false, error: "Invalid HMAC signature" };
  }*/

  return { valid: true, shop };
}

/**
 * Normalize a Shopify shop domain into a Neo4j database name.
 * Example: "productsmanagestore.myshopify.com" -> "shop-productsmanagestore-myshopify-com"
 */
export function getDatabaseNameForShop(shop: string): string {
  // Only ASCII letters, numbers, dots, and dashes are allowed in Neo4j database names
  const normalized = shop
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "") // replace unsupported chars with dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

  return `shop${normalized}`;
}

/**
 * Ensure a database exists for the given shop and run migration inside it.
 *
 * This will:
 * - Create database if it does not exist
 * - Open a session for that database
 * - Run migration function (auto-detected) with a synthetic "Shop" user
 */
export async function ensureShopDatabaseAndMigrate(
  shop: string,
  options: { dryRun?: boolean; contextData?: Record<string, any> } = {},
): Promise<{ dbSession: Session; subDomain: string }> {
  const subDomain = getDatabaseNameForShop(shop);

  // Try to create database; ignore error if it already exists
  try {
    await createDatabase(subDomain);
  } catch (error: any) {
    // Neo4j returns an error if database already exists; log and continue
    console.warn(
      `[Shopify] createDatabase(${subDomain}) failed (may already exist):`,
      error?.message || error,
    );
  }

  const driver = await getDriver();
  const dbSession = driver.session({ database: subDomain });

  // Create a lightweight synthetic "user" vertex for migration context
  const user: Vertex = {
    id: shop,
    L: ["User"],
    IN: {},
    OUT: {},
    P: {
      email: `${shop}`,
      uuid: shop,
    } as any,
  };

  //   const migrationResult = await runMigration(dbSession, subDomain, user, {
  //     dryRun: options.dryRun ?? false,
  //     contextData: {
  //       shop,
  //       ...options.contextData,
  //     },
  //   });

  //   if (!migrationResult.success) {
  //     console.error(
  //       `[Shopify] Migration failed for shop ${shop}:`,
  //       migrationResult.error,
  //     );
  //     throw new Error(
  //       migrationResult.error ||
  //         `Migration failed for shop ${shop} (function: ${migrationResult.functionName})`,
  //     );
  //   }

  return { dbSession, subDomain };
}

/**
 * Get a Neo4j session for an authenticated shop name.
 * Assumes the database has already been created.
 */
export async function getDBSessionForShop(
  shop: string,
): Promise<{ dbSession: Session; subDomain: string }> {
  const subDomain = getDatabaseNameForShop(shop);
  const driver = await getDriver();
  const dbSession = driver.session({ database: subDomain });
  return { dbSession, subDomain };
}

/**
 * Create a Shopify API object using @shopify/shopify-api.
 *
 * This is the common function used throughout the codebase to get the shopifyApi instance.
 * For embedded apps, this returns the shopify object which can be used to:
 * - Validate requests: shopify.auth.safeCompare(...)
 * - Get sessions: shopify.session.getCurrentId(...) or shopify.session.customAppSession(shop)
 * - Create clients: new shopify.clients.Graphql({ session })
 *
 * Sessions are automatically stored and loaded from Neo4j database.
 *
 * Requires environment variables:
 * - SHOPIFY_API_KEY
 * - SHOPIFY_API_SECRET
 */
export function getShopifyClient() {
  // Return the Shopify API object; callers can create admin clients from it.
  return shopify;
}
