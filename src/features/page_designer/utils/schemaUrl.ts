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
 * Returns the full URL for exporting the given schema keys (opens in new tab).
 */
export function getExportUrl(keys: OpenedSchemaKeys): string {
  const params = buildSchemaQueryParams(keys);
  return `${typeof window !== "undefined" ? window.location.origin : ""}/api/schema/export?${params.toString()}`;
}

/**
 * Returns the full URL for importing the given schema keys (opens in new tab).
 */
export function getImportUrl(keys: OpenedSchemaKeys): string {
  const params = buildSchemaQueryParams(keys);
  return `${typeof window !== "undefined" ? window.location.origin : ""}/api/schema/import?${params.toString()}`;
}
