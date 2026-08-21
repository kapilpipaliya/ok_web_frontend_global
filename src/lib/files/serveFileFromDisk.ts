import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";

import { APIError } from "~/lib/api/server/apiErrorHandler";

interface ByteRange {
  start: number;
  end: number;
}

/**
 * Parses a single HTTP Range header value into start/end byte offsets.
 * Supports: bytes=start-end, bytes=start-, bytes=-suffix
 */
function parseByteRange(
  rangeHeader: string,
  fileSize: number,
): ByteRange | "unsatisfiable" | "ignore" {
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

function toWebStream(
  filePath: string,
  start?: number,
  end?: number,
): ReadableStream {
  const nodeStream =
    start === undefined || end === undefined
      ? createReadStream(filePath)
      : createReadStream(filePath, { start, end });
  return Readable.toWeb(nodeStream) as ReadableStream;
}

export type ServeFileFromDiskOptions = {
  contentType: string;
  fileName: string;
  rangeHeader?: string | null;
  inline?: boolean;
  cacheControl?: string;
};

/**
 * Serves a file from disk with optional HTTP Range support (RFC 7233).
 * Uses streaming so large videos are not buffered entirely in memory.
 */
export async function serveFileFromDisk(
  filePath: string,
  options: ServeFileFromDiskOptions,
): Promise<Response> {
  try {
    const { size: fileSize } = await fs.stat(filePath);
    if (fileSize <= 0) {
      throw new APIError("File is empty", 404);
    }
    const safeFileName = encodeURIComponent(options.fileName);
    const disposition = options.inline ? "inline" : "attachment";

    const baseHeaders: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Content-Disposition": `${disposition}; filename="${safeFileName}"`,
      "Content-Type": options.contentType || "application/octet-stream",
      "Cache-Control": options.cacheControl || "private, max-age=0",
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

        return new Response(toWebStream(filePath, start, end), {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Length": String(contentLength),
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          },
        });
      }
    }

    return new Response(toWebStream(filePath), {
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
