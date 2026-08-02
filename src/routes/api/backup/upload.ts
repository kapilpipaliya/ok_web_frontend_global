import type { APIEvent } from "@solidjs/start/server";
import fs from "node:fs";
import { uploadAndRestoreBackup } from "~/server/backup/backupManagement";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function POST(event: APIEvent) {
  let tmpPath: string | null = null;

  try {
    const formData = await event.nativeEvent.req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name) {
      throw new APIError("Invalid file data", 400);
    }

    const targetDatabase = String(formData.get("targetDatabase") || "").trim();
    const shouldRestore =
      String(formData.get("shouldRestore") || "") === "true";
    const confirmed = String(formData.get("confirmed") || "") === "true";

    if (!targetDatabase) {
      throw new APIError("Target database is required", 400);
    }

    const fileData = Buffer.from(await file.arrayBuffer());

    // Create temporary file
    tmpPath = `/tmp/upload_${Date.now()}_${file.name}`;
    fs.writeFileSync(tmpPath, fileData);

    console.log(
      `[Upload] File written to ${tmpPath}, size: ${fileData.length} bytes`,
    );

    // Call the backup management function
    const result = await uploadAndRestoreBackup(
      tmpPath,
      file.name,
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
        console.error("[Upload] Failed to clean up temp file:", cleanupError);
      }
    }
    return handleAPIError(error);
  }
}
