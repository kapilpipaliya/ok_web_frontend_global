import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import { parseHjsonPreservingMultiline } from "~/lib/hjson/parseHjsonPreservingMultiline";

interface SchemaResult {
  vertexes: Vertex[];
  edges: Edge[];
}

interface WebsiteSchemas {
  components?: Record<string, SchemaResult>;
  pages?: Record<string, SchemaResult>;
}

type AllWebsiteSchemas = Record<string, WebsiteSchemas>;

// This function dynamically imports all schemas from website subdirectories
export function loadWebsiteSchemas(): AllWebsiteSchemas {
  const schemas: AllWebsiteSchemas = {};

  // Import all hjson files from website subdirectories
  // The glob pattern matches: page_schema/[websiteName]/[components|pages]/*.hjson
  const hjsonModules = import.meta.glob<string>("./*/*/**.hjson", {
    eager: true,
    query: "?raw",
    import: "default",
  });

  // Process each imported module
  for (const [path, content] of Object.entries(hjsonModules)) {
    // Extract website name, type (components/pages), and filename from path
    // Example path: ./mywebsite/components/Button.hjson
    const parts = path.split("/");
    if (parts.length >= 4) {
      const websiteName = parts[1];
      const schemaType = parts[2]; // 'components' or 'pages'
      const fileName = parts[3].replace(".hjson", "");

      // Initialize website structure if needed
      if (!schemas[websiteName]) {
        schemas[websiteName] = {};
      }

      // Initialize schema type if needed
      if (schemaType === "components" || schemaType === "pages") {
        if (!schemas[websiteName][schemaType]) {
          schemas[websiteName][schemaType] = {};
        }

        // Parse and store the schema
        try {
          schemas[websiteName][schemaType]![fileName] =
            parseHjsonPreservingMultiline(content as string);
        } catch (error) {
          console.error(`Failed to parse schema at ${path}:`, error);
        }
      }
    }
  }

  return schemas;
}

// Export function to get schemas for a specific website
export function getWebsiteSchemas(websiteName: string): WebsiteSchemas {
  const allSchemas = loadWebsiteSchemas();
  return allSchemas[websiteName] || { components: {}, pages: {} };
}

// Export function to get all component schemas across all websites
export function getAllComponentSchemas(): Record<string, SchemaResult> {
  const allSchemas = loadWebsiteSchemas();
  const components: Record<string, SchemaResult> = {};

  for (const [websiteName, schemas] of Object.entries(allSchemas)) {
    if (schemas.components) {
      for (const [componentName, schema] of Object.entries(
        schemas.components,
      )) {
        // Store without website prefix to avoid duplicates
        components[componentName] = schema;
      }
    }
  }

  return components;
}

// Export function to get all page schemas across all websites
export function getAllPageSchemas(): Record<string, SchemaResult> {
  const allSchemas = loadWebsiteSchemas();
  const pages: Record<string, SchemaResult> = {};

  for (const [websiteName, schemas] of Object.entries(allSchemas)) {
    if (schemas.pages) {
      for (const [pageName, schema] of Object.entries(schemas.pages)) {
        // Store without website prefix to avoid duplicates
        pages[pageName] = schema;
      }
    }
  }

  return pages;
}
