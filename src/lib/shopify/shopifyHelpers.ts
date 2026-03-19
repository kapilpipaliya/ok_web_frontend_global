import type { Session } from "neo4j-driver";
import "@shopify/shopify-api/adapters/node";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { runMigration } from "~/lib/schema/runMigration";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getShopify } from "~/lib/shopify/shopify.server";
import { getShopifyCredentialsFromSession } from "~/lib/shopify/getShopifyCredentials";
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
 * Verify Shopify admin app request.
 * Uses credentials from CredentialsJson vertex (shopifyAPISecret).
 */
export async function verifyShopifyAdminRequest(
  params: ShopifyAuthParams,
  request: Request,
): Promise<ShopifyAuthResult> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const credentials = await getShopifyCredentialsFromSession(dbSession);
    if (!credentials.apiSecretKey) {
      return {
        valid: false,
        error:
          "Shopify API credentials are not configured. Set shopifyAPISecret in Credentials JSON.",
      };
    }
    return { valid: true };
  } finally {
    await dbSession.close();
  }
}

/**
 * Normalize a Shopify shop domain into a Neo4j database name.
 * When appSubDomain is provided, prefixes with the app subdomain so the same shop
 * on different subdomain apps gets different databases (no conflict).
 * Neo4j database names only allow alphanumeric and underscore.
 * Example: ("decode-products-organizer.myshopify.com") -> "shopdecodeproductsorganizermyshopifycom"
 * Example: ("decode-products-organizer.myshopify.com", "decodeproduct") -> "shop_decodeproduct_decodeproductsorganizermyshopifycom"
 */
export function getDatabaseNameForShop(shop: string, appSubDomain?: string): string {
  let normalizedShop = shop
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") // replace unsupported chars with dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

  normalizedShop = normalizedShop.replace(/myshopifycom$/, "");

  if (appSubDomain) {
    const normalizedAppSubDomain = appSubDomain
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/^-+|-+$/g, "");
    return normalizedAppSubDomain ? `shop${normalizedAppSubDomain}${normalizedShop}` : `shop${normalizedShop}`;
  }
  return `shop${normalizedShop}`;
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
    /** App subdomain from request so shop DB is namespaced per subdomain app; also used for migration function lookup. */
    appSubDomain?: string;
  } = {},
): Promise<{ dbSession: Session; subDomain: string }> {
  const shopDatabaseName = getDatabaseNameForShop(shop, options.appSubDomain);

  // Try to create database; ignore error if it already exists
  try {
    await createDatabase(shopDatabaseName);
  } catch (error: any) {
    // Neo4j returns an error if database already exists; log and continue
    console.warn(
      `[Shopify] createDatabase(${shopDatabaseName}) failed (may already exist):`,
      error?.message || error,
    );
  }

  const driver = await getDriver();
  const shopDbSession = driver.session({ database: shopDatabaseName });

  const runMigrationNow = await shouldRunMigrationForShop(shop, shopDbSession);
  if (!runMigrationNow) {
    return { dbSession: shopDbSession, subDomain: shopDatabaseName };
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
          return getDBSessionForShop(shop, options.appSubDomain);
        }
        claimed = await tryClaimMigration(shop, shopDbSession);
        if (claimed) break;
      }
    }
    if (!claimed) {
      await shopDbSession.close();
      return getDBSessionForShop(shop, options.appSubDomain);
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
    const migrationResult = await runMigration(shopDbSession, shopDatabaseName, user, {
      dryRun: options.dryRun ?? false,
      contextData: {
        shop,
        ...options.contextData,
      },
      appSubDomain: options.appSubDomain,
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
    return { dbSession: shopDbSession, subDomain: shopDatabaseName };
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
  appSubDomain?: string,
): Promise<{ dbSession: Session; subDomain: string }> {
  const shopDatabaseName = getDatabaseNameForShop(shop, appSubDomain);
  const driver = await getDriver();
  const dbSession = driver.session({ database: shopDatabaseName });
  return { dbSession, subDomain: shopDatabaseName };
}
