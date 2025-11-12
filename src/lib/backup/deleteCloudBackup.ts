/**
 * Delete Cloud Backup Module
 * Deletes a specific backup file from AWS S3 or Google Cloud Storage
 */

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Storage } from "@google-cloud/storage";
import { buildBackupPath } from "./backupPathHelpers";

export interface DeleteBackupOptions {
  filename: string;
  databaseName?: string;
  key?: string; // Full S3/GCS key path
}

export interface DeleteResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    bucket?: string;
    key?: string;
    storageType?: string;
    deletedAt?: string;
    filename?: string;
    failedAt?: string;
  };
}

/**
 * Delete a backup file from cloud storage
 */
export async function deleteCloudBackup(
  options: DeleteBackupOptions,
): Promise<DeleteResult> {
  const { filename, databaseName, key } = options;

  if (!filename) {
    return {
      success: false,
      error: "filename is required",
    };
  }

  const storageType = process.env.BACKUP_STORAGE_TYPE || "s3";

  console.log(
    `[Storage] Deleting ${filename} from ${storageType.toUpperCase()}`,
  );

  try {
    if (storageType === "s3") {
      // AWS S3 Delete using v3 SDK
      const s3Client = new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        region: process.env.AWS_S3_REGION || "us-east-1",
      });

      const bucket = process.env.AWS_S3_BUCKET;

      if (!bucket) {
        throw new Error("AWS_S3_BUCKET environment variable is not set");
      }

      // Use provided key or build path
      const s3Key = key || buildBackupPath(filename, databaseName);

      console.log(`  - Full Key: s3://${bucket}/${s3Key}`);

      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });

      await s3Client.send(deleteCommand);

      console.log(`[S3] Delete complete: ${s3Key}`);

      return {
        success: true,
        message: "Backup deleted from S3 successfully",
        data: {
          bucket,
          key: s3Key,
          storageType: "s3",
          deletedAt: new Date().toISOString(),
        },
      };
    } else if (storageType === "gcs") {
      // Google Cloud Storage Delete
      const projectId = process.env.GCS_PROJECT_ID;
      const bucketName = process.env.GCS_BUCKET;
      const keyFilePath = process.env.GCS_KEYFILE_PATH;

      if (!bucketName) {
        throw new Error("GCS_BUCKET environment variable is not set");
      }

      // Initialize GCS
      const storageConfig: any = { projectId };
      if (keyFilePath) {
        storageConfig.keyFilename = keyFilePath;
      }

      const storage = new Storage(storageConfig);
      const bucket = storage.bucket(bucketName);

      // Create GCS object name with domain-specific folder structure
      const objectName = buildBackupPath(filename, databaseName);

      console.log(`[GCS] Deleting gs://${bucketName}/${objectName}`);

      // Delete from GCS
      await bucket.file(objectName).delete();

      console.log(`[GCS] Delete complete: ${objectName}`);

      return {
        success: true,
        message: "Backup deleted from GCS successfully",
        data: {
          bucket: bucketName,
          key: objectName,
          storageType: "gcs",
          deletedAt: new Date().toISOString(),
        },
      };
    } else {
      throw new Error(`Unsupported storage type: ${storageType}`);
    }
  } catch (error: any) {
    console.error(`[Storage] Delete error:`, error);

    return {
      success: false,
      error: error.message,
      data: {
        filename,
        storageType,
        failedAt: new Date().toISOString(),
      },
    };
  }
}
