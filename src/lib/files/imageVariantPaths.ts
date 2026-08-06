import path from "node:path";

import {
  isAllowedVariantName,
  type ImageVariantName,
} from "~/lib/files/imageOptimizationConfig";

export type VariantPathMap = Partial<Record<ImageVariantName, string>>;

export function variantFileName(
  originalFileName: string,
  variantName: ImageVariantName,
  ext = "webp",
): string {
  const base = path.parse(originalFileName).name;
  return `${base}_${variantName}.${ext}`;
}

export function variantPath(
  originalPath: string,
  variantName: ImageVariantName,
  ext = "webp",
): string {
  const dir = path.dirname(originalPath);
  const baseName = path.basename(originalPath);
  return path.join(dir, variantFileName(baseName, variantName, ext));
}

export function parseVariantsJsonProp(raw: unknown): VariantPathMap {
  if (raw == null) return {};
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  const out: VariantPathMap = {};
  for (const [key, value] of Object.entries(
    parsed as Record<string, unknown>,
  )) {
    if (!isAllowedVariantName(key)) continue;
    if (value == null || String(value).trim() === "") continue;
    const diskPath = String(value).trim();
    if (diskPath.includes("..") || diskPath.includes("\0")) continue;
    out[key] = diskPath;
  }
  return out;
}

export function serializeVariantsJson(variants: VariantPathMap): string {
  return JSON.stringify(variants || {});
}

export function listVariantDiskPaths(
  fileProps: Record<string, unknown> | null | undefined,
): string[] {
  const map = parseVariantsJsonProp(fileProps?.variantsJson);
  return Object.values(map).filter(
    (p): p is string => typeof p === "string" && p.trim() !== "",
  );
}

export function rewriteVariantPaths(
  variants: VariantPathMap,
  oldDir: string,
  newDir: string,
): VariantPathMap {
  const out: VariantPathMap = {};
  const oldResolved = path.resolve(oldDir);
  const newResolved = path.resolve(newDir);
  for (const [name, diskPath] of Object.entries(variants)) {
    if (!isAllowedVariantName(name) || !diskPath) continue;
    const resolved = path.resolve(diskPath);
    if (resolved === oldResolved || resolved.startsWith(oldResolved + path.sep)) {
      const relative = path.relative(oldResolved, resolved);
      out[name] = path.join(newResolved, relative);
    } else if (path.dirname(resolved) === oldResolved) {
      out[name] = path.join(newResolved, path.basename(resolved));
    } else {
      out[name] = path.join(newResolved, path.basename(resolved));
    }
  }
  return out;
}

export function relocateVariantPathsForFileMove(
  variants: VariantPathMap,
  newOriginalPath: string,
): VariantPathMap {
  const out: VariantPathMap = {};
  const newDir = path.dirname(newOriginalPath);
  const originalBase = path.basename(newOriginalPath);
  for (const [name, diskPath] of Object.entries(variants)) {
    if (!isAllowedVariantName(name) || !diskPath) continue;
    const ext = path.extname(diskPath).replace(/^\./, "") || "webp";
    out[name] = path.join(newDir, variantFileName(originalBase, name, ext));
  }
  return out;
}

export function resolveVariantDiskPath(
  fileProps: Record<string, unknown> | null | undefined,
  variantName: string,
): string | null {
  if (!isAllowedVariantName(variantName)) return null;
  const map = parseVariantsJsonProp(fileProps?.variantsJson);
  const diskPath = map[variantName];
  if (!diskPath) return null;
  const originalPath =
    fileProps?.filePath != null ? String(fileProps.filePath) : "";
  if (originalPath) {
    const expectedDir = path.resolve(path.dirname(originalPath));
    const resolved = path.resolve(diskPath);
    if (
      resolved !== expectedDir &&
      !resolved.startsWith(expectedDir + path.sep)
    ) {
      return null;
    }
  }
  return diskPath;
}

export const VARIANT_WIDTH_HINTS: Record<ImageVariantName, number> = {
  thumb: 200,
  small: 500,
  medium: 1000,
  large: 1600,
};
