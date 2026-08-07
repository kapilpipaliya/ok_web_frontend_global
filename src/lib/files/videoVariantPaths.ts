import path from "node:path";

import { isSafeMediaVariantKey } from "~/lib/files/videoOptimizationConfig";

/** Generic path map for image + video + poster variants. */
export type MediaVariantPathMap = Record<string, string>;

export function mediaVariantFileName(
  originalFileName: string,
  variantName: string,
  ext: string,
): string {
  const base = path.parse(originalFileName).name;
  return `${base}_${variantName}.${ext}`;
}

export function mediaVariantPath(
  originalPath: string,
  variantName: string,
  ext: string,
): string {
  const dir = path.dirname(originalPath);
  const baseName = path.basename(originalPath);
  return path.join(dir, mediaVariantFileName(baseName, variantName, ext));
}

export function parseMediaVariantsJsonProp(raw: unknown): MediaVariantPathMap {
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
  const out: MediaVariantPathMap = {};
  for (const [key, value] of Object.entries(
    parsed as Record<string, unknown>,
  )) {
    if (!isSafeMediaVariantKey(key)) continue;
    if (value == null || String(value).trim() === "") continue;
    const diskPath = String(value).trim();
    if (diskPath.includes("..") || diskPath.includes("\0")) continue;
    out[key] = diskPath;
  }
  return out;
}

export function serializeMediaVariantsJson(
  variants: MediaVariantPathMap,
): string {
  return JSON.stringify(variants || {});
}

export function listMediaVariantDiskPaths(
  fileProps: Record<string, unknown> | null | undefined,
): string[] {
  const map = parseMediaVariantsJsonProp(fileProps?.variantsJson);
  return Object.values(map).filter(
    (p): p is string => typeof p === "string" && p.trim() !== "",
  );
}

export function rewriteMediaVariantPaths(
  variants: MediaVariantPathMap,
  oldDir: string,
  newDir: string,
): MediaVariantPathMap {
  const out: MediaVariantPathMap = {};
  const oldResolved = path.resolve(oldDir);
  const newResolved = path.resolve(newDir);
  for (const [name, diskPath] of Object.entries(variants)) {
    if (!(isSafeMediaVariantKey(name) && diskPath)) continue;
    const resolved = path.resolve(diskPath);
    if (
      resolved === oldResolved ||
      resolved.startsWith(oldResolved + path.sep)
    ) {
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

export function relocateMediaVariantPathsForFileMove(
  variants: MediaVariantPathMap,
  newOriginalPath: string,
): MediaVariantPathMap {
  const out: MediaVariantPathMap = {};
  const newDir = path.dirname(newOriginalPath);
  const originalBase = path.basename(newOriginalPath);
  for (const [name, diskPath] of Object.entries(variants)) {
    if (!(isSafeMediaVariantKey(name) && diskPath)) continue;
    const ext = path.extname(diskPath).replace(/^\./, "") || "bin";
    out[name] = path.join(
      newDir,
      mediaVariantFileName(originalBase, name, ext),
    );
  }
  return out;
}

export function resolveMediaVariantDiskPath(
  fileProps: Record<string, unknown> | null | undefined,
  variantName: string,
): string | null {
  if (!isSafeMediaVariantKey(variantName)) return null;
  const map = parseMediaVariantsJsonProp(fileProps?.variantsJson);
  const diskPath = map[variantName];
  if (!diskPath) return null;
  const originalPath =
    fileProps?.filePath == null ? "" : String(fileProps.filePath);
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
