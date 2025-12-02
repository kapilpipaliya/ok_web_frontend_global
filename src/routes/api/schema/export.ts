import type { APIEvent } from "@solidjs/start/server";
import { join } from "path";
import type {Node, Session} from "neo4j-driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { fetchFormMetaData } from "~/pages/functions/fetchFormMetaData";
import type { ExportedSchema } from "./ExportedSchema";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

import { validateUserAndPermissions } from "~/routes/api/schema/export/validation/validateUserAndPermissions";
import {ExportType, writeSchemaToFile} from "./export/utils/writeSchemaToFile";
import {convertNodeToJson} from "~/cypher/conversion/convertNodeToJson";

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
  skipKeys: string[] = []
): Promise<Record<string, ExportedSchema>> {
  const result = await dbSession.run(`
    MATCH (entity:${entityType})
    WHERE NOT entity.key IN $skipKeys
    RETURN entity
    ORDER BY entity.key
  `,
    { skipKeys }
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
                                   stats
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

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

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

    // ---- COMPONENTS ----
    const components = await fetchEntities(dbSession, "Component");
    await exportEntityGroup({
      entities: components,
      basePath: exportBasePath,
      subDomain,
      folderName: "components",
      statsArray: stats.exportedComponents,
      stats
    });

    // ---- PAGES ----
    const pages = await fetchEntities(dbSession, "Page");
    await exportEntityGroup({
      entities: pages,
      basePath: exportBasePath,
      subDomain,
      folderName: "pages",
      statsArray: stats.exportedPages,
      stats
    });

    // ---- THEMES ----
    const themes = await fetchEntities(dbSession, "Theme", ["Default"]);
    await exportEntityGroup({
      entities: themes,
      basePath: exportBasePath,
      subDomain,
      folderName: "themes",
      statsArray: stats.exportedThemes,
      stats
    });

    // ---- FUNCTIONS ----
    const functions = await fetchEntities(dbSession, "Function");
    await exportEntityGroup({
      entities: functions,
      basePath: exportBasePath,
      subDomain,
      folderName: "functions",
      statsArray: stats.exportedFunctions,
      stats
    });

    // ---- Log activity ----
    const tx = dbSession.beginTransaction();
    try {
      await createActivityLog(
        tx,
        "schema_export",
        "Schema",
        subDomain,
        user.P.email,
        `Exported schema types for subdomain ${subDomain}`
      );
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return {
      success: true,
      message: "Export completed for Components, Pages, Themes, Functions.",
      exportPath: join(exportBasePath, subDomain),
      details: stats
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
