import path from "node:path";

import {
  isAllowedVariantName,
  type ImageVariantName,
} from "~/lib/files/imageOptimizationConfig";
import {
  listMediaVariantDiskPaths,
  mediaVariantFileName,
  mediaVariantPath,
  parseMediaVariantsJsonProp,
  relocateMediaVariantPathsForFileMove,
  rewriteMediaVariantPaths,
  resolveMediaVariantDiskPath,
  serializeMediaVariantsJson,
  type MediaVariantPathMap,
} from "~/lib/files/videoVariantPaths";

/** @deprecated Prefer MediaVariantPathMap — kept for image call sites */
export type VariantPathMap = Partial<Record<ImageVariantName, string>> &
  MediaVariantPathMap;

export function variantFileName(
  originalFileName: string,
  variantName: string,
  ext = "webp",
): string {
  return mediaVariantFileName(originalFileName, variantName, ext);
}

export function variantPath(
  originalPath: string,
  variantName: string,
  ext = "webp",
): string {
  return mediaVariantPath(originalPath, variantName, ext);
}

export function parseVariantsJsonProp(raw: unknown): MediaVariantPathMap {
  return parseMediaVariantsJsonProp(raw);
}

export function serializeVariantsJson(variants: MediaVariantPathMap): string {
  return serializeMediaVariantsJson(variants);
}

export function listVariantDiskPaths(
  fileProps: Record<string, unknown> | null | undefined,
): string[] {
  return listMediaVariantDiskPaths(fileProps);
}

export function rewriteVariantPaths(
  variants: MediaVariantPathMap,
  oldDir: string,
  newDir: string,
): MediaVariantPathMap {
  return rewriteMediaVariantPaths(variants, oldDir, newDir);
}

export function relocateVariantPathsForFileMove(
  variants: MediaVariantPathMap,
  newOriginalPath: string,
): MediaVariantPathMap {
  return relocateMediaVariantPathsForFileMove(variants, newOriginalPath);
}

export function resolveVariantDiskPath(
  fileProps: Record<string, unknown> | null | undefined,
  variantName: string,
): string | null {
  // Prefer resolving any safe key present in variantsJson (image + video + poster)
  return resolveMediaVariantDiskPath(fileProps, variantName);
}

export function isImageVariantName(name: string): name is ImageVariantName {
  return isAllowedVariantName(name);
}

export const VARIANT_WIDTH_HINTS: Record<ImageVariantName, number> = {
  thumb: 200,
  small: 500,
  medium: 1000,
  large: 1600,
};

/** Re-export path for callers that need dirname of variants */
export { path };
