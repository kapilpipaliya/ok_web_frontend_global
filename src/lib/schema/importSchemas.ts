import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import {
  deleteVertexChildren,
  replaceVertexProperties,
} from "~/cypher/mutate/page/deletePage";
import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import {
  importGraphStructure,
  type ImportGraphData,
} from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { createAppState } from "~/createAppState";
import type { WebsiteSchemas } from "~/page_schema/loader";
import type { SchemaCategoryPaths } from "~/page_schema/loader";
import type { SchemaParseIssue } from "~/page_schema/loader";
import type { MutationArgs } from "~/cypher/types/MutationArgs";
import { ensureImportedSchemaItemCategory } from "~/lib/schema/ensureSchemaItemCategories";

type GraphType = ReturnType<typeof createAppState>[0];
type SetGraphType = ReturnType<typeof createAppState>[1];

export interface ImportStats {
  importedItems: string[];
  replacedItems: string[];
  totalVertices: number;
  totalEdges: number;
  activatedTheme?: string;
}

interface SchemaImportResult {
  importResult: {
    metaTxnId: number;
    vertexIdMap: Map<string, string>;
    rootVertexIds: string[];
    [key: string]: unknown;
  };
  commitData: MutationArgs | null;
  vertexCount: number;
  edgeCount: number;
  replacedItems: string[];
}

interface PreprocessResult {
  schema: ImportGraphData;
  existingNodeMap: Map<string, string>;
  replacedItems: string[];
}

function getVertexLabel(vertex: { L: string | string[] }): string {
  return Array.isArray(vertex.L) ? vertex.L[0] : vertex.L;
}

/**
 * Find an existing vertex by label and key
 */
export async function findExistingVertex(
  sessionOrTx: Session | Transaction,
  label: "Component" | "Page" | "Theme" | "Function" | "EmailTemplate",
  key: string,
): Promise<string | null> {
  const result = await sessionOrTx.run(
    `
      MATCH (v:${label} {key: $key})
      RETURN elementId(v) as id
      ORDER BY elementId(v)
      LIMIT 1
    `,
    { key },
  );

  if (result.records.length > 0) {
    return result.records[0].get("id");
  }
  return null;
}

/**
 * Preprocess schema to handle existing nodes (root schema items, Roles, Files, etc.)
 */
