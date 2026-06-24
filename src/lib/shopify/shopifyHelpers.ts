import type { Session } from "neo4j-driver";
import "@shopify/shopify-api/adapters/node";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDriver } from "~/cypher/core/driver";
import { adminUserData } from "~/cypher/mutate/manage/adminUserData";
import { getAllDatabases } from "~/cypher/mutate/manage/getAllDatabases";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { createDatabaseConstraints } from "~/cypher/mutate/signup/seed/createDatabaseConstraints";
import { signupAdminInvited } from "~/cypher/mutate/signup/signupAdmin";
import { validateEmail } from "~/lib/validation/validateEmail";
import { syncEmailSettingsToSingleShop } from "~/lib/email/syncEmailSettingsToShopDatabases";
import { syncCompanyLogosToSingleShop } from "~/lib/settings/syncCompanyLogosToShopDatabases";
import { syncGlobalSettingsToSingleShop } from "~/lib/settings/syncGlobalSettingsToShopDatabases";
import { syncSchemaToSingleShop } from "~/lib/schema/syncSchemaToSingleShop";
import { runMigration } from "~/lib/schema/runMigration";
import { sendInvitationEmail } from "~/routes/api/users/functions/sendInvitationEmail";
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

export { getDatabaseNameForShop } from "~/lib/shopify/getDatabaseNameForShop";
import { getDatabaseNameForShop } from "~/lib/shopify/getDatabaseNameForShop";

/** Minimal Shopify Admin API client for GraphQL (from `authenticate.admin`). */
export interface ShopifyAdminGraphqlClient {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
}

const SHOP_CONTACT_EMAIL_QUERY = `#graphql
  query ShopContactEmail {
    shop {
      email
      contactEmail
    }
  }
`;

/**
 * Fetch the shop's contact email via Admin GraphQL (`shop.contactEmail` or `shop.email`).
 */
export async function getShopEmailFromShopifyAdmin(
  admin: ShopifyAdminGraphqlClient,
): Promise<string | undefined> {
  try {
    const response = await admin.graphql(SHOP_CONTACT_EMAIL_QUERY);
    const body = (await response.json()) as {
      data?: { shop?: { contactEmail?: string | null; email?: string | null } };
      errors?: unknown[];
    };

    if (body.errors?.length) {
      console.warn("[Shopify] Shop email GraphQL errors:", body.errors);
      return undefined;
    }

    const shop = body.data?.shop;
    const email =
      (typeof shop?.contactEmail === "string" && shop.contactEmail.trim()) ||
      (typeof shop?.email === "string" && shop.email.trim());

    return email || undefined;
  } catch (error) {
    console.warn("[Shopify] Failed to fetch shop email from Admin API:", error);
    return undefined;
  }
}

async function resolveShopInviteEmail(
  shopifyAdmin?: ShopifyAdminGraphqlClient,
): Promise<string | undefined> {
  if (!shopifyAdmin) {
    return undefined;
  }

  const shopEmail = await getShopEmailFromShopifyAdmin(shopifyAdmin);
  if (shopEmail && !validateEmail(shopEmail)) {
    return shopEmail.trim();
  }

  return undefined;
}

const MIGRATION_RETRY_COUNT = 3;
const MIGRATION_RETRY_GAP_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getShopUserByEmail(
  session: Session,
  email: string,
): Promise<Vertex | null> {
  const result = await session.run(
    "MATCH (u:User {email: $email}) RETURN u LIMIT 1",
    { email },
  );

  const node = result.records[0]?.get("u");
  return node ? convertNodeToJson(node) : null;
}

/**
 * Ensure the shop Neo4j database exists and return its admin user (existing or newly invited).
 */
async function ensureShopDatabaseAndAdminUser(
  shopDatabaseName: string,
  shop: string,
  options: {
    shopifyAdmin?: ShopifyAdminGraphqlClient;
    appSubDomain?: string;
  } = {},
): Promise<{ user: Vertex | null; sendInvitationAfterMigrate: boolean }> {
  const driver = await getDriver();

  await createDatabase(shopDatabaseName);

  const setupSession = driver.session({ database: shopDatabaseName });

  try {
    const inviteEmail = await resolveShopInviteEmail(options.shopifyAdmin);

    if (!inviteEmail) {
      console.warn(
        `[Shopify] Skipped admin invite for ${shopDatabaseName} — no valid shop email`,
      );
      return { user: null, sendInvitationAfterMigrate: false };
    }

    const existingUserByEmail = await getShopUserByEmail(
      setupSession,
      inviteEmail,
    );
    if (existingUserByEmail) {
      return {
        user: existingUserByEmail,
        sendInvitationAfterMigrate: false,
      };
    }

    await createDatabaseConstraints(setupSession);
    const tx = setupSession.beginTransaction();
    let createdUser: Vertex;
    try {
      const result = await signupAdminInvited(tx, {
        email: inviteEmail,
        username: adminUserData.username,
        name: adminUserData.username,
      });
      if (result.error) {
        throw new Error(result.error);
      }
      await tx.commit();
      createdUser = result.user;
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }

    return { user: createdUser, sendInvitationAfterMigrate: true };
  } finally {
    await setupSession.close();
  }
}

