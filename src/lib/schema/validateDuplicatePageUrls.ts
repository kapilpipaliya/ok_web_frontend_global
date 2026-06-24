import type { Session } from "neo4j-driver";

import { APIError } from "~/lib/api/server/apiErrorHandler";
import type {
  ExportedEdge,
  ExportedSchema,
  ExportedVertex,
} from "~/routes/api/schema/ExportedSchema";

export interface PageUrlEntry {
  key: string;
  url: string;
}

function getRootVertices(schema: ExportedSchema): ExportedVertex[] {
  const vertexesArray = Array.isArray(schema.vertexes)
    ? schema.vertexes
    : (Object.values(schema.vertexes || {}) as ExportedVertex[]);
  const edgesArray = Array.isArray(schema.edges)
    ? schema.edges
    : (Object.values(schema.edges || {}) as ExportedEdge[]);

  const parentMap = new Map<string, boolean>();
  for (const edge of edgesArray) {
    parentMap.set(edge.E, true);
  }

  return vertexesArray.filter((v) => !parentMap.has(v.id));
}

/** Page URL from the root Page vertex in a page schema file, or null if missing. */
export function extractPageUrlFromSchema(
  schema: ExportedSchema,
): string | null {
  for (const vertex of getRootVertices(schema)) {
    const labels = Array.isArray(vertex.L) ? vertex.L : [vertex.L];
    if (!labels.includes("Page")) continue;
    const raw = vertex.P?.url;
    if (raw == null) return null;
    const url = String(raw).trim();
    return url.length > 0 ? url : null;
  }
  return null;
}

export function findDuplicatePageUrls(
  pages: Record<string, ExportedSchema>,
): Array<{ url: string; pageKeys: string[] }> {
  const urlToKeys = new Map<string, string[]>();

  for (const [pageKey, schema] of Object.entries(pages)) {
    const url = extractPageUrlFromSchema(schema);
    if (!url) continue;
    const keys = urlToKeys.get(url) ?? [];
    keys.push(pageKey);
    urlToKeys.set(url, keys);
  }

  return [...urlToKeys.entries()]
    .filter(([, pageKeys]) => pageKeys.length > 1)
    .map(([url, pageKeys]) => ({ url, pageKeys }));
}

/** Throws APIError 400 when two or more page schemas share the same URL. */
export function validateNoDuplicatePageUrls(
  pages: Record<string, ExportedSchema> | undefined,
): void {
  if (!pages || Object.keys(pages).length === 0) return;

  const duplicates = findDuplicatePageUrls(pages);
  if (duplicates.length === 0) return;

  throw new APIError(formatDuplicatePageUrlError("in import", duplicates), 400);
}

export async function getExistingPageUrlsFromDb(
  session: Session,
): Promise<PageUrlEntry[]> {
  const result = await session.run(
    `
      MATCH (p:Page)
      WHERE p.url IS NOT NULL AND trim(toString(p.url)) <> ''
      RETURN p.key AS key, p.url AS url
    `,
  );

  return result.records
    .map((record) => ({
      key: String(record.get("key") ?? "").trim(),
      url: String(record.get("url") ?? "").trim(),
    }))
    .filter((entry) => entry.key.length > 0 && entry.url.length > 0);
}

/**
 * Pages that would remain after import: existing DB pages not replaced by key,
 * plus all pages from the import set.
 */
export function findDuplicatePageUrlsAfterMerge(
  importPages: Record<string, ExportedSchema> | undefined,
  existingPages: PageUrlEntry[],
): Array<{ url: string; pageKeys: string[] }> {
  if (!importPages || Object.keys(importPages).length === 0) {
    return [];
  }

  const importingKeys = new Set(Object.keys(importPages));
  const merged: PageUrlEntry[] = existingPages.filter(
    (page) => !importingKeys.has(page.key),
  );

  for (const [pageKey, schema] of Object.entries(importPages)) {
    const url = extractPageUrlFromSchema(schema);
    if (!url) continue;
    merged.push({ key: pageKey, url });
  }

  const urlToKeys = new Map<string, string[]>();
  for (const { key, url } of merged) {
    const keys = urlToKeys.get(url) ?? [];
    keys.push(key);
    urlToKeys.set(url, keys);
  }

  return [...urlToKeys.entries()]
    .filter(([, pageKeys]) => pageKeys.length > 1)
    .map(([url, pageKeys]) => ({ url, pageKeys }));
}

function formatDuplicatePageUrlError(
  scope: "in import" | "after import",
  duplicates: Array<{ url: string; pageKeys: string[] }>,
): string {
  const details = duplicates
    .map((d) => `URL "${d.url}" is used by pages: ${d.pageKeys.join(", ")}`)
    .join("; ");

  return scope === "in import"
    ? `Duplicate page URLs found: ${details}`
    : `Duplicate page URLs after import: ${details}`;
}

/** Validates import files and post-merge DB state for duplicate page URLs. */
export async function validatePageUrlsForImport(
  session: Session,
  pages: Record<string, ExportedSchema> | undefined,
): Promise<void> {
  validateNoDuplicatePageUrls(pages);

  if (!pages || Object.keys(pages).length === 0) return;

  const existingPages = await getExistingPageUrlsFromDb(session);
  const duplicates = findDuplicatePageUrlsAfterMerge(pages, existingPages);
  if (duplicates.length === 0) return;

  throw new APIError(
    formatDuplicatePageUrlError("after import", duplicates),
    400,
  );
}
