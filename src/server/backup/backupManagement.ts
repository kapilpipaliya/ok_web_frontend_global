"use server";

import { listCloudBackups } from "~/lib/backup/listCloudBackups";
import { deleteCloudBackup } from "~/lib/backup/deleteCloudBackup";
import { downloadBackupFromCloud } from "~/lib/backup/downloadBackupFromCloud";
import { createDatabaseBackup } from "~/lib/backup/createDatabaseBackup";
import { restoreFromBackup } from "~/lib/backup/restoreFromBackup";
import { getDriver } from "~/cypher/core/driver";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

/**
 * Get all subdomains (database names)
 */
export async function getAllSubdomains() {
  try {
    const driver = await getDriver();
    const session = driver.session({ database: "system" });

    try {
      const result = await session.run(`
        SHOW DATABASES
        WHERE name <> 'system' AND name <> 'neo4j'
      `);

      const databases = result.records.map((record) => ({
        name: record.get("name"),
        address: record.get("address"),
        role: record.get("role"),
        currentStatus: record.get("currentStatus"),
      }));

      return {
        success: true,
        data: databases,
      };
    } finally {
      await session.close();
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

/**
 * List all cloud backups
 */
export async function listBackups() {
  try {
    const result = await listCloudBackups();
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: {
        backups: [],
        count: 0,
        storageType: process.env.BACKUP_STORAGE_TYPE || "s3",
        bucket: "",
      },
    };
  }
}

/**
 * Delete a specific backup from cloud storage
 */
export async function deleteBackup(
  filename: string,
  databaseName?: string,
  key?: string,
) {
  try {
    const result = await deleteCloudBackup({ filename, databaseName, key });
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Download a backup from cloud storage
 */
export async function downloadBackup(
  filename: string,
  databaseName?: string,
  localPath?: string,
) {
  try {
    const downloadPath = localPath || `/tmp/${filename}`;
    const result = await downloadBackupFromCloud({
      filename,
      databaseName,
      localPath: downloadPath,
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a new database backup
 */
export async function createBackup(databaseName: string) {
  try {
    const result = await createDatabaseBackup({
      databaseName: databaseName,
      backupType: "manual",
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Restore database from backup
 */
export async function restoreBackup(
  filename: string,
  sourceDatabaseName: string,
  targetDatabaseName?: string,
  confirmed?: boolean,
) {
  try {
    const result = await restoreFromBackup({
      filename,
      sourceDatabaseName,
      targetDatabaseName,
      confirmed,
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Save a note for a backup
 */
export async function saveBackupNote(backupKey: string, note: string) {
  try {
    const driver = await getDriver();
    const session = driver.session({ database: "admin" });

    try {
      let vertex = null;

      if (note.trim()) {
        // Create or update note and return it
        const result = await session.run(
          `
          MERGE (n:BackupNote {backupKey: $backupKey})
          SET n.note = $note, n.updatedAt = timestamp()
          RETURN n
          `,
          { backupKey, note: note.trim() },
        );

        if (result.records.length > 0) {
          const node = result.records[0].get("n");
          vertex = convertNodeToJson(node);
        }
      } else {
        // Delete note if empty
        await session.run(
          `
          MATCH (n:BackupNote {backupKey: $backupKey})
          DELETE n
          `,
          { backupKey },
        );
      }

      return {
        success: true,
        message: note.trim() ? "Note saved" : "Note deleted",
        data: vertex,
      };
    } finally {
      await session.close();
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all backup notes
 */
export async function getBackupNotes() {
  try {
    const driver = await getDriver();
    const session = driver.session({ database: "admin" });

    try {
      const result = await session.run(`
        MATCH (n:BackupNote)
        RETURN n
      `);

      const notes = result.records.map((record) => {
        const node = record.get("n");
        return convertNodeToJson(node);
      });

      return {
        success: true,
        data: notes,
      };
    } finally {
      await session.close();
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

/**
 * Compare two backups and show differences
 */
export async function compareBackups(
  filename1: string,
  databaseName1: string,
  filename2: string,
  databaseName2: string,
) {
  try {
    const fs = await import("fs");
    const zlib = await import("zlib");
    const { promisify } = await import("util");
    const gunzip = promisify(zlib.gunzip);

    // Download both backups
    const tmpPath1 = `/tmp/compare_${Date.now()}_1_${filename1}`;
    const tmpPath2 = `/tmp/compare_${Date.now()}_2_${filename2}`;

    const download1 = await downloadBackupFromCloud({
      filename: filename1,
      databaseName: databaseName1,
      localPath: tmpPath1,
    });

    const download2 = await downloadBackupFromCloud({
      filename: filename2,
      databaseName: databaseName2,
      localPath: tmpPath2,
    });

    if (!download1.success || !download2.success) {
      throw new Error("Failed to download one or both backups");
    }

    // Decompress and read both files
    const content1Compressed = fs.readFileSync(tmpPath1);
    const content2Compressed = fs.readFileSync(tmpPath2);

    const content1 = (await gunzip(content1Compressed)).toString("utf8");
    const content2 = (await gunzip(content2Compressed)).toString("utf8");

    // Generate diff statistics
    const lines1 = content1.split("\n");
    const lines2 = content2.split("\n");

    const diffLines: Array<{
      type: "added" | "removed" | "unchanged";
      content: string;
      lineNumber: number;
    }> = [];

    // Simple line-by-line comparison (first 100 differences)
    let differences = 0;
    const maxDiff = 100;

    for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
      if (differences >= maxDiff) break;

      const line1 = lines1[i] || "";
      const line2 = lines2[i] || "";

      if (line1 !== line2) {
        if (line1 && !line2) {
          diffLines.push({
            type: "removed",
            content: line1,
            lineNumber: i + 1,
          });
          differences++;
        } else if (!line1 && line2) {
          diffLines.push({ type: "added", content: line2, lineNumber: i + 1 });
          differences++;
        } else {
          diffLines.push({
            type: "removed",
            content: line1,
            lineNumber: i + 1,
          });
          diffLines.push({ type: "added", content: line2, lineNumber: i + 1 });
          differences += 2;
        }
      }
    }

    // Clean up temp files
    try {
      fs.unlinkSync(tmpPath1);
      fs.unlinkSync(tmpPath2);
    } catch (cleanupError) {
      console.error("Failed to clean up temp files:", cleanupError);
    }

    return {
      success: true,
      data: {
        totalLines1: lines1.length,
        totalLines2: lines2.length,
        differences: diffLines,
        truncated: differences >= maxDiff,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Preview backup contents
 */
export async function previewBackup(filename: string, databaseName: string) {
  try {
    const { downloadBackupFromCloud } = await import(
      "~/lib/backup/downloadBackupFromCloud"
    );
    const fs = await import("fs");
    const zlib = await import("zlib");
    const { promisify } = await import("util");
    const gunzip = promisify(zlib.gunzip);

    // Download backup
    const tmpPath = `/tmp/preview_${Date.now()}_${filename}`;

    const download = await downloadBackupFromCloud({
      filename,
      databaseName,
      localPath: tmpPath,
    });

    if (!download.success) {
      throw new Error(`Download failed: ${download.error || "Unknown error"}`);
    }

    // Decompress and read file
    const contentCompressed = fs.readFileSync(tmpPath);
    const content = (await gunzip(contentCompressed)).toString("utf8");

    // Parse content to extract metadata
    const lines = content.split("\n");
    const totalLines = lines.length;

    // Extract first 50 lines as preview
    const previewLines = lines.slice(0, 50);

    // Count node types
    const nodeTypes: Record<string, number> = {};
    const relationshipTypes: Record<string, number> = {};

    lines.forEach((line) => {
      // Match CREATE statements for nodes
      const nodeMatch = line.match(/CREATE \(:\w+/g);
      if (nodeMatch) {
        nodeMatch.forEach((match) => {
          const label = match.replace("CREATE (:", "");
          nodeTypes[label] = (nodeTypes[label] || 0) + 1;
        });
      }

      // Match CREATE statements for relationships
      const relMatch = line.match(/-\[:\w+\]->/g);
      if (relMatch) {
        relMatch.forEach((match) => {
          const type = match.replace("-[:", "").replace("]->", "");
          relationshipTypes[type] = (relationshipTypes[type] || 0) + 1;
        });
      }
    });

    // Clean up temp file
    try {
      fs.unlinkSync(tmpPath);
    } catch (cleanupError) {
      console.error("Failed to clean up temp file:", cleanupError);
    }

    return {
      success: true,
      data: {
        filename,
        databaseName,
        totalLines,
        previewLines,
        nodeTypes,
        relationshipTypes,
        totalNodes: Object.values(nodeTypes).reduce((a, b) => a + b, 0),
        totalRelationships: Object.values(relationshipTypes).reduce(
          (a, b) => a + b,
          0,
        ),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