async function preprocessSchemaForExistingNodes(
  schema: ImportGraphData,
  tx: Transaction,
  rootLabel?: "Component" | "Page" | "Theme" | "Function" | "EmailTemplate",
  rootKey?: string,
): Promise<PreprocessResult> {
  // Convert to arrays if needed
  const vertexesArray = Array.isArray(schema.vertexes)
    ? schema.vertexes
    : Object.values(schema.vertexes);
  const edgesArray = Array.isArray(schema.edges)
    ? schema.edges
    : schema.edges
      ? Object.values(schema.edges)
      : [];

  // If no vertexes, return as is
  if (!vertexesArray || vertexesArray.length === 0) {
    return {
      schema: { vertexes: vertexesArray, edges: edgesArray },
      existingNodeMap: new Map(),
      replacedItems: [],
    };
  }

  // Create a map to track old IDs to existing database IDs
  const existingNodeMap = new Map<string, string>();
  const verticesToRemove = new Set<string>();
  const replacedItems: string[] = [];

  if (rootLabel && rootKey) {
    const existingRootId = await findExistingVertex(tx, rootLabel, rootKey);

    const rootVertex =
      vertexesArray.find(
        (vertex) =>
          getVertexLabel(vertex) === rootLabel && vertex.P?.key === rootKey,
      ) ??
      vertexesArray.find(
        (vertex) => getVertexLabel(vertex) === rootLabel,
      );

    if (existingRootId) {
      console.log(
        `Reusing existing ${rootLabel}: ${rootKey} (${existingRootId})`,
      );

      if (rootVertex) {
        await deleteVertexChildren(tx, existingRootId, rootLabel);
        await replaceVertexProperties(tx, existingRootId, { ...rootVertex.P });
        existingNodeMap.set(rootVertex.id, existingRootId);
        verticesToRemove.add(rootVertex.id);
      } else {
        existingNodeMap.set(`__existing__${rootKey}`, existingRootId);
      }

      replacedItems.push(`${rootLabel}: ${rootKey}`);
    }
  }

  // Process Role vertices
  const roleVertices = vertexesArray.filter((v) => v.L === "Role");
  for (const roleVertex of roleVertices) {
    const roleKey = roleVertex.P.key as string;
    if (!roleKey) continue;

    const existingRoleResult = await tx.run(
      "MATCH (r:Role {key: $key}) RETURN elementId(r) as id",
      { key: roleKey },
    );

    if (existingRoleResult.records.length > 0) {
      const existingRoleId = existingRoleResult.records[0].get("id");
      existingNodeMap.set(roleVertex.id, existingRoleId);
      verticesToRemove.add(roleVertex.id);
      console.log(`Using existing Role: ${roleKey} (${existingRoleId})`);
    }
  }

  // Process File vertices
  const fileVertices = vertexesArray.filter((v) => v.L === "File");
  for (const fileVertex of fileVertices) {
    const fileName = fileVertex.P.fileName as string;
    if (!fileName) continue;

    // Try to find existing file by fileName
    const existingFileResult = await tx.run(
      "MATCH (f:File {fileName: $fileName}) RETURN elementId(f) as id LIMIT 1",
      { fileName },
    );

    if (existingFileResult.records.length > 0) {
      const existingFileId = existingFileResult.records[0].get("id");
      existingNodeMap.set(fileVertex.id, existingFileId);
      verticesToRemove.add(fileVertex.id);
      console.log(`Using existing File: ${fileName} (${existingFileId})`);
    } else {
      // File doesn't exist, it will be created during import
      console.log(`File will be created: ${fileName}`);
    }
  }

  // If no existing nodes found, return original schema
  if (existingNodeMap.size === 0) {
    return {
      schema: { vertexes: vertexesArray, edges: edgesArray },
      existingNodeMap,
      replacedItems,
    };
  }

  // Filter out existing vertices
  const processedVertexes = vertexesArray.filter(
    (v) => !verticesToRemove.has(v.id),
  );

  // Keep edges as is - we'll handle the mapping in importGraphStructure
  console.log(
    `Preprocessed schema: found ${existingNodeMap.size} existing nodes to reuse`,
  );

  return {
    schema: {
      vertexes: processedVertexes,
      edges: edgesArray,
    },
    existingNodeMap,
    replacedItems,
  };
}

/**
 * Load existing nodes into the graph state
 */
async function loadExistingNodesIntoGraph(
  existingNodeMap: Map<string, string>,
  tx: Transaction,
  _graph: GraphType,
  setGraph: SetGraphType,
): Promise<void> {
  const nodeIds = Array.from(existingNodeMap.values());

  if (nodeIds.length === 0) return;

  // Fetch all existing nodes in one query
  const result = await tx.run(
    `
    MATCH (n)
    WHERE elementId(n) IN $nodeIds
    RETURN n
    `,
    { nodeIds },
  );

  // Add existing nodes to the graph state
  for (const record of result.records) {
    const node = record.get("n");
    const vertex = convertNodeToJson(node);

    // Set vertex in graph state
    setGraph("vertexes", vertex.id, vertex);

    console.log(
      `Loaded existing node ${vertex.id} (${vertex.L.join(", ")}) into graph state`,
    );
  }
}

/**
 * Activate a theme by creating GlobalSetting relationship
 */
