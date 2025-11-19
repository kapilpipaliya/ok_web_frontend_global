import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { parseHjsonPreservingMultiline } from "~/lib/hjson/parseHjsonPreservingMultiline";
import { Vertex } from "~/lib/graph/type/vertex";
import { Edge } from "~/lib/graph/type/edge";

export interface WebsiteSchemas {
  components?: Record<string, ExportedSchema>;
  pages?: Record<string, ExportedSchema>;
  themes?: Record<string, ExportedSchema>;
  functions?: Record<string, ExportedSchema>;
}

type AllWebsiteSchemas = Record<string, WebsiteSchemas>;
type SchemaType = "components" | "pages" | "themes" | "functions";

interface ParsedPath {
  websiteName: string;
  schemaType: SchemaType;
  fileName: string;
}

// Helper function to parse module paths
function parseModulePath(path: string): ParsedPath | null {
  const parts = path.split("/");
  if (parts.length < 4) return null;

  const schemaType = parts[2];
  if (
    schemaType !== "components" &&
    schemaType !== "pages" &&
    schemaType !== "themes" &&
    schemaType !== "functions"
  )
    return null;

  // Use only the filename for all schema types (no subfolder path)
  // Subfolders are just for organization, not namespacing
  const fileName = parts[parts.length - 1].replace(".hjson", "");

  return {
    websiteName: parts[1],
    schemaType: schemaType as SchemaType,
    fileName: fileName,
  };
}

// Helper to extract the key from schema content
// Uses the same logic as importGraphStructure and preprocessSchemaForExistingNodes
function extractKeyFromSchema(schema: ExportedSchema): string | null {
  try {
    // Convert to arrays if needed
    const vertexesArray = Array.isArray(schema.vertexes)
      ? (schema.vertexes as Vertex[])
      : (Object.values(schema.vertexes || {}) as Vertex[]);
    const edgesArray = Array.isArray(schema.edges)
      ? (schema.edges as Edge[])
      : (Object.values(schema.edges || {}) as Edge[]);

    // Find root vertices (those with no incoming edges) - same logic as importGraphStructure
    const parentMap = new Map<string, boolean>();

    for (const edge of edgesArray) {
      parentMap.set(edge.E, true);
    }

    const rootVertices = vertexesArray.filter((v) => !parentMap.has(v.id));

    // Find the root vertex with label "Page", "Component", "Theme", or "Function"
    for (const vertex of rootVertices) {
      const labels = Array.isArray(vertex.L) ? vertex.L : [vertex.L];

      if (
        labels.includes("Page") ||
        labels.includes("Component") ||
        labels.includes("Theme") ||
        labels.includes("Function")
      ) {
        if (vertex.P && vertex.P.key) {
          return vertex.P.key as string;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to extract key from schema:", error);
    return null;
  }
}

// Helper to process a single schema file
function processSchemaFile(
  schemas: AllWebsiteSchemas | WebsiteSchemas,
  parsedPath: ParsedPath,
  content: string,
): void {
  try {
    const schema = parseHjsonPreservingMultiline(content);

    // Extract the actual key from the schema content
    const schemaKey = extractKeyFromSchema(schema);
    if (!schemaKey) {
      console.warn(
        `Schema at ${parsedPath.websiteName}/${parsedPath.schemaType}/${parsedPath.fileName} does not have a valid key property. Falling back to filename.`,
      );
    }

    // Use the extracted key or fall back to fileName
    const key = schemaKey || parsedPath.fileName;

    // Handle both AllWebsiteSchemas and WebsiteSchemas types
    if (
      "components" in schemas ||
      "pages" in schemas ||
      "themes" in schemas ||
      "functions" in schemas
    ) {
      // WebsiteSchemas
      const websiteSchemas = schemas as WebsiteSchemas;
      if (!websiteSchemas[parsedPath.schemaType]) {
        websiteSchemas[parsedPath.schemaType] = {};
      }
      websiteSchemas[parsedPath.schemaType]![key] = schema;
    } else {
      // AllWebsiteSchemas
      const allSchemas = schemas as AllWebsiteSchemas;
      if (!allSchemas[parsedPath.websiteName]) {
        allSchemas[parsedPath.websiteName] = {};
      }
      if (!allSchemas[parsedPath.websiteName][parsedPath.schemaType]) {
        allSchemas[parsedPath.websiteName][parsedPath.schemaType] = {};
      }
      allSchemas[parsedPath.websiteName][parsedPath.schemaType]![key] = schema;
    }
  } catch (error) {
    console.error(
      `Failed to parse schema at ${parsedPath.websiteName}/${parsedPath.schemaType}/${parsedPath.fileName}:`,
      error,
    );
  }
}

// Function to determine which website schemas to load
export function getWebsiteNameForSubdomain(
  subdomain: string,
  domain?: string,
): string | null {
  // For localhost in dev, load all websites
  if (subdomain === "admin") {
    return null; // Load all
  }

  // Otherwise use subdomain as website name
  return subdomain;
}

// Cache for website schemas to avoid reloading
const websiteSchemaCache = new Map<string, WebsiteSchemas>();

// Get specific website schemas synchronously with caching
export function getWebsiteSchemasSync(websiteName: string): WebsiteSchemas {
  // Check cache first
  if (websiteSchemaCache.has(websiteName)) {
    return websiteSchemaCache.get(websiteName)!;
  }

  const schemas: WebsiteSchemas = {
    components: {},
    pages: {},
    themes: {},
    functions: {},
  };

  // We have to use the general pattern, but we'll filter efficiently
  // Use explicit default import for better compatibility
  // Pattern matches: ./website/schemaType/**/*.hjson (any depth of nesting)
  const allModules = import.meta.glob("./*//**/*.hjson", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  // Process only modules for this specific website
  for (const [path, content] of Object.entries(allModules)) {
    const parsedPath = parseModulePath(path);
    if (!parsedPath || parsedPath.websiteName !== websiteName) continue;

    processSchemaFile(schemas, parsedPath, content);
  }

  // Cache the result for future use
  // websiteSchemaCache.set(websiteName, schemas);

  return schemas;
}

// function to get schemas based on subdomain
export function getSchemasForSubdomain(
  subdomain: string,
  domain?: string,
): AllWebsiteSchemas | WebsiteSchemas {
  const websiteName = getWebsiteNameForSubdomain(subdomain, domain);

  if (websiteName === null) {
    // Return all schemas - need to load them all
    return loadAllWebsiteSchemasSync();
  }
  // Return only specific website schemas
  return getWebsiteSchemasSync(websiteName);
}

// Load all website schemas synchronously (used when we need all schemas)
function loadAllWebsiteSchemasSync(): AllWebsiteSchemas {
  const schemas: AllWebsiteSchemas = {};

  // Import all hjson files synchronously
  // Use explicit default import for better compatibility
  // Pattern matches: ./website/schemaType/**/*.hjson (any depth of nesting)
  const eagerModules = import.meta.glob("./*//**/*.hjson", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  for (const [path, content] of Object.entries(eagerModules)) {
    const parsedPath = parseModulePath(path);
    if (!parsedPath) continue;

    processSchemaFile(schemas, parsedPath, content);
  }

  return schemas;
}
