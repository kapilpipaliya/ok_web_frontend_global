/**
 * Upload Backup to Cloud Storage Module
 * Uploads backup files to AWS S3 or Google Cloud Storage
 */

import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Storage } from "@google-cloud/storage";
import { buildBackupPath } from "./backupPathHelpers";

export interface UploadBackupOptions {
  localPath: string;
  filename: string;
  databaseName?: string;
  backupType?: "hourly" | "daily" | "weekly" | "monthly";
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    url?: string;
    bucket?: string;
    key?: string;
    etag?: string;
    storageType?: string;
    size?: number;
    sizeFormatted?: string;
    uploadedAt?: string;
    filename?: string;
    failedAt?: string;
  };
}

/**
 * Upload a backup file to cloud storage (S3 or GCS)
 */
export async function uploadBackupToCloud(
  options: UploadBackupOptions,
): Promise<UploadResult> {
  const {
    localPath,
    filename,
    databaseName,
    backupType = "hourly",
    metadata = {},
  } = options;

  if (!(localPath && filename)) {
    return {
      success: false,
      error: "localPath and filename are required",
    };
  }

  // Check if file exists
  if (!fs.existsSync(localPath)) {
    return {
      success: false,
      error: `File not found: ${localPath}`,
    };
  }

  // Get storage configuration
  const storageType = process.env.BACKUP_STORAGE_TYPE || "s3";

  console.log(
    `[Storage] Uploading ${filename} to ${storageType.toUpperCase()}`,
  );

  try {
    if (storageType === "s3") {
      // AWS S3 Upload using v3 SDK
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

      // Create S3 key with domain-specific folder structure
      const s3Key = buildBackupPath(filename, databaseName);

      // Read file
      const fileContent = fs.readFileSync(localPath);
      const fileSize = fs.statSync(localPath).size;

      console.log(
        `[S3] Uploading to s3://${bucket}/${s3Key} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`,
      );

      // Upload to S3 using v3 SDK
      const uploadCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: "application/gzip",
        Metadata: {
          databaseName: databaseName || "unknown",
          backupType,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
        ServerSideEncryption: "AES256",
      });

      const uploadResult = await s3Client.send(uploadCommand);

      console.log(`[S3] Upload complete: s3://${bucket}/${s3Key}`);

      return {
        success: true,
        message: "File uploaded to S3 successfully",
        data: {
          url: `s3://${bucket}/${s3Key}`,
          bucket,
          key: s3Key,
          etag: uploadResult.ETag,
          storageType: "s3",
          size: fileSize,
          sizeFormatted: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString(),
        },
      };
    }
    if (storageType === "gcs") {
      // Google Cloud Storage Upload
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

      console.log(`[GCS] Uploading to gs://${bucketName}/${objectName}`);

      // Upload to GCS
      await bucket.upload(localPath, {
        destination: objectName,
        metadata: {
          contentType: "application/gzip",
          metadata: {
            databaseName: databaseName || "unknown",
            backupType,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      });

      const file = bucket.file(objectName);
      const [fileMetadata] = await file.getMetadata();

      console.log(`[GCS] Upload complete: gs://${bucketName}/${objectName}`);

      return {
        success: true,
        message: "File uploaded to GCS successfully",
        data: {
          url: `gs://${bucketName}/${objectName}`,
          bucket: bucketName,
          key: objectName,
          storageType: "gcs",
          size: parseInt(fileMetadata.size as string),
          sizeFormatted: `${(parseInt(fileMetadata.size as string) / (1024 * 1024)).toFixed(2)} MB`,
          uploadedAt: fileMetadata.timeCreated,
        },
      };
    }
    throw new Error(`Unsupported storage type: ${storageType}`);
  } catch (error: any) {
    console.error("[Storage] Upload error:", error);

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