async function activateTheme(tx: Transaction, themeKey: string): Promise<void> {
  try {
    // First ensure GlobalSetting exists
    await tx.run(`
      MERGE (gs:GlobalSetting {key: 'Default'})
    `);

    // Remove any existing theme relationship
    await tx.run(`
      MATCH (gs:GlobalSetting)-[r:GlobalSettingTheme]->(:Theme)
      DELETE r
    `);

    // Create new theme relationship
    await tx.run(
      `
      MATCH (gs:GlobalSetting {key: 'Default'})
      MATCH (theme:Theme {key: $themeKey})
      MERGE (gs)-[:GlobalSettingTheme]->(theme)
    `,
      { themeKey },
    );
  } catch (error) {
    console.error(`Failed to activate theme ${themeKey}:`, error);
    // Don't throw - this is a nice-to-have feature
  }
}

/**
 * Import a single schema (Component, Page, Theme, Function, or EmailTemplate)
 */
async function importSingleSchema(
  schema: ImportGraphData,
  graph: GraphType,
  setGraph: SetGraphType,
  type: "Component" | "Page" | "Theme" | "Function" | "EmailTemplate",
  key: string,
  tx: Transaction,
): Promise<SchemaImportResult> {
  // Pre-process schema to handle existing nodes (Roles, Files, etc.)
  const { schema: processedSchema, existingNodeMap, replacedItems } =
    await preprocessSchemaForExistingNodes(schema, tx, type, key);

  // Load existing nodes into the graph state
  if (existingNodeMap.size > 0) {
    await loadExistingNodesIntoGraph(existingNodeMap, tx, graph, setGraph);
  }

  // Import the schema into the graph
  const importResult = importGraphStructure(
    processedSchema,
    graph,
    setGraph,
    existingNodeMap,
  );

  // Process the imported graph to create proper structure
  processImportedGraph(importResult, graph, setGraph, type, key);

  // Commit the transaction to get the mutation data
  const commitData = commitTxn(importResult.metaTxnId, graph) ?? null;
  if (!commitData && replacedItems.length === 0) {
    throw new APIError(
      `Failed to prepare data for ${type.toLowerCase()}: ${key}`,
      500,
    );
  }

  // Calculate counts based on whether vertexes/edges are arrays or objects
  const vertexCount = Array.isArray(processedSchema.vertexes)
    ? processedSchema.vertexes.length
    : Object.keys(processedSchema.vertexes || {}).length;

  const edgeCount = Array.isArray(processedSchema.edges)
    ? processedSchema.edges.length
    : Object.keys(processedSchema.edges || {}).length;

  return {
    importResult,
    commitData,
    vertexCount,
    edgeCount,
    replacedItems,
  };
}

function getCategorySegmentsForKey(
  categoryPaths: SchemaCategoryPaths | undefined,
  groupKey: keyof WebsiteSchemas,
  key: string,
): string[] {
  return categoryPaths?.[groupKey]?.[key] ?? [];
}

async function importSchemaGroup(
  websiteSchemas: WebsiteSchemas,
  categoryPaths: SchemaCategoryPaths | undefined,
  groupKey: keyof WebsiteSchemas,
  type: "Component" | "Page" | "Theme" | "Function" | "EmailTemplate",
  graph: GraphType,
  setGraph: SetGraphType,
  tx: Transaction,
  stats: ImportStats,
  onAfterImport?: (key: string) => void,
): Promise<void> {
  const schemas = websiteSchemas[groupKey];
  if (!schemas) return;

  for (const [schemaKey, schema] of Object.entries(schemas)) {
    const result = await importSingleSchema(
      schema,
      graph,
      setGraph,
      type,
      schemaKey,
      tx,
    );

    await persistSchemaImportResult(result, tx);
    await ensureImportedSchemaItemCategory(
      tx,
      type,
      schemaKey,
      getCategorySegmentsForKey(categoryPaths, groupKey, schemaKey),
    );

    stats.importedItems.push(`${type}: ${schemaKey}`);
    stats.replacedItems.push(...result.replacedItems);
    stats.totalVertices += result.vertexCount;
    stats.totalEdges += result.edgeCount;
    onAfterImport?.(schemaKey);
  }
}

async function persistSchemaImportResult(
  result: SchemaImportResult,
  tx: Transaction,
): Promise<void> {
  if (result.commitData) {
    await mutateData(result.commitData, tx);
  }
}

