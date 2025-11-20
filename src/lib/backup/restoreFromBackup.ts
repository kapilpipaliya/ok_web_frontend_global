/**
 * Database Restore Module
 * Restores a Neo4j database from a backup file in cloud storage
 * USE WITH CAUTION - This deletes all existing data in the target database
 */

import fs from "fs";
import path from "path";
import { promisify } from "util";
import zlib from "zlib";
import { pipeline } from "stream";
import { downloadBackupFromCloud } from "./downloadBackupFromCloud";
import { getDriver } from "~/cypher/core/driver";
import {
  stopWorkersForSubdomain,
  initSubdomainWorkersForSubdomain,
} from "~/server/queue/initWorkersCore";

const pipelineAsync = promisify(pipeline);

export interface RestoreFromBackupOptions {
  filename: string;
  sourceDatabaseName: string;
  targetDatabaseName?: string;
  confirmed?: boolean;
  sendEmail?: (params: {
    to: string;
    subject: string;
    content: string;
    subDomain?: string;
  }) => Promise<any>;
  subDomain?: string;
  isLocalFile?: boolean; // Flag to indicate if filename is a local path
}

export interface RestoreResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    sourceBackup: string;
    sourceDatabaseName: string;
    targetDatabaseName: string;
    duration?: string;
    restoredAt?: string;
    failedAt?: string;
    warning?: string;
    requiredAction?: string;
    stack?: string;
  };
}

/**
 * Restores a database from a backup file
 */
