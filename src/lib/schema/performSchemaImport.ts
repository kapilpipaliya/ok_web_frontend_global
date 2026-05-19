import type { Session } from "neo4j-driver";

import { createAppState } from "~/createAppState";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import {
  buildSuccessResponse,
  createSchemaImportActivityLog,
  deleteExistingItems,
  importSchemas,
} from "~/lib/schema/importSchemas";
import { runMigration } from "~/lib/schema/runMigration";
import { saveMigrationRequestForAllShops } from "~/lib/shopify/shopMigrationRequest";
import { ensureShopDatabaseAndMigrate } from "~/lib/shopify/shopifyHelpers";
import { getWebsiteSchemasSync } from "~/page_schema/loader";
import type { WebsiteSchemas } from "~/page_schema/loader";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { ImportJobPayload } from "~/lib/schema/schemaJobs/schemaJobTypes";

export function parseImportQueryParams(request: Request): {
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

export function buildImportJobPayload(request: Request): ImportJobPayload {
  const q = parseImportQueryParams(request);
  const currentShop = new URL(request.url).searchParams.get("shop");
  return {
    filterOnly: q.filterOnly,
    includeComponentKeys: q.components,
    includePageKeys: q.pages,
    includeFunctionKeys: q.functions,
    currentShop,
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

export interface PerformSchemaImportInput {
  dbSession: Session;
  subDomain: string;
  user: Vertex;
  filterOnly: boolean;
  includeComponentKeys: string[];
  includePageKeys: string[];
  includeFunctionKeys: string[];
  currentShop: string | null;
}

/**
 * Runs filesystem → graph schema import and follow-up migrations (same behavior as legacy import API body).
 */
export async function performSchemaImport(
  input: PerformSchemaImportInput,
): Promise<Record<string, unknown>> {
  const {
    dbSession,
    subDomain,
    user,
    filterOnly,
    includeComponentKeys,
    includePageKeys,
    includeFunctionKeys,
    currentShop,
  } = input;

  const websiteName = subDomain;

  let websiteSchemas = getWebsiteSchemasSync(websiteName);

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
      websiteSchemas.functions ||
      websiteSchemas.emailTemplates
    )
  ) {
    throw new APIError(`No schemas found for website: ${websiteName}`, 404);
  }

  let response: Record<string, unknown>;

  const tx = dbSession.beginTransaction();
  try {
    const deletedItems = await deleteExistingItems(tx, websiteSchemas, user);

    const [graph, setGraph] = createAppState();

    const stats = await importSchemas(websiteSchemas, tx, graph, setGraph);

    stats.deletedItems = deletedItems;

    await createSchemaImportActivityLog(
      tx,
      websiteName,
      user.P.email,
      stats,
      deletedItems,
    );

    await tx.commit();

    response = buildSuccessResponse(
      websiteName,
      stats,
      deletedItems,
      websiteSchemas,
    ) as Record<string, unknown>;
  } catch (error: unknown) {
    await tx.rollback();
    throw error;
  } finally {
    await tx.close();
  }

  console.log("[Schema Import] Running migrations after import...");
  const migrationResult = await runMigration(dbSession, subDomain, user, {
    dryRun: false,
  });

  await saveMigrationRequestForAllShops();

  if (currentShop && /\.myshopify\.com$/i.test(currentShop)) {
    try {
      const shopMigrationResult = await ensureShopDatabaseAndMigrate(
        currentShop,
        {
          dryRun: false,
          contextData: {},
          appSubDomain: subDomain,
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
    }
  }

  if (migrationResult.functionName) {
    return {
      ...response,
      migration: {
        success: migrationResult.success,
        functionName: migrationResult.functionName,
        error: migrationResult.error,
        data: migrationResult.data,
      },
    };
  }

  return response;
}
