import type { APIEvent } from "@solidjs/start/server";
import { readMultipartFormData } from "vinxi/http";
import fs from "node:fs";
import { uploadAndRestoreBackup } from "~/server/backup/backupManagement";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  let tmpPath: string | null = null;

  try {
    const data = await readMultipartFormData();
    if (!data || data.length === 0) {
      throw new APIError("No file data available", 400);
    }

    // Get the first file from the multipart data
    const file = data[0];
    if (!file || !file.filename || !file.data) {
      throw new APIError("Invalid file data", 400);
    }

    // Get form fields
    const targetDatabase =
      data.find((item) => item.name === "targetDatabase")?.data?.toString() ||
      "";
    const shouldRestore =
      data.find((item) => item.name === "shouldRestore")?.data?.toString() ===
      "true";
    const confirmed =
      data.find((item) => item.name === "confirmed")?.data?.toString() ===
      "true";

    if (!targetDatabase) {
      throw new APIError("Target database is required", 400);
    }

    // Create temporary file
    tmpPath = `/tmp/upload_${Date.now()}_${file.filename}`;
    fs.writeFileSync(tmpPath, file.data);

    console.log(
      `[Upload] File written to ${tmpPath}, size: ${file.data.length} bytes`,
    );

    // Call the backup management function
    const result = await uploadAndRestoreBackup(
      tmpPath,
      file.filename,
      targetDatabase,
      shouldRestore,
      confirmed,
    );

    return result;
  } catch (error) {
    // Clean up temp file if it exists and there was an error
    if (tmpPath && fs.existsSync(tmpPath)) {
      try {
        fs.unlinkSync(tmpPath);
        console.log(`[Upload] Cleaned up temp file after error: ${tmpPath}`);
      } catch (cleanupError) {
        console.error(`[Upload] Failed to clean up temp file:`, cleanupError);
      }
    }
    return handleAPIError(error);
  }
}
