import type { Session } from "neo4j-driver";
import fs from "node:fs/promises";
import { getFileMetadata } from "~/routes/api/file/functions/functions/getFileMetadata";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { isSafeMediaVariantKey } from "~/lib/files/videoOptimizationConfig";
import { resolveVariantDiskPath } from "~/lib/files/imageVariantPaths";

import type { Vertex } from "~/lib/graph/type/vertex";

interface FileMetadata {
  filePath: string;
  originalFileName: string;
  mimeType: string;
  variantsJson?: string;
  status?: string;
}

interface ByteRange {
  start: number;
  end: number;
}

/**
 * Parses a single HTTP Range header value into start/end byte offsets.
 * Supports: bytes=start-end, bytes=start-, bytes=-suffix
 * Returns null for unsatisfiable or unsupported ranges (e.g. multi-range).
 */
function parseByteRange(
  rangeHeader: string,
  fileSize: number,
): ByteRange | "unsatisfiable" | "ignore" {
  // Only handle a single range unit; multi-range requests are ignored (full body).
  if (!rangeHeader.startsWith("bytes=") || rangeHeader.includes(",")) {
    return "ignore";
  }

  const rangeSpec = rangeHeader.slice("bytes=".length).trim();
  const match = /^(\d*)-(\d*)$/.exec(rangeSpec);
  if (!match) {
    return "unsatisfiable";
  }

  const [, startStr, endStr] = match;

  if (fileSize === 0) {
    return "unsatisfiable";
  }

  // Suffix range: bytes=-N (last N bytes)
  if (startStr === "" && endStr !== "") {
    const suffixLength = Number.parseInt(endStr, 10);
    if (Number.isNaN(suffixLength) || suffixLength <= 0) {
      return "unsatisfiable";
    }
    const start = Math.max(0, fileSize - suffixLength);
    return { start, end: fileSize - 1 };
  }

  if (startStr === "") {
    return "unsatisfiable";
  }

  const start = Number.parseInt(startStr, 10);
  if (Number.isNaN(start) || start < 0) {
    return "unsatisfiable";
  }

  if (start >= fileSize) {
    return "unsatisfiable";
  }

  let end = endStr === "" ? fileSize - 1 : Number.parseInt(endStr, 10);

  if (Number.isNaN(end) || end < start) {
    return "unsatisfiable";
  }

  end = Math.min(end, fileSize - 1);
  return { start, end };
}

async function readFileRange(
  filePath: string,
  start: number,
  length: number,
): Promise<Buffer> {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, start);
    return bytesRead === length ? buffer : buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
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

  try {
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

    const { size: fileSize } = await fs.stat(filePath);

    // Ensure the filename is safe for headers
    const safeFileName = encodeURIComponent(downloadName);
    const disposition = inline ? "inline" : "attachment";

    const baseHeaders: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Content-Disposition": `${disposition}; filename="${safeFileName}"`,
      "Content-Type": contentType,
      "Cache-Control": variantRaw
        ? "public, max-age=31536000, immutable"
        : "private, max-age=0",
    };

    const rangeHeader = options.rangeHeader;
    if (rangeHeader) {
      const parsed = parseByteRange(rangeHeader, fileSize);

      if (parsed === "unsatisfiable") {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      if (parsed !== "ignore") {
        const { start, end } = parsed;
        const contentLength = end - start + 1;
        const fileData = await readFileRange(filePath, start, contentLength);

        return new Response(fileData, {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Length": String(contentLength),
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          },
        });
      }
    }

    const fileData = await fs.readFile(filePath);

    return new Response(fileData, {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Length": String(fileSize),
      },
    });
  } catch (error: unknown) {
    if (error instanceof APIError) {
      throw error;
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new APIError(`Error reading file from disk: ${errorMessage}`, 500);
  }
}