/**
 * Import all schemas (components, pages, themes, functions) within a transaction
 */
export async function importSchemas(
  websiteSchemas: WebsiteSchemas,
  tx: Transaction,
  graph: GraphType,
  setGraph: SetGraphType,
  categoryPaths: SchemaCategoryPaths = {},
): Promise<ImportStats> {
  const stats: ImportStats = {
    importedItems: [],
    replacedItems: [],
    totalVertices: 0,
    totalEdges: 0,
  };

  const importedThemeKeys: string[] = [];

  await importSchemaGroup(
    websiteSchemas,
    categoryPaths,
    "components",
    "Component",
    graph,
    setGraph,
    tx,
    stats,
  );

  await importSchemaGroup(
    websiteSchemas,
    categoryPaths,
    "pages",
    "Page",
    graph,
    setGraph,
    tx,
    stats,
  );

  await importSchemaGroup(
    websiteSchemas,
    categoryPaths,
    "themes",
    "Theme",
    graph,
    setGraph,
    tx,
    stats,
    (themeKey) => {
      importedThemeKeys.push(themeKey);
    },
  );

  await importSchemaGroup(
    websiteSchemas,
    categoryPaths,
    "functions",
    "Function",
    graph,
    setGraph,
    tx,
    stats,
  );

  await importSchemaGroup(
    websiteSchemas,
    categoryPaths,
    "emailTemplates",
    "EmailTemplate",
    graph,
    setGraph,
    tx,
    stats,
  );

  if (importedThemeKeys.length === 1) {
    await activateTheme(tx, importedThemeKeys[0]);
    stats.activatedTheme = importedThemeKeys[0];
    console.log(`Automatically activated theme: ${importedThemeKeys[0]}`);
  }

  return stats;
}

/**
 * Build success response for schema import
 */
export function buildSuccessResponse(
  websiteName: string,
  stats: ImportStats,
  websiteSchemas: WebsiteSchemas,
  parseIssues: SchemaParseIssue[] = [],
) {
  let message = `Successfully imported ${stats.importedItems.length} schemas from website: ${websiteName}`;
  if (stats.replacedItems.length > 0) {
    message += ` (replaced ${stats.replacedItems.length} existing items)`;
  }
  if (stats.activatedTheme) {
    message += `. Theme "${stats.activatedTheme}" was automatically activated.`;
  }
  if (parseIssues.length > 0) {
    message += ` ${parseIssues.length} schema file(s) failed to parse and were skipped.`;
  }

  return {
    success: true,
    message,
    details: {
      website: websiteName,
      importedItems: stats.importedItems,
      replacedItems: stats.replacedItems,
      totalVertices: stats.totalVertices,
      totalEdges: stats.totalEdges,
      components: Object.keys(websiteSchemas.components || {}).length,
      pages: Object.keys(websiteSchemas.pages || {}).length,
      themes: Object.keys(websiteSchemas.themes || {}).length,
      functions: Object.keys(websiteSchemas.functions || {}).length,
      emailTemplates: Object.keys(websiteSchemas.emailTemplates || {}).length,
      activatedTheme: stats.activatedTheme,
      parseErrors: parseIssues,
      parseErrorCount: parseIssues.length,
    },
  };
}

/**
 * Create activity log for schema import
 */
export async function createSchemaImportActivityLog(
  tx: Transaction,
  websiteName: string,
  userEmail: string,
  stats: ImportStats,
): Promise<void> {
  let activityMessage = `Imported ${stats.importedItems.length} schemas from website: ${websiteName}. Replaced ${stats.replacedItems.length} existing items. Total vertices: ${stats.totalVertices}, Total edges: ${stats.totalEdges}`;
  if (stats.activatedTheme) {
    activityMessage += `. Activated theme: ${stats.activatedTheme}`;
  }
  await createActivityLog(
    tx,
    "schema_import",
    "Schema",
    websiteName,
    userEmail,
    activityMessage,
  );
}
