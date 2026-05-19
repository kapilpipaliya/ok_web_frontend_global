import type { OpenedSchemaKeys } from "./getOpenedComponentAndPageKeys";

/**
 * Builds URLSearchParams for schema export/import from opened keys.
 */
export function buildSchemaQueryParams(keys: OpenedSchemaKeys): URLSearchParams {
  const params = new URLSearchParams();
  if (keys.components.length > 0) params.set("components", keys.components.join(","));
  if (keys.pages.length > 0) params.set("pages", keys.pages.join(","));
  if (keys.functions.length > 0) params.set("functions", keys.functions.join(","));
  return params;
}

/**
 * Opens the admin page that queues an export (same query params as the API are forwarded when you click Start).
 */
export function getExportUrl(keys: OpenedSchemaKeys): string {
  const params = buildSchemaQueryParams(keys);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const q = params.toString();
  return q ? `${base}/admin/SchemaExport?${q}` : `${base}/admin/SchemaExport`;
}

/**
 * Opens the admin page that queues an import.
 */
export function getImportUrl(keys: OpenedSchemaKeys): string {
  const params = buildSchemaQueryParams(keys);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const q = params.toString();
  return q ? `${base}/admin/SchemaImport?${q}` : `${base}/admin/SchemaImport`;
}

export function getSchemaSyncPageUrl(): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/admin/SchemaSync`;
}
