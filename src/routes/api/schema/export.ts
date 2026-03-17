import type { APIEvent } from "@solidjs/start/server";
import { join } from "path";
import type { Session } from "neo4j-driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { fetchFormMetaData } from "~/pages/functions/fetchFormMetaData";
import type { ExportedSchema } from "./ExportedSchema";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

import { validateUserAndPermissions } from "~/routes/api/schema/export/validation/validateUserAndPermissions";
import {
  type ExportType,
  writeSchemaToFile,
} from "./export/utils/writeSchemaToFile";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export interface ExportStats {
  exportedComponents: string[];
  exportedPages: string[];
  exportedThemes: string[];
  exportedFunctions: string[];
  totalVertices: number;
  totalEdges: number;
}

async function fetchEntities(
  dbSession: Session,
  entityType: "Component" | "Page" | "Theme" | "Function",
  options: { skipKeys?: string[]; includeKeys?: string[] } = {},
): Promise<Record<string, ExportedSchema>> {
  const { skipKeys = [], includeKeys = [] } = options;
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
    if (!(entityKey && entityId)) continue;

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

    // Fetch entity data using fetchFormMetaData
    const fetchResult = await fetchFormMetaData(
      entityType, // pageVertexName
      entityId, // formId
      undefined, // expression
      false, // isDesignMode
      undefined, // pageKeyName
      undefined, // url
      true, // skipComponentData
    );

    if (fetchResult.error || !fetchResult.data) {
      continue;
    }

    let vertexes: Vertex[] = [];
    let edges: Edge[] = [];

    // Extract vertices and edges directly from the result
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
}: {
  entities: Record<string, ExportedSchema>;
  basePath: string;
  subDomain: string;
  folderName: ExportType;
  statsArray: string[];
  stats: ExportStats;
}) {
  for (const [key, schema] of Object.entries(entities)) {
    await writeSchemaToFile(basePath, subDomain, folderName, key, schema);
    statsArray.push(key);
    stats.totalVertices += schema.vertexes.length;
    stats.totalEdges += schema.edges.length;
  }
}

function parseExportQueryParams(request: Request): {
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

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

    const {
      components: includeComponentKeys,
      pages: includePageKeys,
      functions: includeFunctionKeys,
      filterOnly,
    } = parseExportQueryParams(request);

    // Create export directory path
    const exportBasePath = join(process.cwd(), "src", "page_schema");

    // Ensure base export directory exists
    await ensureDirectoryExists(exportBasePath);

    const stats: ExportStats = {
      exportedComponents: [],
      exportedPages: [],
      exportedThemes: [],
      exportedFunctions: [],
      totalVertices: 0,
      totalEdges: 0,
    };

    // When any query param is set, export only the types that have params set
    const exportComponents = !filterOnly || includeComponentKeys.length > 0;
    const exportPages = !filterOnly || includePageKeys.length > 0;
    const exportFunctions = !filterOnly || includeFunctionKeys.length > 0;

    // ---- COMPONENTS ----
    if (exportComponents) {
      const components = await fetchEntities(dbSession, "Component", {
        ...(includeComponentKeys.length > 0 ? { includeKeys: includeComponentKeys } : {}),
      });
      await exportEntityGroup({
        entities: components,
        basePath: exportBasePath,
        subDomain,
        folderName: "components",
        statsArray: stats.exportedComponents,
        stats,
      });
    }

    // ---- PAGES ----
    if (exportPages) {
      const pages = await fetchEntities(dbSession, "Page", {
        ...(includePageKeys.length > 0 ? { includeKeys: includePageKeys } : {}),
      });
      await exportEntityGroup({
        entities: pages,
        basePath: exportBasePath,
        subDomain,
        folderName: "pages",
        statsArray: stats.exportedPages,
        stats,
      });
    }

    if (!filterOnly) {
      // ---- THEMES ----
      const themes = await fetchEntities(dbSession, "Theme", { skipKeys: ["Default"] });
      await exportEntityGroup({
        entities: themes,
        basePath: exportBasePath,
        subDomain,
        folderName: "themes",
        statsArray: stats.exportedThemes,
        stats,
      });
    }

    // ---- FUNCTIONS ----
    if (exportFunctions) {
      const functions = await fetchEntities(dbSession, "Function", {
        ...(includeFunctionKeys.length > 0 ? { includeKeys: includeFunctionKeys } : {}),
      });
      await exportEntityGroup({
        entities: functions,
        basePath: exportBasePath,
        subDomain,
        folderName: "functions",
        statsArray: stats.exportedFunctions,
        stats,
      });
    }

    // ---- Log activity ----
    const tx = dbSession.beginTransaction();
    try {
      await createActivityLog(
        tx,
        "schema_export",
        "Schema",
        subDomain,
        user.P.email,
        filterOnly
          ? `Exported selected components/pages/functions for subdomain ${subDomain}`
          : `Exported schema types for subdomain ${subDomain}`,
      );
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return {
      success: true,
      message: filterOnly
        ? "Export completed for selected Components, Pages, and/or Functions."
        : "Export completed for Components, Pages, Themes, Functions.",
      exportPath: join(exportBasePath, subDomain),
      details: stats,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
