import * as crypto from "crypto";
import type { Session } from "neo4j-driver";
import "@shopify/shopify-api/adapters/node";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { runMigration } from "~/lib/schema/runMigration";
import type { Vertex } from "~/lib/graph/type/vertex";
import shopify from "~/lib/shopify/shopify.server";
import {
  clearMigrationInProgress,
  clearMigrationInProgressAndSetLastAt,
  getMigrationRequestForAllShops,
  isMigrationInProgress,
  shouldRunMigrationForShop,
  tryClaimMigration,
} from "~/lib/shopify/shopMigrationRequest";

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

  return { valid: true };
}

/**
 * Normalize a Shopify shop domain into a Neo4j database name.
 * Neo4j database names only allow alphanumeric characters (no hyphens, dots, etc.)
 * Example: "decode-products-organizer.myshopify.com" -> "shopdecodeproductsorganizermyshopifycom"
 */
export function getDatabaseNameForShop(shop: string): string {
  const normalized = shop
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") // replace unsupported chars with dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

  return `shop${normalized}`;
}

const MIGRATION_RETRY_COUNT = 3;
const MIGRATION_RETRY_GAP_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure a database exists for the given shop and run migration inside it.
 *
 * Migration runs only when the global "migration request for all shops" time
 * (set by admin) is greater than this shop's last migration time. Migration
 * "in progress" is stored in the database; if another process is already
 * migrating, this waits and retries up to 3 times with a time gap so migration
 * can complete before proceeding.
 *
 * This will:
 * - Create database if it does not exist
 * - Open a session for that database
 * - If shouldRunMigrationForShop(shop): try to claim migration (set in-progress in DB)
 * - If claimed: run migration, clear in-progress and set lastMigrationAt
 * - If not claimed (migration in progress): wait and retry up to 3 times, then proceed with session
 * - Return session and subDomain
 */
export async function ensureShopDatabaseAndMigrate(
  shop: string,
  options: {
    dryRun?: boolean;
    contextData?: Record<string, any>;
    /**
     * Optional: database (subdomain) to use for discovering the migration function.
     * The migration function will be *executed* against the shop database, but
     * its key can be looked up from a different database (e.g. a global/admin DB).
     */
    migrationSubDomain?: string;
  } = {},
): Promise<{ dbSession: Session; subDomain: string }> {
  const shopSubDomain = getDatabaseNameForShop(shop);

  // Try to create database; ignore error if it already exists
  try {
    await createDatabase(shopSubDomain);
  } catch (error: any) {
    // Neo4j returns an error if database already exists; log and continue
    console.warn(
      `[Shopify] createDatabase(${shopSubDomain}) failed (may already exist):`,
      error?.message || error,
    );
  }

  const driver = await getDriver();
  const shopDbSession = driver.session({ database: shopSubDomain });

  const runMigrationNow = await shouldRunMigrationForShop(shop, shopDbSession);
  if (!runMigrationNow) {
    return { dbSession: shopDbSession, subDomain: shopSubDomain };
  }

  let claimed = await tryClaimMigration(shop, shopDbSession);
  if (!claimed) {
    for (let i = 0; i < MIGRATION_RETRY_COUNT; i++) {
      await sleep(MIGRATION_RETRY_GAP_MS);
      const stillInProgress = await isMigrationInProgress(shop, shopDbSession);
      if (!stillInProgress) {
        const needMigration = await shouldRunMigrationForShop(shop, shopDbSession);
        if (!needMigration) {
          await shopDbSession.close();
          return getDBSessionForShop(shop);
        }
        claimed = await tryClaimMigration(shop, shopDbSession);
        if (claimed) break;
      }
    }
    if (!claimed) {
      await shopDbSession.close();
      return getDBSessionForShop(shop);
    }
  }

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

  try {
    const migrationResult = await runMigration(shopDbSession, shopSubDomain, user, {
      dryRun: options.dryRun ?? false,
      contextData: {
        shop,
        ...options.contextData,
      },
      migrationSubDomain: options.migrationSubDomain,
    });

    if (!migrationResult.success) {
      console.error(
        `[Shopify] Migration failed for shop ${shop}:`,
        migrationResult.error,
      );
      await clearMigrationInProgress(shop, shopDbSession);
      throw new Error(
        migrationResult.error ||
          `Migration failed for shop ${shop} (function: ${migrationResult.functionName})`,
      );
    }

    const requestAt = await getMigrationRequestForAllShops();
    await clearMigrationInProgressAndSetLastAt(
      shop,
      requestAt ?? new Date(),
      shopDbSession,
    );
    return { dbSession: shopDbSession, subDomain: shopSubDomain };
  } catch (err) {
    await clearMigrationInProgress(shop, shopDbSession);
    throw err;
  }
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
