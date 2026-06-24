import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { parseHjsonPreservingMultiline } from "~/lib/hjson/parseHjsonPreservingMultiline";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

// Node.js modules are marked as external in build config
// They will only be available on the server side
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface WebsiteSchemas {
  components?: Record<string, ExportedSchema>;
  pages?: Record<string, ExportedSchema>;
  themes?: Record<string, ExportedSchema>;
  functions?: Record<string, ExportedSchema>;
  emailTemplates?: Record<string, ExportedSchema>;
}

/** Subfolder path segments between schema type folder and file (e.g. dynamic_page/main_functions). */
export type SchemaCategoryPaths = Partial<
  Record<keyof WebsiteSchemas, Record<string, string[]>>
>;

export interface SchemaParseIssue {
  websiteName: string;
  schemaType: SchemaFolderType;
  fileName: string;
  message: string;
  hint?: string;
}

type AllWebsiteSchemas = Record<string, WebsiteSchemas>;

/** Folder names under each website directory in page_schema */
type SchemaFolderType =
  | "components"
  | "pages"
  | "themes"
  | "functions"
  | "email_templates";

const SCHEMA_FOLDER_TO_WEBSITE_KEY: Record<
  SchemaFolderType,
  keyof WebsiteSchemas
> = {
  components: "components",
  pages: "pages",
  themes: "themes",
  functions: "functions",
  email_templates: "emailTemplates",
};

interface ParsedPath {
  websiteName: string;
  schemaType: SchemaFolderType;
  fileName: string;
  categorySegments: string[];
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
    schemaType !== "functions" &&
    schemaType !== "email_templates"
  )
    return null;

  // Use only the filename for all schema types (no subfolder path)
  // Subfolders are just for organization, not namespacing
  const fileName = parts[parts.length - 1].replace(".hjson", "");
  const categorySegments = parts.length > 4 ? parts.slice(3, -1) : [];

  return {
    websiteName: parts[1],
    schemaType: schemaType as SchemaFolderType,
    fileName: fileName,
    categorySegments,
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

    // Find the root vertex with label "Page", "Component", "Theme", "Function", or "EmailTemplate"
    for (const vertex of rootVertices) {
      const labels = Array.isArray(vertex.L) ? vertex.L : [vertex.L];

      if (
        labels.includes("Page") ||
        labels.includes("Component") ||
        labels.includes("Theme") ||
        labels.includes("Function") ||
        labels.includes("EmailTemplate")
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
  parseIssues?: SchemaParseIssue[],
  categoryPaths?: SchemaCategoryPaths,
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

    const groupKey = SCHEMA_FOLDER_TO_WEBSITE_KEY[parsedPath.schemaType];

    if (categoryPaths && parsedPath.categorySegments.length > 0) {
      if (!categoryPaths[groupKey]) {
        categoryPaths[groupKey] = {};
      }
      categoryPaths[groupKey]![key] = parsedPath.categorySegments;
    }

    // Handle both AllWebsiteSchemas and WebsiteSchemas types
    if (
      "components" in schemas ||
      "pages" in schemas ||
      "themes" in schemas ||
      "functions" in schemas ||
      "emailTemplates" in schemas
    ) {
      // WebsiteSchemas
      const websiteSchemas = schemas as WebsiteSchemas;
      if (!websiteSchemas[groupKey]) {
        websiteSchemas[groupKey] = {};
      }
      websiteSchemas[groupKey]![key] = schema;
    } else {
      // AllWebsiteSchemas
      const allSchemas = schemas as AllWebsiteSchemas;
      if (!allSchemas[parsedPath.websiteName]) {
        allSchemas[parsedPath.websiteName] = {};
      }
      if (!allSchemas[parsedPath.websiteName][groupKey]) {
        allSchemas[parsedPath.websiteName][groupKey] = {};
      }
      allSchemas[parsedPath.websiteName][groupKey]![key] = schema;
    }
  } catch (error) {
    const issue: SchemaParseIssue = {
      websiteName: parsedPath.websiteName,
      schemaType: parsedPath.schemaType,
      fileName: parsedPath.fileName,
      message: error instanceof Error ? error.message : String(error),
      hint:
        typeof (error as { hint?: unknown })?.hint === "string"
          ? String((error as { hint?: string }).hint)
          : undefined,
    };
    parseIssues?.push(issue);
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
  "use server";
  // For localhost in dev, load all websites
  if (subdomain === "admin") {
    return null; // Load all
  }

  // Otherwise use subdomain as website name
  return subdomain;
}

// Cache for website schemas to avoid reloading
const websiteSchemaCache = new Map<string, WebsiteSchemas>();

// Get the base directory for page_schema files
function getSchemaBaseDir(): string {
  const schemaPath = path.join(process.cwd(), "src", "page_schema");

  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      `Could not find page_schema directory at: ${schemaPath}. Current working directory: ${process.cwd()}`,
    );
  }

  return schemaPath;
}

