import type { Session, Transaction } from "neo4j-driver";

import fs from "node:fs";
import path from "node:path";

import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";

export const UNCATEGORIZED_DISK_SEGMENT = "_uncategorized";

function sanitizeCypherIdent(value: string, fallback: string): string {
  const cleaned = String(value || "").replace(/[^A-Za-z0-9_]/g, "");
  return cleaned || fallback;
}

export function sanitizeFolderKeySegment(key: string): string {
  const raw = String(key || "").trim();
  if (!raw) return "";
  return raw
    .replace(/[\\/]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\.+/, "")
    .slice(0, 255);
}

export function buildFolderDiskDir(
  subDomain: string,
  keyPath: string[],
): string {
  const segments = (keyPath || [])
    .map(sanitizeFolderKeySegment)
    .filter(Boolean);
  return path.join(getBaseDir(), subDomain, ...segments);
}

export function buildUncategorizedDiskDir(subDomain: string): string {
  return buildFolderDiskDir(subDomain, [UNCATEGORIZED_DISK_SEGMENT]);
}

export function withTrailingSep(dir: string): string {
  if (!dir) return dir;
  return dir.endsWith(path.sep) ? dir : dir + path.sep;
}

/**
 * Walk ParentFolder (or custom edge) from category up to root, return key path root→leaf.
 */
export async function resolveFolderKeyPath(
  session: Session | Transaction,
  categoryId: string,
  options?: {
    categoryLabel?: string;
    toParentEdgeType?: string;
  },
): Promise<string[]> {
  const id = String(categoryId || "").trim();
  if (!id) return [];

  const categoryLabel = sanitizeCypherIdent(
    options?.categoryLabel || "Folder",
    "Folder",
  );
  const toParentEdgeType = sanitizeCypherIdent(
    options?.toParentEdgeType || "ParentFolder",
    "ParentFolder",
  );
  const keys: string[] = [];
  let currentId: string | null = id;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const categoryIdParam: string = currentId;
    const result: Awaited<ReturnType<Session["run"]>> = await session.run(
      `
      MATCH (cat:${categoryLabel})
      WHERE elementId(cat) = $categoryId
      OPTIONAL MATCH (cat)-[:${toParentEdgeType}]->(parent:${categoryLabel})
      RETURN cat.key AS key, elementId(parent) AS parentId
      `,
      { categoryId: categoryIdParam },
    );
    if (result.records.length === 0) break;
    const key = result.records[0].get("key");
    if (key != null && String(key).trim() !== "") {
      keys.push(String(key).trim());
    }
    const parentId: unknown = result.records[0].get("parentId");
    currentId =
      parentId != null && String(parentId).trim() !== ""
        ? String(parentId)
        : null;
  }

  return keys.reverse();
}

export async function resolveUploadFolderKeyPath(
  session: Session | Transaction,
  options: {
    folderId?: string | null;
    folderKeyPath?: string[] | null;
    categoryLabel?: string;
    toParentEdgeType?: string;
  },
): Promise<string[]> {
  if (Array.isArray(options.folderKeyPath) && options.folderKeyPath.length > 0) {
    return options.folderKeyPath
      .map((k) => String(k || "").trim())
      .filter(Boolean);
  }
  const folderId = options.folderId != null ? String(options.folderId).trim() : "";
  if (!folderId) return [];
  return resolveFolderKeyPath(session, folderId, {
    categoryLabel: options.categoryLabel,
    toParentEdgeType: options.toParentEdgeType,
  });
}

export function relocateFileOnDisk(
  currentPath: string,
  targetDir: string,
  preferredFileName?: string,
): string {
  const fileName =
    preferredFileName && String(preferredFileName).trim() !== ""
      ? path.basename(String(preferredFileName).trim())
      : path.basename(currentPath);
  ensureDirectoryExists(targetDir);
  const newPath = path.join(targetDir, fileName);
  if (path.resolve(currentPath) === path.resolve(newPath)) {
    return newPath;
  }
  if (!fs.existsSync(currentPath)) {
    throw new Error(`Source file not found: ${currentPath}`);
  }
  if (fs.existsSync(newPath)) {
    throw new Error(`Target file already exists: ${fileName}`);
  }
  try {
    fs.renameSync(currentPath, newPath);
  } catch {
    fs.copyFileSync(currentPath, newPath);
    fs.unlinkSync(currentPath);
  }
  return newPath;
}

