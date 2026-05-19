import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { deleteVertex } from "~/cypher/mutate/page/deletePage";
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
import type { MutationArgs } from "~/cypher/types/MutationArgs";

type GraphType = ReturnType<typeof createAppState>[0];
type SetGraphType = ReturnType<typeof createAppState>[1];

export interface ImportStats {
  importedItems: string[];
  deletedItems: string[];
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
  commitData: MutationArgs;
  vertexCount: number;
  edgeCount: number;
}

interface PreprocessResult {
  schema: ImportGraphData;
  existingNodeMap: Map<string, string>;
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
    `,
    { key },
  );

  if (result.records.length > 0) {
    return result.records[0].get("id");
  }
  return null;
}

/**
 * Delete existing items (components, pages, themes, functions) before import
 */
export async function deleteExistingItems(
  sessionOrTx: Session | Transaction,
  websiteSchemas: WebsiteSchemas,
  user: Vertex,
): Promise<string[]> {
  const deletedItems: string[] = [];

  // Delete existing components
  if (websiteSchemas.components) {
    for (const componentKey of Object.keys(websiteSchemas.components)) {
      const existingComponentId = await findExistingVertex(
        sessionOrTx,
        "Component",
        componentKey,
      );

      if (existingComponentId) {
        console.log(`Deleting existing component: ${componentKey}`);
        await deleteVertex(sessionOrTx, existingComponentId, user);
        deletedItems.push(`Component: ${componentKey}`);
      }
    }
  }

  // Delete existing pages
  if (websiteSchemas.pages) {
    for (const pageKey of Object.keys(websiteSchemas.pages)) {
      const existingPageId = await findExistingVertex(
        sessionOrTx,
        "Page",
        pageKey,
      );

      if (existingPageId) {
        console.log(`Deleting existing page: ${pageKey}`);
        await deleteVertex(sessionOrTx, existingPageId, user);
        deletedItems.push(`Page: ${pageKey}`);
      }
    }
  }

  // Delete existing themes
  if (websiteSchemas.themes) {
    for (const themeKey of Object.keys(websiteSchemas.themes)) {
      const existingThemeId = await findExistingVertex(
        sessionOrTx,
        "Theme",
        themeKey,
      );

      if (existingThemeId) {
        console.log(`Deleting existing theme: ${themeKey}`);
        await deleteVertex(sessionOrTx, existingThemeId, user);
        deletedItems.push(`Theme: ${themeKey}`);
      }
    }
  }

  // Delete existing functions
  if (websiteSchemas.functions) {
    for (const functionKey of Object.keys(websiteSchemas.functions)) {
      const existingFunctionId = await findExistingVertex(
        sessionOrTx,
        "Function",
        functionKey,
      );

      if (existingFunctionId) {
        console.log(`Deleting existing function: ${functionKey}`);
        await deleteVertex(sessionOrTx, existingFunctionId, user);
        deletedItems.push(`Function: ${functionKey}`);
      }
    }
  }

  // Delete existing email templates
  if (websiteSchemas.emailTemplates) {
    for (const templateKey of Object.keys(websiteSchemas.emailTemplates)) {
      const existingId = await findExistingVertex(
        sessionOrTx,
        "EmailTemplate",
        templateKey,
      );

      if (existingId) {
        console.log(`Deleting existing email template: ${templateKey}`);
        await deleteVertex(sessionOrTx, existingId, user);
        deletedItems.push(`EmailTemplate: ${templateKey}`);
      }
    }
  }

  return deletedItems;
}

/**
 * Preprocess schema to handle existing nodes (Roles, Files, etc.)
 */
async function preprocessSchemaForExistingNodes(
  schema: ImportGraphData,
  tx: Transaction,
): Promise<PreprocessResult> {
  // This function handles existing nodes like Roles and Files
  // - Roles: Always use existing roles by key
  // - Files: Use existing files by fileName if they exist, otherwise create new ones
  // - AttrSrc relationships: Will automatically connect to the correct File nodes

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
    };
  }

  // Create a map to track old IDs to existing database IDs
  const existingNodeMap = new Map<string, string>();
  const verticesToRemove = new Set<string>();

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
  const { schema: processedSchema, existingNodeMap } =
    await preprocessSchemaForExistingNodes(schema, tx);

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
  const commitData = commitTxn(importResult.metaTxnId, graph);
  if (!commitData) {
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
    commitData,
    vertexCount,
    edgeCount,
  };
}

/**
 * Import all schemas (components, pages, themes, functions) within a transaction
 */
export async function importSchemas(
  websiteSchemas: WebsiteSchemas,
  tx: Transaction,
  graph: GraphType,
  setGraph: SetGraphType,
): Promise<ImportStats> {
  const stats: ImportStats = {
    importedItems: [],
    deletedItems: [],
    totalVertices: 0,
    totalEdges: 0,
  };

  // Keep track of imported theme keys for auto-activation
  const importedThemeKeys: string[] = [];

  // Process components
  if (websiteSchemas.components) {
    for (const [componentKey, schema] of Object.entries(
      websiteSchemas.components,
    )) {
      const result = await importSingleSchema(
        schema,
        graph,
        setGraph,
        "Component",
        componentKey,
        tx,
      );

      // Save to database
      await mutateData(result.commitData, tx);

      stats.importedItems.push(`Component: ${componentKey}`);
      stats.totalVertices += result.vertexCount;
      stats.totalEdges += result.edgeCount;
    }
  }

  // Process pages
  if (websiteSchemas.pages) {
    for (const [pageKey, schema] of Object.entries(websiteSchemas.pages)) {
      const result = await importSingleSchema(
        schema,
        graph,
        setGraph,
        "Page",
        pageKey,
        tx,
      );

      // Save to database
      await mutateData(result.commitData, tx);

      stats.importedItems.push(`Page: ${pageKey}`);
      stats.totalVertices += result.vertexCount;
      stats.totalEdges += result.edgeCount;
    }
  }

  // Process themes
  if (websiteSchemas.themes) {
    for (const [themeKey, schema] of Object.entries(websiteSchemas.themes)) {
      const result = await importSingleSchema(
        schema,
        graph,
        setGraph,
        "Theme",
        themeKey,
        tx,
      );

      // Save to database
      await mutateData(result.commitData, tx);

      stats.importedItems.push(`Theme: ${themeKey}`);
      stats.totalVertices += result.vertexCount;
      stats.totalEdges += result.edgeCount;
      importedThemeKeys.push(themeKey);
    }
  }

  // Process functions
  if (websiteSchemas.functions) {
    for (const [functionKey, schema] of Object.entries(
      websiteSchemas.functions,
    )) {
      const result = await importSingleSchema(
        schema,
        graph,
        setGraph,
        "Function",
        functionKey,
        tx,
      );

      // Save to database
      await mutateData(result.commitData, tx);

      stats.importedItems.push(`Function: ${functionKey}`);
      stats.totalVertices += result.vertexCount;
      stats.totalEdges += result.edgeCount;
    }
  }

  // Process email templates
  if (websiteSchemas.emailTemplates) {
    for (const [templateKey, schema] of Object.entries(
      websiteSchemas.emailTemplates,
    )) {
      const result = await importSingleSchema(
        schema,
        graph,
        setGraph,
        "EmailTemplate",
        templateKey,
        tx,
      );

      await mutateData(result.commitData, tx);

      stats.importedItems.push(`EmailTemplate: ${templateKey}`);
      stats.totalVertices += result.vertexCount;
      stats.totalEdges += result.edgeCount;
    }
  }

  // If only one theme was imported, activate it automatically
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
  deletedItems: string[],
  websiteSchemas: WebsiteSchemas,
) {
  let message = `Successfully imported ${stats.importedItems.length} schemas from website: ${websiteName}`;
  if (deletedItems.length > 0) {
    message += ` (deleted ${deletedItems.length} existing items)`;
  }
  if (stats.activatedTheme) {
    message += `. Theme "${stats.activatedTheme}" was automatically activated.`;
  }

  return {
    success: true,
    message,
    details: {
      website: websiteName,
      importedItems: stats.importedItems,
      deletedItems,
      totalVertices: stats.totalVertices,
      totalEdges: stats.totalEdges,
      components: Object.keys(websiteSchemas.components || {}).length,
      pages: Object.keys(websiteSchemas.pages || {}).length,
      themes: Object.keys(websiteSchemas.themes || {}).length,
      functions: Object.keys(websiteSchemas.functions || {}).length,
      emailTemplates: Object.keys(websiteSchemas.emailTemplates || {}).length,
      activatedTheme: stats.activatedTheme,
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
  deletedItems: string[],
): Promise<void> {
  let activityMessage = `Imported ${stats.importedItems.length} schemas from website: ${websiteName}. Deleted ${deletedItems.length} existing items. Total vertices: ${stats.totalVertices}, Total edges: ${stats.totalEdges}`;
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
