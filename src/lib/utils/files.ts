/**
 * File Upload Utilities
 *
 * File validation, storage, and management
 */

import * as path from "path";
import * as crypto from "crypto";
import type { Session } from "neo4j-driver";

/**
 * File metadata
 */
export interface FileMetadata {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy?: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

/**
 * File validation options
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

/**
 * File storage options
 */
export interface FileStorageOptions {
  directory?: string;
  generateName?: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Validate file
 */
export function validateFile(
  file: {
    name: string;
    size: number;
    type: string;
  },
  options: FileValidationOptions = {},
): { valid: boolean; error?: string } {
  // Check size
  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size ${fileSizeMB}MB exceeds maximum ${maxSizeMB}MB`,
    };
  }

  // Check MIME type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${options.allowedTypes.join(", ")}`,
    };
  }

  // Check extension
  if (options.allowedExtensions) {
    const ext = path.extname(file.name).toLowerCase();
    if (!options.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} not allowed. Allowed extensions: ${options.allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generate unique file name
 */
export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}_${hash}${ext}`;
}

/**
 * Get file extension
 */
export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Get MIME type from extension
 */
export function getMimeType(filename: string): string {
  const ext = getExtension(filename);
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".json": "application/json",
    ".zip": "application/zip",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / 1024 ** i;

  return `${size.toFixed(2)} ${sizes[i]}`;
}

/**
 * Store file metadata in database
 */
export async function storeFileMetadata(
  session: Session,
  metadata: Omit<FileMetadata, "id" | "uploadedAt">,
): Promise<FileMetadata> {
  const fileMetadata: FileMetadata = {
    id: `file_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`,
    uploadedAt: new Date().toISOString(),
    ...metadata,
  };

  await session.run(
    `CREATE (f:File {
      id: $id,
      originalName: $originalName,
      storedName: $storedName,
      mimeType: $mimeType,
      size: $size,
      path: $path,
      url: $url,
      uploadedBy: $uploadedBy,
      uploadedAt: $uploadedAt,
      metadata: $metadata
    })`,
    {
      id: fileMetadata.id,
      originalName: fileMetadata.originalName,
      storedName: fileMetadata.storedName,
      mimeType: fileMetadata.mimeType,
      size: fileMetadata.size,
      path: fileMetadata.path,
      url: fileMetadata.url || null,
      uploadedBy: fileMetadata.uploadedBy || null,
      uploadedAt: fileMetadata.uploadedAt,
      metadata: fileMetadata.metadata
        ? JSON.stringify(fileMetadata.metadata)
        : null,
    },
  );

  return fileMetadata;
}

/**
 * Get file by ID
 */
export async function getFile(
  session: Session,
  fileId: string,
): Promise<FileMetadata | null> {
  const result = await session.run("MATCH (f:File {id: $id}) RETURN f", {
    id: fileId,
  });

  if (result.records.length === 0) {
    return null;
  }

  const file = result.records[0].get("f").properties;

  return {
    id: file.id,
    originalName: file.originalName,
    storedName: file.storedName,
    mimeType: file.mimeType,
    size: file.size,
    path: file.path,
    url: file.url || undefined,
    uploadedBy: file.uploadedBy || undefined,
    uploadedAt: file.uploadedAt,
    metadata: file.metadata ? JSON.parse(file.metadata) : undefined,
  };
}

/**
 * List files
 */
export async function listFiles(
  session: Session,
  filters: {
    uploadedBy?: string;
    mimeType?: string;
    limit?: number;
  } = {},
): Promise<FileMetadata[]> {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (filters.uploadedBy) {
    conditions.push("f.uploadedBy = $uploadedBy");
    params.uploadedBy = filters.uploadedBy;
  }

  if (filters.mimeType) {
    conditions.push("f.mimeType = $mimeType");
    params.mimeType = filters.mimeType;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limitClause = filters.limit ? `LIMIT ${filters.limit}` : "LIMIT 100";

  const query = `
    MATCH (f:File)
    ${whereClause}
    RETURN f
    ORDER BY f.uploadedAt DESC
    ${limitClause}
  `;

  const result = await session.run(query, params);

  return result.records.map((record) => {
    const file = record.get("f").properties;
    return {
      id: file.id,
      originalName: file.originalName,
      storedName: file.storedName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url || undefined,
      uploadedBy: file.uploadedBy || undefined,
      uploadedAt: file.uploadedAt,
      metadata: file.metadata ? JSON.parse(file.metadata) : undefined,
    };
  });
}

/**
 * Delete file metadata
 */
export async function deleteFileMetadata(
  session: Session,
  fileId: string,
): Promise<void> {
  await session.run("MATCH (f:File {id: $id}) DELETE f", { id: fileId });
}

/**
 * Get file stats
 */
export async function getFileStats(
  session: Session,
  userId?: string,
): Promise<{
  totalFiles: number;
  totalSize: number;
  byMimeType: Record<string, number>;
}> {
  const whereClause = userId ? "WHERE f.uploadedBy = $userId" : "";

  // Get total
  const totalQuery = `
    MATCH (f:File)
    ${whereClause}
    RETURN count(f) as total, sum(f.size) as totalSize
  `;

  const totalResult = await session.run(totalQuery, userId ? { userId } : {});
  const totalFiles = totalResult.records[0]?.get("total").toNumber() || 0;
  const totalSize = totalResult.records[0]?.get("totalSize").toNumber() || 0;

  // Get by MIME type
  const typeQuery = `
    MATCH (f:File)
    ${whereClause}
    RETURN f.mimeType as type, count(f) as count
  `;

  const typeResult = await session.run(typeQuery, userId ? { userId } : {});
  const byMimeType: Record<string, number> = {};

  for (const record of typeResult.records) {
    byMimeType[record.get("type")] = record.get("count").toNumber();
  }

  return {
    totalFiles,
    totalSize,
    byMimeType,
  };
}

/**
 * File utilities factory
 */
export const files = {
  /**
   * Validate file
   */
  validate: validateFile,

  /**
   * Generate file name
   */
  generateName: generateFileName,

  /**
   * Get extension
   */
  getExtension,

  /**
   * Get MIME type
   */
  getMimeType,

  /**
   * Format size
   */
  formatSize: formatFileSize,

  /**
   * Store metadata
   */
  store: storeFileMetadata,

  /**
   * Get file
   */
  get: getFile,

  /**
   * List files
   */
  list: listFiles,

  /**
   * Delete metadata
   */
  delete: deleteFileMetadata,

  /**
   * Get stats
   */
  stats: getFileStats,
};