export function relocateDirectoryOnDisk(oldDir: string, newDir: string): void {
  if (path.resolve(oldDir) === path.resolve(newDir)) return;
  ensureDirectoryExists(path.dirname(newDir));
  if (!fs.existsSync(oldDir)) {
    ensureDirectoryExists(newDir);
    return;
  }
  if (fs.existsSync(newDir)) {
    throw new Error(`Target directory already exists: ${newDir}`);
  }
  try {
    fs.renameSync(oldDir, newDir);
  } catch {
    fs.cpSync(oldDir, newDir, { recursive: true });
    fs.rmSync(oldDir, { recursive: true, force: true });
  }
}

export async function updateFilePathsWithPrefix(
  session: Session | Transaction,
  oldDir: string,
  newDir: string,
): Promise<number> {
  const oldPrefix = withTrailingSep(oldDir);
  const newPrefix = withTrailingSep(newDir);
  const result = await session.run(
    `
    MATCH (f:File)
    WHERE f.filePath STARTS WITH $oldPrefix OR f.filePath = $oldDir
    WITH f,
      CASE
        WHEN f.filePath = $oldDir THEN $newDir
        ELSE $newPrefix + substring(f.filePath, size($oldPrefix))
      END AS nextPath
    SET f.filePath = nextPath, f.updatedAt = datetime()
    RETURN count(f) AS updated
    `,
    { oldPrefix, newPrefix, oldDir, newDir },
  );
  const raw = result.records[0]?.get("updated");
  if (raw == null) return 0;
  if (typeof raw === "number") return raw;
  if (typeof raw?.toNumber === "function") return raw.toNumber();
  return Number(raw) || 0;
}

export async function updateFilePathByElementId(
  session: Session | Transaction,
  fileId: string,
  filePath: string,
): Promise<void> {
  await session.run(
    `
    MATCH (f:File)
    WHERE elementId(f) = $fileId
    SET f.filePath = $filePath, f.updatedAt = datetime()
    `,
    { fileId, filePath },
  );
}

export async function loadFileDiskMeta(
  session: Session | Transaction,
  fileId: string,
): Promise<{ filePath: string; fileName: string } | null> {
  const result = await session.run(
    `
    MATCH (f:File)
    WHERE elementId(f) = $fileId
    RETURN f.filePath AS filePath, f.fileName AS fileName
    LIMIT 1
    `,
    { fileId },
  );
  if (result.records.length === 0) return null;
  const filePath = result.records[0].get("filePath");
  const fileName = result.records[0].get("fileName");
  if (filePath == null || String(filePath).trim() === "") return null;
  return {
    filePath: String(filePath),
    fileName:
      fileName != null && String(fileName).trim() !== ""
        ? String(fileName)
        : path.basename(String(filePath)),
  };
}

export async function moveFileVertexToCategoryDir(
  session: Session | Transaction,
  options: {
    fileId: string;
    subDomain: string;
    categoryId?: string | null;
    categoryLabel?: string;
    toParentEdgeType?: string;
    contentLabel?: string;
  },
): Promise<{ moved: boolean; newPath?: string; reason?: string }> {
  const meta = await loadFileDiskMeta(session, options.fileId);
  if (!meta) return { moved: false, reason: "file_not_found" };

  const uncategorizedId = options.contentLabel
    ? `_${options.contentLabel}_uncategorized`
    : null;
  const categoryId =
    options.categoryId != null ? String(options.categoryId).trim() : "";
  const isUncategorized =
    !categoryId ||
    (uncategorizedId != null && categoryId === uncategorizedId);

  let targetDir: string;
  if (isUncategorized) {
    targetDir = buildUncategorizedDiskDir(options.subDomain);
  } else {
    const keyPath = await resolveFolderKeyPath(session, categoryId, {
      categoryLabel: options.categoryLabel || "Folder",
      toParentEdgeType: options.toParentEdgeType || "ParentFolder",
    });
    if (keyPath.length === 0) {
      targetDir = buildUncategorizedDiskDir(options.subDomain);
    } else {
      targetDir = buildFolderDiskDir(options.subDomain, keyPath);
    }
  }

  try {
    const newPath = relocateFileOnDisk(meta.filePath, targetDir, meta.fileName);
    await updateFilePathByElementId(session, options.fileId, newPath);
    return { moved: true, newPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Source file not found")) {
      // Still update intended path if source already gone (e.g. already moved)
      const intended = path.join(targetDir, meta.fileName);
      if (path.resolve(meta.filePath) !== path.resolve(intended)) {
        ensureDirectoryExists(targetDir);
        await updateFilePathByElementId(session, options.fileId, intended);
        return { moved: false, newPath: intended, reason: "source_missing" };
      }
    }
    throw error;
  }
}
