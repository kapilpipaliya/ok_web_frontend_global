import type { Session } from "neo4j-driver";

import { getFileMetadata } from "~/routes/api/file/functions/functions/getFileMetadata";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { isSafeMediaVariantKey } from "~/lib/files/videoOptimizationConfig";
import { resolveVariantDiskPath } from "~/lib/files/imageVariantPaths";
import { serveFileFromDisk } from "~/lib/files/serveFileFromDisk";

import type { Vertex } from "~/lib/graph/type/vertex";

interface FileMetadata {
  filePath: string;
  originalFileName: string;
  mimeType: string;
  variantsJson?: string;
  status?: string;
}

export type DownloadFileOptions = {
  rangeHeader?: string | null;
  /** Allowlisted variant name: thumb | small | medium | large */
  variant?: string | null;
  /** Prefer inline disposition for product/image display */
  inline?: boolean;
};

/**
 * Downloads a file from the server's file system and returns it as a Response.
 * Supports HTTP Range requests (RFC 7233) for partial content.
 * Optional `variant` serves an optimized WebP derivative from File.variantsJson.
 */
export async function downloadFile(
  fileName: string,
  dbSession: Session,
  rangeHeaderOrOptions?: string | null | DownloadFileOptions,
): Promise<Response> {
  const options: DownloadFileOptions =
    rangeHeaderOrOptions &&
    typeof rangeHeaderOrOptions === "object" &&
    !Array.isArray(rangeHeaderOrOptions)
      ? rangeHeaderOrOptions
      : { rangeHeader: rangeHeaderOrOptions as string | null | undefined };

  const fileMetadata = await getFileMetadata(dbSession, fileName);

  if (!fileMetadata) {
    throw new APIError("File not found", 404);
  }

  const metadata = fileMetadata as Vertex<FileMetadata>;
  const { originalFileName, mimeType } = metadata.P;
  let filePath = metadata.P.filePath;
  let contentType = mimeType || "application/octet-stream";
  let downloadName = originalFileName;
  const inline = options.inline === true || Boolean(options.variant);

  const variantRaw =
    options.variant == null
      ? ""
      : String(options.variant).trim().toLowerCase();
  if (variantRaw) {
    if (!isSafeMediaVariantKey(variantRaw)) {
      throw new APIError("Invalid media variant", 400);
    }
    if (String(metadata.P.status || "") !== "ready") {
      throw new APIError("Media variants are not ready", 404);
    }
    const variantPath = resolveVariantDiskPath(metadata.P, variantRaw);
    if (!variantPath) {
      throw new APIError("Media variant not found", 404);
    }
    filePath = variantPath;
    const ext = variantPath.split(".").pop()?.toLowerCase() || "";
    if (ext === "mp4") {
      contentType = "video/mp4";
    } else if (ext === "webp") {
      contentType = "image/webp";
    } else if (ext === "webm") {
      contentType = "video/webm";
    } else {
      contentType = "application/octet-stream";
    }
    const base = originalFileName?.replace(/\.[^.]+$/, "") || fileName;
    downloadName = `${base}_${variantRaw}.${ext || "bin"}`;
  }

  return serveFileFromDisk(filePath, {
    contentType,
    fileName: downloadName,
    rangeHeader: options.rangeHeader,
    inline,
    cacheControl: variantRaw
      ? "public, max-age=31536000, immutable"
      : "private, max-age=0",
  });
}