async function sendShopAdminInvitationEmail(
  shopDatabaseName: string,
  shop: string,
  user: Vertex,
  appSubDomain?: string,
): Promise<void> {
  if (appSubDomain) {
    const emailSync = await syncEmailSettingsToSingleShop(appSubDomain, shop);
    if (!emailSync.ok) {
      console.warn(
        `[Shopify] Email settings sync failed for ${shop} before invitation email:`,
        emailSync.error,
      );
    }
  }

  const driver = await getDriver();
  const inviteSession = driver.session({ database: shopDatabaseName });
  const inviteHost = `${shopDatabaseName}.decodecommerce.com`;

  try {
    await sendInvitationEmail(
      new Request(`https://${inviteHost}`),
      user,
      shopDatabaseName,
      inviteSession,
      inviteHost,
    );
  } finally {
    await inviteSession.close();
  }
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
 * - Ensure shop database exists and resolve its admin user (existing or newly invited)
 * - Open a session for that database
 * - Sync pages/components/functions from the app subdomain (schema sync), then migrate
 * - Send invitation email for new invites after migration
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
    /** Shopify Admin API client from `authenticate.admin` — used to fetch shop email. */
    shopifyAdmin?: ShopifyAdminGraphqlClient;
  } = {},
): Promise<{ dbSession: Session; subDomain: string }> {
  const shopDatabaseName = getDatabaseNameForShop(shop, options.appSubDomain);

  const { user: shopAdminUser, sendInvitationAfterMigrate } =
    await ensureShopDatabaseAndAdminUser(shopDatabaseName, shop, {
      shopifyAdmin: options.shopifyAdmin,
      appSubDomain: options.appSubDomain,
    });

  const driver = await getDriver();
  const shopDbSession = driver.session({ database: shopDatabaseName });

  if (!shopAdminUser) {
    return { dbSession: shopDbSession, subDomain: shopDatabaseName };
  }

  if (!options.appSubDomain) {
    return { dbSession: shopDbSession, subDomain: shopDatabaseName };
  }

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
        const needMigration = await shouldRunMigrationForShop(
          shop,
          shopDbSession,
        );
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

  try {
    const mainDbSession = driver.session({
      database: options.appSubDomain,
    });
    try {
      const schemaSync = await syncSchemaToSingleShop({
        mainDbSession,
        appSubDomain: options.appSubDomain,
        shop,
        user: shopAdminUser,
        runMigrationAfterImport: false,
        updateShopifyShopSyncFields: true,
      });
      if (!schemaSync.success) {
        console.warn(
          `[Shopify] Schema sync failed for ${shop}:`,
          schemaSync.error,
        );
      }
    } finally {
      await mainDbSession.close();
    }
    const migrationResult = await runMigration(
      shopDbSession,
      shopDatabaseName,
      shopAdminUser,
      {
        dryRun: options.dryRun ?? false,
        contextData: {
          shop,
          ...options.contextData,
        },
        appSubDomain: options.appSubDomain,
      },
    );

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

    const globalSync = await syncGlobalSettingsToSingleShop(
      options.appSubDomain,
      shop,
    );
    if (!globalSync.ok) {
      console.warn(
        `[Shopify] Global settings sync failed for ${shop} after migration:`,
        globalSync.error,
      );
    }

    const logosSync = await syncCompanyLogosToSingleShop(
      options.appSubDomain,
      shop,
    );
    if (!logosSync.ok) {
      console.warn(
        `[Shopify] Company logos sync failed for ${shop} after migration:`,
        logosSync.error,
      );
    }

    if (sendInvitationAfterMigrate) {
      try {
        await sendShopAdminInvitationEmail(
          shopDatabaseName,
          shop,
          shopAdminUser,
          options.appSubDomain,
        );
      } catch (inviteErr) {
        console.error(
          `[Shopify] Invitation email failed for ${shop} after migration:`,
          inviteErr,
        );
      }
    }

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
