/**
 * Download Backup from Cloud Storage Module
 * Downloads a backup file from AWS S3 or Google Cloud Storage to local filesystem
 */

import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Storage } from "@google-cloud/storage";
import { buildBackupPath } from "./backupPathHelpers";

export interface DownloadBackupOptions {
  filename: string;
  databaseName?: string;
  localPath: string;
}

export interface DownloadResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    localPath?: string;
    size?: number;
    sizeFormatted?: string;
    storageType?: string;
    downloadedAt?: string;
    filename?: string;
    failedAt?: string;
  };
}

/**
 * Download a backup file from cloud storage to local filesystem
 */
export async function downloadBackupFromCloud(
  options: DownloadBackupOptions,
): Promise<DownloadResult> {
  const { filename, databaseName, localPath } = options;

  if (!(filename && localPath)) {
    return {
      success: false,
      error: "filename and localPath are required",
    };
  }

  const storageType = process.env.BACKUP_STORAGE_TYPE || "s3";

  console.log(
    `[Storage] Downloading ${filename} from ${storageType.toUpperCase()}`,
  );

  try {
    // Ensure local directory exists
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    if (storageType === "s3") {
      // AWS S3 Download using v3 SDK
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

      console.log(
        `[S3] Downloading from s3://${bucket}/${s3Key} to ${localPath}`,
      );

      // Download from S3
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });

      const response = await s3Client.send(getCommand);

      // Convert stream to buffer and write to file
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Write to local file
      fs.writeFileSync(localPath, buffer);

      const fileSize = fs.statSync(localPath).size;

      console.log(
        `[S3] Download complete: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      );

      return {
        success: true,
        message: "Backup downloaded from S3 successfully",
        data: {
          localPath,
          size: fileSize,
          sizeFormatted: (fileSize / (1024 * 1024)).toFixed(2) + " MB",
          storageType: "s3",
          downloadedAt: new Date().toISOString(),
        },
      };
    }if (storageType === "gcs") {
      // Google Cloud Storage Download
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

      console.log(
        `[GCS] Downloading from gs://${bucketName}/${objectName} to ${localPath}`,
      );

      // Download from GCS
      await bucket.file(objectName).download({
        destination: localPath,
      });

      const fileSize = fs.statSync(localPath).size;

      console.log(
        `[GCS] Download complete: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      );

      return {
        success: true,
        message: "Backup downloaded from GCS successfully",
        data: {
          localPath,
          size: fileSize,
          sizeFormatted: (fileSize / (1024 * 1024)).toFixed(2) + " MB",
          storageType: "gcs",
          downloadedAt: new Date().toISOString(),
        },
      };
    }
      throw new Error(`Unsupported storage type: ${storageType}`);
  } catch (error: any) {
    console.error("[Storage] Download error:", error);

    // Clean up partial download
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (cleanupError) {
      console.error("[Storage] Cleanup error:", cleanupError);
    }

    return {
      success: false,
      error: error.message,
      data: {
        filename,
        localPath,
        storageType,
        failedAt: new Date().toISOString(),
      },
    };
  }
}
