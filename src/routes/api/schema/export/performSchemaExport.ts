import { join } from "node:path";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import { fetchFormMetaData } from "~/pages/functions/fetchFormMetaData";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { isPublicSchemaProperty } from "~/lib/schema/filterSchemasForShopSync";
import { fetchSchemaCategoryFolderPaths } from "~/lib/schema/getSchemaCategoryFolderPaths";
import {
  type ExportType,
  writeSchemaToFile,
} from "~/routes/api/schema/export/utils/writeSchemaToFile";

export interface ExportStats {
  exportedComponents: string[];
  exportedPages: string[];
  exportedThemes: string[];
  exportedFunctions: string[];
  exportedEmailTemplates: string[];
  totalVertices: number;
  totalEdges: number;
}

async function fetchEntities(
  dbSession: Session,
  subDomain: string,
  entityType: "Component" | "Page" | "Theme" | "Function" | "EmailTemplate",
  options: {
    skipKeys?: string[];
    includeKeys?: string[];
    excludePublicPages?: boolean;
  } = {},
): Promise<Record<string, ExportedSchema>> {
  const {
    skipKeys = [],
    includeKeys = [],
    excludePublicPages = false,
  } = options;
  const useInclude = includeKeys.length > 0;
  const result = await dbSession.run(
    useInclude
      ? `
    MATCH (entity:${entityType})
    WHERE entity.key IN $includeKeys
    RETURN entity
    ORDER BY entity.key
  `
      : `
    MATCH (entity:${entityType})
    WHERE NOT entity.key IN $skipKeys
    RETURN entity
    ORDER BY entity.key
  `,
    useInclude ? { includeKeys } : { skipKeys },
  );

  const entities: Record<string, ExportedSchema> = {};

  for (const record of result.records) {
    const entity = record.get("entity");
    const entityVertex = convertNodeToJson(entity);
    const entityId = entityVertex.id;
    const entityKey = entityVertex.P.key;
    if (!(entityKey && entityId)) {
      throw new APIError(
        `Failed to export ${entityType}: vertex is missing key or id`,
        500,
      );
    }

    if (
      excludePublicPages &&
      entityType === "Page" &&
      isPublicSchemaProperty(entityVertex.P?.public)
    ) {
      continue;
    }

    if (entityType === "Function") {
      delete entityVertex.P.createdAt;
      delete entityVertex.P.updatedAt;
      entities[entityKey] = {
        vertexes: [entityVertex].map((v) => ({
          ...v,
          L: Array.isArray(v.L) ? v.L[0] : v.L,
        })),
        edges: [],
      };
      continue;
    }

    const fetchResult = await fetchFormMetaData(
      entityType,
      entityId,
      undefined,
      false,
      undefined,
      undefined,
      true,
      dbSession,
      subDomain,
    );

    if (fetchResult.error || !fetchResult.data) {
      throw new APIError(
        `Failed to export ${entityType} "${entityKey}": ${fetchResult.error ?? "no graph data returned"}`,
        500,
      );
    }

    let vertexes: Vertex[] = [];
    let edges: Edge[] = [];

    if (fetchResult.data.graph) {
      if (fetchResult.data.graph.vertexes) {
        vertexes = Object.values(fetchResult.data.graph.vertexes);
      }
      if (fetchResult.data.graph.edges) {
        edges = Object.values(fetchResult.data.graph.edges);
      }
    }

    entities[entityKey] = {
      vertexes: vertexes.map((v) => ({
        ...v,
        L: Array.isArray(v.L) ? v.L[0] : v.L,
      })),
      edges,
    };
  }

  return entities;
}

async function exportEntityGroup({
  entities,
  basePath,
  subDomain,
  folderName,
  statsArray,
  stats,
  categoryPaths = {},
}: {
  entities: Record<string, ExportedSchema>;
  basePath: string;
  subDomain: string;
  folderName: ExportType;
  statsArray: string[];
  stats: ExportStats;
  categoryPaths?: Record<string, string[]>;
}) {
  for (const [key, schema] of Object.entries(entities)) {
    await writeSchemaToFile(
      basePath,
      subDomain,
      folderName,
      key,
      schema,
      categoryPaths[key] ?? [],
    );
    statsArray.push(key);
    stats.totalVertices += schema.vertexes.length;
    stats.totalEdges += schema.edges.length;
  }
}

