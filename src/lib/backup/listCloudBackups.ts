/**
 * List Cloud Backups Module
 * Lists all backup files from AWS S3 or Google Cloud Storage
 */

import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Storage } from "@google-cloud/storage";
import { buildBackupPrefix } from "./backupPathHelpers";

export interface BackupInfo {
  key: string;
  filename: string;
  databaseName: string;
  backupType: string;
  size: number;
  sizeFormatted: string;
  lastModified: Date | string;
  timestamp: string;
  etag?: string;
  storageClass?: string;
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    keyManagement?: string;
  };
}

export interface ListBackupsResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    backups: BackupInfo[];
    count: number;
    storageType: string;
    bucket: string;
    failedAt?: string;
  };
}

/**
 * List all backup files from cloud storage
 */
export async function listCloudBackups(): Promise<ListBackupsResult> {
  const storageType = process.env.BACKUP_STORAGE_TYPE || "s3";

  console.log(`[Storage] Listing backups from ${storageType.toUpperCase()}`);

  try {
    if (storageType === "s3") {
      // AWS S3 List using v3 SDK
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

      // List objects in domain-specific folder
      const prefix = buildBackupPrefix();
      console.log(
        `[S3] Listing objects in bucket: ${bucket} with prefix: ${prefix}`,
      );

      // List all objects in domain folder
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });

      const listResult = await s3Client.send(listCommand);

      // Fetch encryption information for each backup
      const backups = await Promise.all(
        (listResult.Contents || []).map(async (obj) => {
          // Parse filename to extract metadata
          // Format: backup/{domain}/{databaseName}/{filename}
          const keyParts = obj.Key!.split("/");
          const filename = keyParts[keyParts.length - 1];
          // keyParts[0] = 'backup', keyParts[1] = domain, keyParts[2] = databaseName
          const databaseName = keyParts.length > 2 ? keyParts[2] : keyParts[1];

          const filenameParts = filename.replace(".dump.gz", "").split("-");
          const backupType = filenameParts[filenameParts.length - 1];

          // Get encryption metadata
          let encryption = {
            enabled: false,
            algorithm: undefined as string | undefined,
            keyManagement: undefined as string | undefined,
          };

          try {
            const headCommand = new HeadObjectCommand({
              Bucket: bucket,
              Key: obj.Key!,
            });
            const headResult = await s3Client.send(headCommand);

            if (headResult.ServerSideEncryption) {
              encryption = {
                enabled: true,
                algorithm: headResult.ServerSideEncryption,
                keyManagement:
                  headResult.ServerSideEncryption === "aws:kms"
                    ? "AWS KMS"
                    : headResult.ServerSideEncryption === "AES256"
                      ? "AWS-Managed (SSE-S3)"
                      : "Server-Side",
              };
            }
          } catch (encError) {
            console.warn(
              `[S3] Failed to get encryption info for ${obj.Key}:`,
              encError,
            );
          }

          return {
            key: obj.Key!,
            filename,
            databaseName,
            backupType,
            size: obj.Size!,
            sizeFormatted: (obj.Size! / (1024 * 1024)).toFixed(2) + " MB",
            lastModified: obj.LastModified!,
            timestamp: obj.LastModified!.toISOString(),
            etag: obj.ETag,
            storageClass: obj.StorageClass,
            encryption,
          };
        }),
      );

      console.log(`[S3] Found ${backups.length} backups`);

      return {
        success: true,
        message: `Found ${backups.length} backup(s)`,
        data: {
          backups,
          count: backups.length,
          storageType: "s3",
          bucket,
        },
      };
    }if (storageType === "gcs") {
      // Google Cloud Storage List
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

      // List files in domain-specific folder
      const prefix = buildBackupPrefix();
      console.log(
        `[GCS] Listing files in bucket: ${bucketName} with prefix: ${prefix}`,
      );

      // List all files in domain folder
      const [files] = await bucket.getFiles({
        prefix,
      });

      const backups = files.map((file) => {
        // Parse filename to extract metadata
        // Format: backup/{domain}/{databaseName}/{filename}
        const keyParts = file.name.split("/");
        const filename = keyParts[keyParts.length - 1];
        // keyParts[0] = 'backup', keyParts[1] = domain, keyParts[2] = databaseName
        const databaseName = keyParts.length > 2 ? keyParts[2] : keyParts[1];

        const filenameParts = filename.replace(".dump.gz", "").split("-");
        const backupType = filenameParts[filenameParts.length - 1];

        // GCS encryption info
        const encryption = {
          enabled: true, // GCS encrypts all objects at rest by default
          algorithm: "AES256",
          keyManagement: file.metadata.kmsKeyName
            ? "Customer-Managed (CMEK)"
            : "Google-Managed",
        };

        return {
          key: file.name,
          filename,
          databaseName,
          backupType,
          size: parseInt(file.metadata.size as string),
          sizeFormatted:
            (parseInt(file.metadata.size as string) / (1024 * 1024)).toFixed(
              2,
            ) + " MB",
          lastModified: file.metadata.timeCreated as string,
          timestamp: file.metadata.timeCreated as string,
          storageClass: file.metadata.storageClass,
          encryption,
        };
      });

      console.log(`[GCS] Found ${backups.length} backups`);

      return {
        success: true,
        message: `Found ${backups.length} backup(s)`,
        data: {
          backups,
          count: backups.length,
          storageType: "gcs",
          bucket: bucketName,
        },
      };
    }
      throw new Error(`Unsupported storage type: ${storageType}`);
  } catch (error: any) {
    console.error("[Storage] List error:", error);

    return {
      success: false,
      error: error.message,
      data: {
        backups: [],
        count: 0,
        storageType,
        bucket: "",
        failedAt: new Date().toISOString(),
      },
    };
  }
}