// Load all .hjson files from filesystem recursively
function loadFromFilesystem(): Record<string, string> {
  const schemaBaseDir = getSchemaBaseDir();
  const result: Record<string, string> = {};
  let fileCount = 0;

  function readDir(dir: string, relativePath = ""): void {
    try {
      if (!fs.existsSync(dir)) {
        console.warn(`Directory does not exist: ${dir}`);
        return;
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativePath
          ? path.join(relativePath, entry.name)
          : entry.name;

        if (entry.isDirectory()) {
          // Recursively read subdirectories
          readDir(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith(".hjson")) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            // Convert path to format expected by parseModulePath: "./website/schemaType/.../file.hjson"
            // Use forward slashes for consistency
            const normalizedPath = `./${relPath.replace(/\\/g, "/")}`;
            result[normalizedPath] = content;
            fileCount++;
          } catch (error) {
            console.error(`Failed to read file ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to read directory ${dir}:`, error);
    }
  }

  readDir(schemaBaseDir);
  return result;
}

/**
 * Load schemas for one website under an arbitrary base directory (e.g. temp dir from schema sync).
 * Layout: basePath/websiteName/{components,pages,themes,functions,email_templates}/ (recursive .hjson)
 */
export function loadWebsiteSchemasFromDirectory(
  basePath: string,
  websiteName: string,
): { schemas: WebsiteSchemas; categoryPaths: SchemaCategoryPaths } {
  const schemas: WebsiteSchemas = {
    components: {},
    pages: {},
    themes: {},
    functions: {},
    emailTemplates: {},
  };
  const categoryPaths: SchemaCategoryPaths = {};

  const websiteDir = path.join(basePath, websiteName);
  if (!fs.existsSync(websiteDir)) {
    return { schemas, categoryPaths };
  }

  const modules: Record<string, string> = {};

  function readWebsiteDir(dir: string, relativePath: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath
        ? path.join(relativePath, entry.name)
        : entry.name;
      if (entry.isDirectory()) {
        readWebsiteDir(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith(".hjson")) {
        const normalizedPath = `./${path.join(websiteName, relPath).replace(/\\/g, "/")}`;
        modules[normalizedPath] = fs.readFileSync(fullPath, "utf-8");
      }
    }
  }

  readWebsiteDir(websiteDir, "");

  for (const [filePath, content] of Object.entries(modules)) {
    const parsedPath = parseModulePath(filePath);
    if (!parsedPath || parsedPath.websiteName !== websiteName) continue;

    processSchemaFile(schemas, parsedPath, content, undefined, categoryPaths);
  }

  return { schemas, categoryPaths };
}

// Get specific website schemas synchronously with caching
export function getWebsiteSchemasSync(websiteName: string): WebsiteSchemas {
  return getWebsiteSchemasSyncWithIssues(websiteName).schemas;
}

export function getWebsiteSchemasSyncWithIssues(websiteName: string): {
  schemas: WebsiteSchemas;
  parseIssues: SchemaParseIssue[];
  categoryPaths: SchemaCategoryPaths;
} {
  "use server";
  // Check cache first
  if (websiteSchemaCache.has(websiteName)) {
    return {
      schemas: websiteSchemaCache.get(websiteName)!,
      parseIssues: [],
      categoryPaths: {},
    };
  }

  const schemas: WebsiteSchemas = {
    components: {},
    pages: {},
    themes: {},
    functions: {},
    emailTemplates: {},
  };
  const categoryPaths: SchemaCategoryPaths = {};
  const parseIssues: SchemaParseIssue[] = [];

  // Load all .hjson files from filesystem
  // Pattern matches: ./website/schemaType/**/*.hjson (any depth of nesting)
  const allModules = loadFromFilesystem();

  // Process only modules for this specific website
  for (const [filePath, content] of Object.entries(allModules)) {
    const parsedPath = parseModulePath(filePath);
    if (!parsedPath || parsedPath.websiteName !== websiteName) continue;

    processSchemaFile(schemas, parsedPath, content, parseIssues, categoryPaths);
  }

  // Cache the result for future use
  // websiteSchemaCache.set(websiteName, schemas);

  return { schemas, parseIssues, categoryPaths };
}

// function to get schemas based on subdomain
export function getSchemasForSubdomain(
  subdomain: string,
  domain?: string,
): AllWebsiteSchemas | WebsiteSchemas {
  "use server";
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
  "use server";
  const schemas: AllWebsiteSchemas = {};

  // Load all hjson files from filesystem
  // Pattern matches: ./website/schemaType/**/*.hjson (any depth of nesting)
  const allModules = loadFromFilesystem();

  for (const [filePath, content] of Object.entries(allModules)) {
    const parsedPath = parseModulePath(filePath);
    if (!parsedPath) continue;

    processSchemaFile(schemas, parsedPath, content);
  }

  return schemas;
}