export function parseExportQueryParams(request: Request): {
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
      ? componentsParam
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
  const pageKeys =
    pagesParam.length > 0
      ? pagesParam
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
  const functionKeys =
    functionsParam.length > 0
      ? functionsParam
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
  return {
    components: componentKeys,
    pages: pageKeys,
    functions: functionKeys,
    filterOnly:
      componentKeys.length > 0 ||
      pageKeys.length > 0 ||
      functionKeys.length > 0,
  };
}

export interface PerformSchemaExportOptions {
  dbSession: Session;
  subDomain: string;
  exportBasePath: string;
  filterOnly: boolean;
  includeComponentKeys: string[];
  includePageKeys: string[];
  includeFunctionKeys: string[];
  /** When true, pages with `public: true` are omitted (shop schema sync). */
  excludePublicPages?: boolean;
}

/**
 * Export schema files (components, pages, themes, functions, email templates) under exportBasePath/subDomain/.
 * Used by GET /api/schema/export and schema sync.
 */
export async function performSchemaExport(
  options: PerformSchemaExportOptions,
): Promise<{ stats: ExportStats; exportPath: string }> {
  const {
    dbSession,
    subDomain,
    exportBasePath,
    filterOnly,
    includeComponentKeys,
    includePageKeys,
    includeFunctionKeys,
    excludePublicPages = false,
  } = options;

  await ensureDirectoryExists(exportBasePath);

  const stats: ExportStats = {
    exportedComponents: [],
    exportedPages: [],
    exportedThemes: [],
    exportedFunctions: [],
    exportedEmailTemplates: [],
    totalVertices: 0,
    totalEdges: 0,
  };

  const exportComponents = !filterOnly || includeComponentKeys.length > 0;
  const exportPages = !filterOnly || includePageKeys.length > 0;
  const exportFunctions = !filterOnly || includeFunctionKeys.length > 0;

  if (exportComponents) {
    const components = await fetchEntities(dbSession, subDomain, "Component", {
      ...(includeComponentKeys.length > 0
        ? { includeKeys: includeComponentKeys }
        : {}),
    });
    const componentCategoryPaths = await fetchSchemaCategoryFolderPaths(
      dbSession,
      "Component",
    );
    await exportEntityGroup({
      entities: components,
      basePath: exportBasePath,
      subDomain,
      folderName: "components",
      statsArray: stats.exportedComponents,
      stats,
      categoryPaths: componentCategoryPaths,
    });
  }

  if (exportPages) {
    const pages = await fetchEntities(dbSession, subDomain, "Page", {
      ...(includePageKeys.length > 0 ? { includeKeys: includePageKeys } : {}),
      excludePublicPages,
    });
    const pageCategoryPaths = await fetchSchemaCategoryFolderPaths(
      dbSession,
      "Page",
    );
    await exportEntityGroup({
      entities: pages,
      basePath: exportBasePath,
      subDomain,
      folderName: "pages",
      statsArray: stats.exportedPages,
      stats,
      categoryPaths: pageCategoryPaths,
    });
  }

  if (!filterOnly) {
    const themes = await fetchEntities(dbSession, subDomain, "Theme", {
      skipKeys: ["Default"],
    });
    const themeCategoryPaths = await fetchSchemaCategoryFolderPaths(
      dbSession,
      "Theme",
    );
    await exportEntityGroup({
      entities: themes,
      basePath: exportBasePath,
      subDomain,
      folderName: "themes",
      statsArray: stats.exportedThemes,
      stats,
      categoryPaths: themeCategoryPaths,
    });
  }

  if (exportFunctions) {
    const functions = await fetchEntities(dbSession, subDomain, "Function", {
      ...(includeFunctionKeys.length > 0
        ? { includeKeys: includeFunctionKeys }
        : {}),
    });
    const functionCategoryPaths = await fetchSchemaCategoryFolderPaths(
      dbSession,
      "Function",
    );
    await exportEntityGroup({
      entities: functions,
      basePath: exportBasePath,
      subDomain,
      folderName: "functions",
      statsArray: stats.exportedFunctions,
      stats,
      categoryPaths: functionCategoryPaths,
    });
  }

  if (!filterOnly) {
    const emailTemplates = await fetchEntities(dbSession, subDomain, "EmailTemplate", {});
    const emailTemplateCategoryPaths = await fetchSchemaCategoryFolderPaths(
      dbSession,
      "EmailTemplate",
    );
    await exportEntityGroup({
      entities: emailTemplates,
      basePath: exportBasePath,
      subDomain,
      folderName: "email_templates",
      statsArray: stats.exportedEmailTemplates,
      stats,
      categoryPaths: emailTemplateCategoryPaths,
    });
  }

  return {
    stats,
    exportPath: join(exportBasePath, subDomain),
  };
}
