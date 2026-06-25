/**
 * Database Backup Creation Module
 * Creates complete Neo4j database backups, compresses them, and uploads to cloud storage
 */

import fs from "fs";
import { promisify } from "util";
import path from "path";
import zlib from "zlib";
import { pipeline } from "stream";
import type { Session } from "neo4j-driver";
import { uploadBackupToCloud } from "./uploadBackupToCloud";
import { getDriver } from "~/cypher/core/driver";

const pipelineAsync = promisify(pipeline);

export interface CreateBackupOptions {
  databaseName: string;
  backupType?: "hourly" | "daily" | "weekly" | "monthly" | "manual";
  jobId?: string;
  session?: Session;
}

export interface BackupResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    databaseName: string;
    filename: string;
    size: string;
    originalSize: string;
    compressionRatio: string;
    backupMethod: string;
    uploadedAt: string;
    duration: string;
    cloudUrl?: string;
  };
}

/**
 * Creates a complete backup of a Neo4j database
 */
export async function createDatabaseBackup(
  options: CreateBackupOptions,
): Promise<BackupResult> {
  const { databaseName, backupType = "hourly", jobId } = options;

  if (!databaseName) {
    return {
      success: false,
      error: "Database name is required",
    };
  }

  // Create our own session for the specific database
  const driver = await getDriver();
  const session = driver.session({ database: databaseName });

  const startTime = Date.now();

  // Create backup directory if it doesn't exist
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Generate backup filename with timestamp
  const timestamp =
    new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
    "-" +
    new Date().toISOString().split("T")[1].substring(0, 6).replace(/:/g, "");
  const backupFilename = `${databaseName}-${timestamp}-${backupType}.dump`;
  const compressedFilename = `${backupFilename}.gz`;
  const backupPath = path.join(backupDir, backupFilename);
  const compressedPath = path.join(backupDir, compressedFilename);

  try {
    console.log(`[Backup] Starting backup for database: ${databaseName}`);
    console.log(`[Backup] Using APOC export for ${databaseName}`);

    const backupMethod = "apoc";

    // Use APOC export with just the filename (not full path)
    // Neo4j will write to its configured import/export directory
    await session.run(
      `
      CALL apoc.export.cypher.all($filename, {
        format: 'cypher-shell',
        useOptimizations: { type: 'UNWIND_BATCH', unwindBatchSize: 20 }
      })
      `,
      { filename: backupFilename },
    );

    console.log(`[Backup] APOC export completed for ${databaseName}`);

    // APOC writes to Neo4j's import directory, we need to find and copy the file
    const neo4jImportDir =
      process.env.NEO4J_IMPORT_DIR || "/var/lib/neo4j/import";
    const apocExportPath = path.join(neo4jImportDir, backupFilename);

    console.log(`[Backup] Looking for APOC export file at: ${apocExportPath}`);

    // Check if file exists in Neo4j import directory
    if (!fs.existsSync(apocExportPath)) {
      throw new Error(
        `APOC export file not found at ${apocExportPath}. Check Neo4j import directory configuration.`,
      );
    }

    // Copy the file from Neo4j import directory to our backup directory
    fs.copyFileSync(apocExportPath, backupPath);
    console.log(`[Backup] Copied backup file to: ${backupPath}`);

    // Delete the file from Neo4j import directory
    fs.unlinkSync(apocExportPath);
    console.log(
      "[Backup] Cleaned up APOC export file from Neo4j import directory",
    );

    // Get backup file size
    const stats = fs.statSync(backupPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    console.log(`[Backup] Backup size: ${fileSizeInMB} MB`);

    // Compress the backup file
    console.log("[Backup] Compressing backup file...");

    await pipelineAsync(
      fs.createReadStream(backupPath),
      zlib.createGzip({ level: 9 }),
      fs.createWriteStream(compressedPath),
    );

    console.log(`[Backup] Compression complete: ${compressedPath}`);

    // Get compressed file size
    const compressedStats = fs.statSync(compressedPath);
    const compressedSizeInBytes = compressedStats.size;
    const compressedSizeInMB = (compressedSizeInBytes / (1024 * 1024)).toFixed(
      2,
    );
    const compressionRatio = (
      (1 - compressedSizeInBytes / fileSizeInBytes) *
      100
    ).toFixed(2);

    console.log(
      `[Backup] Compressed size: ${compressedSizeInMB} MB (${compressionRatio}% reduction)`,
    );

    // Upload to cloud storage
    console.log("[Backup] Uploading to cloud storage...");

    const uploadResult = await uploadBackupToCloud({
      localPath: compressedPath,
      filename: compressedFilename,
      databaseName,
      backupType,
      metadata: {
        originalSize: String(fileSizeInBytes),
        compressedSize: String(compressedSizeInBytes),
        compressionRatio,
        backupMethod,
        timestamp,
        jobId: jobId || "",
      },
    });

    if (!uploadResult.success) {
      throw new Error(
        `Upload failed: ${uploadResult.error || "Unknown error"}`,
      );
    }

    console.log(`[Backup] Upload complete for ${databaseName}`);

    // Clean up local files
    try {
      fs.unlinkSync(backupPath);
      fs.unlinkSync(compressedPath);
      console.log("[Backup] Cleaned up local backup files");
    } catch (cleanupError) {
      console.error("[Backup] Failed to clean up local files:", cleanupError);
      // Don't fail the backup if cleanup fails
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      message: `Successfully backed up database: ${databaseName}`,
      data: {
        databaseName,
        filename: compressedFilename,
        size: compressedSizeInMB + " MB",
        originalSize: fileSizeInMB + " MB",
        compressionRatio: compressionRatio + "%",
        backupMethod,
        uploadedAt: new Date().toISOString(),
        duration: Math.round(duration / 1000) + "s",
        cloudUrl: uploadResult.data?.url,
      },
    };
  } catch (error: any) {
    console.error(`[Backup] Error creating backup for ${databaseName}:`, error);

    // Clean up any partial files
    try {
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
    } catch (cleanupError) {
      console.error("[Backup] Cleanup error:", cleanupError);
    }

    return {
      success: false,
      error: error.message,
      data: {
        databaseName,
        filename: "",
        size: "",
        originalSize: "",
        compressionRatio: "",
        backupMethod: "",
        uploadedAt: "",
        duration: "",
      },
    };
  } finally {
    // Always close the session
    await session.close();
  }
}
