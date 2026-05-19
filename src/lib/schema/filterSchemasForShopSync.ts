import type { WebsiteSchemas } from "~/page_schema/loader";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import type { Vertex } from "~/lib/graph/type/vertex";

export function isPublicSchemaProperty(value: unknown): boolean {
  return value === true || value === "true";
}

export function getPageRootVertex(
  schema: ExportedSchema,
): Vertex | undefined {
  return schema.vertexes.find((v) => {
    const label = Array.isArray(v.L) ? v.L[0] : v.L;
    return label === "Page";
  });
}

export function isPublicPageSchema(schema: ExportedSchema): boolean {
  const root = getPageRootVertex(schema);
  if (!root) {
    return false;
  }
  return isPublicSchemaProperty(root.P?.public);
}

/** Omit pages marked `public: true` — they stay on the app DB only. */
export function filterWebsiteSchemasForShopSync(
  schemas: WebsiteSchemas,
): WebsiteSchemas {
  if (!schemas.pages) {
    return schemas;
  }

  const pages = Object.fromEntries(
    Object.entries(schemas.pages).filter(
      ([, schema]) => !isPublicPageSchema(schema),
    ),
  );

  return { ...schemas, pages };
}
