import fs from "node:fs";
import fsPromises from "node:fs/promises";

import { listVariantDiskPaths } from "~/lib/files/imageVariantPaths";

async function unlinkQuiet(filePath: string): Promise<void> {
  if (!filePath) return;
  try {
    await fsPromises.access(filePath);
    await fsPromises.unlink(filePath);
  } catch {
    // ignore missing files
  }
}

function unlinkQuietSync(filePath: string): void {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
}

/**
 * Delete original + all known variant files from disk.
 */
export async function deleteFileDiskArtifacts(
  fileProps: Record<string, unknown> | null | undefined,
  options?: { includeOriginal?: boolean },
): Promise<void> {
  const includeOriginal = options?.includeOriginal !== false;
  const paths = listVariantDiskPaths(fileProps);
  if (includeOriginal && fileProps?.filePath) {
    paths.push(String(fileProps.filePath));
  }
  const unique = [...new Set(paths.filter(Boolean))];
  await Promise.all(unique.map((p) => unlinkQuiet(p)));
}

export function deleteFileDiskArtifactsSync(
  fileProps: Record<string, unknown> | null | undefined,
  options?: { includeOriginal?: boolean },
): void {
  const includeOriginal = options?.includeOriginal !== false;
  const paths = listVariantDiskPaths(fileProps);
  if (includeOriginal && fileProps?.filePath) {
    paths.push(String(fileProps.filePath));
  }
  const unique = [...new Set(paths.filter(Boolean))];
  for (const p of unique) {
    unlinkQuietSync(p);
  }
}

/**
 * Delete only variant files (keep original).
 */
export async function deleteVariantDiskArtifacts(
  fileProps: Record<string, unknown> | null | undefined,
): Promise<void> {
  await deleteFileDiskArtifacts(fileProps, { includeOriginal: false });
}