export async function restoreFromBackup(
  options: RestoreFromBackupOptions,
): Promise<RestoreResult> {
  const {
    filename,
    sourceDatabaseName,
    targetDatabaseName,
    confirmed = false,
    sendEmail,
    subDomain,
    isLocalFile = false,
  } = options;

  // Validate inputs
  if (!filename) {
    return {
      success: false,
      error: "filename is required",
    };
  }

  if (!sourceDatabaseName) {
    return {
      success: false,
      error: "sourceDatabaseName is required",
    };
  }

  const restoreToDatabase = targetDatabaseName || sourceDatabaseName;

  // CRITICAL SAFETY CHECK
  if (!confirmed) {
    return {
      success: false,
      error: "Restore operation requires explicit confirmation",
      data: {
        sourceBackup: filename,
        sourceDatabaseName,
        targetDatabaseName: restoreToDatabase,
        warning:
          "This operation will DELETE all existing data in the target database!",
        requiredAction: "Set confirmed: true to proceed",
      },
    };
  }

  console.log(`[Restore] ⚠️  WARNING: Starting restore operation`);
  console.log(`[Restore] Source backup: ${filename}`);
  console.log(`[Restore] Target database: ${restoreToDatabase}`);
  console.log(`[Restore] Local file: ${isLocalFile}`);

  const startTime = Date.now();
  const restoreDir = path.join(process.cwd(), "restore");

  // If it's a local file, use the provided path directly
  const compressedPath = isLocalFile ? filename : path.join(restoreDir, filename);
  const decompressedPath = compressedPath.replace(".gz", "");

  try {
    // Step 1: Create restore directory (only if not using local file)
    if (!isLocalFile && !fs.existsSync(restoreDir)) {
      fs.mkdirSync(restoreDir, { recursive: true });
    }

    // Step 2: Download backup from cloud storage (skip if local file)
    if (!isLocalFile) {
      console.log(`[Restore] Step 1/6: Downloading backup from cloud storage...`);

      const downloadResult = await downloadBackupFromCloud({
        filename,
        databaseName: sourceDatabaseName,
        localPath: compressedPath,
      });

      if (!downloadResult.success) {
        throw new Error(
          `Download failed: ${downloadResult.error || "Unknown error"}`,
        );
      }

      console.log(
        `[Restore] Download complete: ${downloadResult.data?.sizeFormatted}`,
      );
    } else {
      console.log(`[Restore] Step 1/6: Using local file: ${compressedPath}`);

      // Verify the local file exists
      if (!fs.existsSync(compressedPath)) {
        throw new Error(`Local backup file not found: ${compressedPath}`);
      }

      const fileSize = fs.statSync(compressedPath).size;
      console.log(
        `[Restore] Local file size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      );
    }

    // Step 3: Decompress backup file
    console.log(`[Restore] Step 2/6: Decompressing backup file...`);

    await pipelineAsync(
      fs.createReadStream(compressedPath),
      zlib.createGunzip(),
      fs.createWriteStream(decompressedPath),
    );

    const decompressedSize = fs.statSync(decompressedPath).size;
    console.log(
      `[Restore] Decompression complete: ${(decompressedSize / (1024 * 1024)).toFixed(2)} MB`,
    );

    // Step 4: Stop workers for target database
    console.log(
      `[Restore] Step 3/6: Stopping workers for database: ${restoreToDatabase}...`,
    );

    try {
      // Dynamic import to avoid circular dependencies
      await stopWorkersForSubdomain(restoreToDatabase);
      console.log(`[Restore] Workers stopped successfully`);
    } catch (workerError) {
      console.warn(`[Restore] Failed to stop workers:`, workerError);
      // Continue anyway - workers might not be running
    }

    // Step 5: Drop and recreate database
    console.log(
      `[Restore] Step 4/6: Dropping existing database: ${restoreToDatabase}...`,
    );

    // CRITICAL: This deletes all data in the target database
    // Create a system session for database management operations
    const driver = await getDriver();
    const systemSession = driver.session({ database: "system" });

    try {
      await systemSession.run(`DROP DATABASE ${restoreToDatabase} IF EXISTS`);
      console.log(`[Restore] Database dropped successfully`);

      // Wait a moment for the database to be fully dropped
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create new empty database
      await systemSession.run(
        `CREATE DATABASE ${restoreToDatabase} IF NOT EXISTS`,
      );
      console.log(`[Restore] New database created`);

      // Wait for database to be ready
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (dbError: any) {
      throw new Error(`Failed to drop/create database: ${dbError.message}`);
    } finally {
      await systemSession.close();
    }

    // Step 6: Restore data from backup using APOC
    console.log(`[Restore] Step 5/6: Restoring data from backup using APOC...`);

    // Copy decompressed file to Neo4j import directory for APOC to access
    const neo4jImportDir =
      process.env.NEO4J_IMPORT_DIR || "/var/lib/neo4j/import";
    const importFilename = path.basename(decompressedPath);
    const importPath = path.join(neo4jImportDir, importFilename);

    console.log(`[Restore] Copying backup to Neo4j import directory: ${importPath}`);
    fs.copyFileSync(decompressedPath, importPath);

    // Create a session for the target database
    const targetSession = driver.session({ database: restoreToDatabase });

    try {
      // Use APOC to run the Cypher file
      console.log(`[Restore] Running APOC import for file: ${importFilename}`);

      const result = await targetSession.run(
        `
        CALL apoc.cypher.runFile($filename)
        YIELD row, result
        RETURN count(*) as totalStatements
        `,
        { filename: importFilename }
      );

      const totalStatements = result.records[0]?.get("totalStatements");
      const count = typeof totalStatements === 'number' ? totalStatements : (totalStatements?.toInt?.() || 0);
      console.log(`[Restore] APOC import complete: ${count} operations executed`);

      // Clean up the file from Neo4j import directory
      try {
        fs.unlinkSync(importPath);
        console.log(`[Restore] Cleaned up import file from Neo4j import directory`);
      } catch (cleanupError) {
        console.warn(`[Restore] Failed to clean up import file:`, cleanupError);
      }
    } catch (apocError: any) {
      console.error(`[Restore] APOC import failed:`, apocError);

      // Clean up import file on error
      try {
        if (fs.existsSync(importPath)) {
          fs.unlinkSync(importPath);
        }
      } catch (cleanupError) {
        console.error(`[Restore] Failed to clean up import file:`, cleanupError);
      }

      throw new Error(`APOC import failed: ${apocError.message}`);
    } finally {
      await targetSession.close();
    }

    // Step 7: Restart workers
    console.log(
      `[Restore] Step 6/6: Restarting workers for database: ${restoreToDatabase}...`,
    );

    try {
      await initSubdomainWorkersForSubdomain(restoreToDatabase);
      console.log(`[Restore] Workers restarted successfully`);
    } catch (workerError) {
      console.error(`[Restore] Failed to restart workers:`, workerError);
      // Don't fail the restore operation - workers can be manually restarted
    }

    // Clean up temporary files
    try {
      fs.unlinkSync(compressedPath);
      fs.unlinkSync(decompressedPath);
      console.log(`[Restore] Cleaned up temporary files`);
    } catch (cleanupError) {
      console.error(`[Restore] Cleanup error:`, cleanupError);
    }

    const duration = Date.now() - startTime;

    console.log(
      `[Restore] ✅ Restore completed successfully in ${Math.round(duration / 1000)}s`,
    );

    // Send notification email
    try {
      const alertEmail =
        process.env.BACKUP_ALERT_EMAIL || process.env.ADMIN_EMAIL;
      if (alertEmail && sendEmail) {
        await sendEmail({
          to: alertEmail,
          subject: `✅ Database Restore Completed: ${restoreToDatabase}`,
          content: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">✅ Database Restore Completed</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 16px 0; color: #374151;">
                    Database restore operation completed successfully.
                  </p>
                  <table style="width: 100%; border-collapse: collapse; background: white; padding: 16px; border-radius: 6px;">
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Source Backup:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${filename}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Target Database:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${restoreToDatabase}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Duration:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${Math.round(duration / 1000)}s</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Completed At:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC</td>
                    </tr>
                  </table>
                </div>
              </div>
            `,
          subDomain,
        });
      }
    } catch (emailError) {
      console.error(`[Restore] Failed to send notification email:`, emailError);
    }

    return {
      success: true,
      message: `Database restored successfully from backup: ${filename}`,
      data: {
        sourceBackup: filename,
        sourceDatabaseName,
        targetDatabaseName: restoreToDatabase,
        duration: Math.round(duration / 1000) + "s",
        restoredAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error(`[Restore] ❌ Restore operation failed:`, error);

    // Clean up temporary files on failure
    try {
      if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
      if (fs.existsSync(decompressedPath)) fs.unlinkSync(decompressedPath);
    } catch (cleanupError) {
      console.error(`[Restore] Cleanup error:`, cleanupError);
    }

    // Send failure notification
    try {
      const alertEmail =
        process.env.BACKUP_ALERT_EMAIL || process.env.ADMIN_EMAIL;
      if (alertEmail && sendEmail) {
        await sendEmail({
          to: alertEmail,
          subject: `🚨 Database Restore Failed: ${restoreToDatabase}`,
          content: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">🚨 Database Restore Failed</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 16px 0; color: #374151;">
                    Database restore operation failed.
                  </p>
                  <div style="background: #fef2f2; padding: 16px; border-radius: 6px; border: 1px solid #fecaca; margin-bottom: 16px;">
                    <p style="margin: 0; color: #dc2626; font-family: monospace; font-size: 14px;">${error.message}</p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; background: white; padding: 16px; border-radius: 6px;">
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Source Backup:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${filename}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Target Database:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${restoreToDatabase}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; color: #6b7280;">Failed At:</td>
                      <td style="padding: 8px; color: #111827; font-weight: 600;">${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC</td>
                    </tr>
                  </table>
                </div>
              </div>
            `,
          subDomain,
        });
      }
    } catch (emailError) {
      console.error(
        `[Restore] Failed to send failure notification:`,
        emailError,
      );
    }

    return {
      success: false,
      error: error.message,
      data: {
        sourceBackup: filename,
        sourceDatabaseName,
        targetDatabaseName: restoreToDatabase,
        failedAt: new Date().toISOString(),
        stack: error.stack,
      },
    };
  }
}
