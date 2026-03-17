import type { APIEvent } from "@solidjs/start/server";

import { getWebsiteSchemasSync } from "~/page_schema/loader";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { createAppState } from "~/createAppState";
import type { Vertex } from "~/lib/graph/type/vertex";
import {
  deleteExistingItems,
  importSchemas,
  buildSuccessResponse,
  createSchemaImportActivityLog,
} from "~/lib/schema/importSchemas";
import { runMigration } from "~/lib/schema/runMigration";
import { saveMigrationRequestForAllShops } from "~/lib/shopify/shopMigrationRequest";
import { ensureShopDatabaseAndMigrate } from "~/lib/shopify/shopifyHelpers";
import type { Session, Transaction } from "neo4j-driver";
import type { WebsiteSchemas } from "~/page_schema/loader";

function parseImportQueryParams(request: Request): {
  components: string[];
  pages: string[];
  functions: string[];
  filterOnly: boolean;
} {
  const url = new URL(request.url);
  const componentsParam = url.searchParams.get("components")?.trim() ?? "";
  const pagesParam = url.searchParams.get("pages")?.trim() ?? "";
  const functionsParam = url.searchParams.get("functions")?.trim() ?? "";
  const componentKeys =
    componentsParam.length > 0
      ? componentsParam.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
  const pageKeys =
    pagesParam.length > 0
      ? pagesParam.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
  const functionKeys =
    functionsParam.length > 0
      ? functionsParam.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
  return {
    components: componentKeys,
    pages: pageKeys,
    functions: functionKeys,
    filterOnly:
      componentKeys.length > 0 || pageKeys.length > 0 || functionKeys.length > 0,
  };
}

function filterWebsiteSchemasByParams(
  websiteSchemas: WebsiteSchemas,
  includeComponentKeys: string[],
  includePageKeys: string[],
  includeFunctionKeys: string[],
): WebsiteSchemas {
  const filtered: WebsiteSchemas = {};

  if (includeComponentKeys.length > 0 && websiteSchemas.components) {
    filtered.components = {};
    for (const key of includeComponentKeys) {
      if (websiteSchemas.components[key]) {
        filtered.components[key] = websiteSchemas.components[key];
      }
    }
  }

  if (includePageKeys.length > 0 && websiteSchemas.pages) {
    filtered.pages = {};
    for (const key of includePageKeys) {
      if (websiteSchemas.pages[key]) {
        filtered.pages[key] = websiteSchemas.pages[key];
      }
    }
  }

  if (includeFunctionKeys.length > 0 && websiteSchemas.functions) {
    filtered.functions = {};
    for (const key of includeFunctionKeys) {
      if (websiteSchemas.functions[key]) {
        filtered.functions[key] = websiteSchemas.functions[key];
      }
    }
  }

  return filtered;
}

async function validateUserAndPermissions(
  request: Request,
  dbSession: Session | Transaction,
): Promise<Vertex> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  return user;
}

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

    // Use subdomain as website name
    const websiteName = subDomain;

    const {
      components: includeComponentKeys,
      pages: includePageKeys,
      functions: includeFunctionKeys,
      filterOnly,
    } = parseImportQueryParams(request);

    // Load schemas for the specific website
    let websiteSchemas = getWebsiteSchemasSync(websiteName);

    // When query params are set, import only the requested types (from file system)
    if (filterOnly) {
      websiteSchemas = filterWebsiteSchemasByParams(
        websiteSchemas,
        includeComponentKeys,
        includePageKeys,
        includeFunctionKeys,
      );
    }

    if (
      !(
        websiteSchemas.components ||
        websiteSchemas.pages ||
        websiteSchemas.themes ||
        websiteSchemas.functions
      )
    ) {
      throw new APIError(`No schemas found for website: ${websiteName}`, 404);
    }

    // Start transaction for entire operation (delete + import)
    const tx = dbSession.beginTransaction();
    try {
      // Delete existing items within the transaction
      const deletedItems = await deleteExistingItems(tx, websiteSchemas, user);

      // Create a new graph state for import
      const [graph, setGraph] = createAppState();

      // Import all schemas
      const stats = await importSchemas(websiteSchemas, tx, graph, setGraph);

      // Merge deleted items into stats
      stats.deletedItems = deletedItems;

      // Log the import activity
      await createSchemaImportActivityLog(
        tx,
        websiteName,
        user.P.email,
        stats,
        deletedItems,
      );

      await tx.commit();

      // Build response
      const response = buildSuccessResponse(
        websiteName,
        stats,
        deletedItems,
        websiteSchemas,
      );

      // Run migrations after schema import
      console.log("[Schema Import] Running migrations after import...");
      const migrationResult = await runMigration(dbSession, subDomain, user, {
        dryRun: false,
      });

      // Update global migration request so all Shopify shops run migration on next load
      // (authShopifyAdminRequest calls ensureShopDatabaseAndMigrate when the shop page opens)
      await saveMigrationRequestForAllShops();

      // If request includes current shop (e.g. import opened from Shopify app), run migration for that shop now
      // not tested yet
      const url = new URL(request.url);
      const currentShop = url.searchParams.get("shop");
      if (currentShop && /\.myshopify\.com$/i.test(currentShop)) {
        const appSessionData = await getDBSessionForSubdomain(request);
        try {
          const shopMigrationResult = await ensureShopDatabaseAndMigrate(
            currentShop,
            {
              dryRun: false,
              contextData: {},
              migrationSubDomain: "decodeproduct",
              appSubDomain: appSessionData.subDomain,
            },
          );
          console.log(
            "[Schema Import] Migration run for current shop:",
            currentShop,
            "subDomain:",
            shopMigrationResult.subDomain,
          );
          await shopMigrationResult.dbSession.close();
        } catch (err) {
          console.warn(
            "[Schema Import] Migration for current shop failed:",
            currentShop,
            err,
          );
        } finally {
          await appSessionData.dbSession.close();
        }
      }

      // Add migration result to response if migration was attempted
      if (migrationResult.functionName) {
        return new Response(
          JSON.stringify({
            ...response,
            migration: {
              success: migrationResult.success,
              functionName: migrationResult.functionName,
              error: migrationResult.error,
              data: migrationResult.data,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      await tx.rollback();
      throw error;
    } finally {
      await tx.close();
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
