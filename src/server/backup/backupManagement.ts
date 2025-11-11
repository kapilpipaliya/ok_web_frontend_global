"use server";

import { listCloudBackups } from "~/lib/backup/listCloudBackups";
import { deleteCloudBackup } from "~/lib/backup/deleteCloudBackup";
import { downloadBackupFromCloud } from "~/lib/backup/downloadBackupFromCloud";
import { createDatabaseBackup } from "~/lib/backup/createDatabaseBackup";
import { restoreFromBackup } from "~/lib/backup/restoreFromBackup";
import {getDriver} from "~/cypher/core/driver";

/**
 * Get all subdomains (database names)
 */
export async function getAllSubdomains() {
  try {
    const driver = await getDriver();
    const session = driver.session({ database: 'system' });

    try {
      const result = await session.run(`
        SHOW DATABASES
        WHERE name <> 'system' AND name <> 'neo4j'
      `);

      const databases = result.records.map((record) => ({
        name: record.get('name'),
        address: record.get('address'),
        role: record.get('role'),
        currentStatus: record.get('currentStatus'),
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
        storageType: process.env.BACKUP_STORAGE_TYPE || 's3',
        bucket: '',
      },
    };
  }
}

/**
 * Delete a specific backup from cloud storage
 */
export async function deleteBackup(filename: string, databaseName?: string, key?: string) {
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
  localPath?: string
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
      backupType: 'manual',
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
  confirmed?: boolean
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
