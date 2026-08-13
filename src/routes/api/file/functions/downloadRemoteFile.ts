import dns from "node:dns/promises";
import net from "node:net";
import path from "node:path";

import { APIError } from "~/lib/api/server/apiErrorHandler";

import { MAX_UPLOAD_BYTES } from "./chunkedUpload";

const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_REDIRECTS = 5;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "application/pdf": ".pdf",
  "application/json": ".json",
  "application/zip": ".zip",
  "application/gzip": ".gz",
  "application/x-tar": ".tar",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "text/html": ".html",
  "text/css": ".css",
  "text/javascript": ".js",
  "application/javascript": ".js",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/webm": ".weba",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
};

export type DownloadRemoteFileResult = {
  data: Buffer;
  fileName: string;
  mimeType: string | undefined;
  sourceUrl: string;
};

function sanitizeFileName(fileName: string) {
  const base = path.basename(String(fileName || "").trim());
  if (!base || base === "." || base === "..") {
    throw new APIError("Invalid file name", 400);
  }
  return base.slice(0, 255);
}

function fileExtension(fileName: string): string {
  const base = path.basename(String(fileName || "").trim());
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot >= base.length - 1) return "";
  return base.slice(dot);
}

function hasFileExtension(fileName: string): boolean {
  return fileExtension(fileName) !== "";
}

function extensionFromMime(mimeType?: string | null): string {
  if (!mimeType) return "";
  const base = String(mimeType).split(";")[0]?.trim().toLowerCase() || "";
  if (!base) return "";
  return MIME_TO_EXTENSION[base] || "";
}

/** Prefer source filename extension, then Content-Type → extension. */
function resolveMissingExtension(
  sourceName: string,
  mimeType?: string | null,
): string {
  return fileExtension(sourceName) || extensionFromMime(mimeType) || "";
}

/** If name has no extension, append from source name or MIME type. */
function withResolvedExtension(
  name: string,
  sourceName: string,
  mimeType?: string | null,
): string {
  if (!name || hasFileExtension(name)) return name;
  const ext = resolveMissingExtension(sourceName, mimeType);
  if (!ext) return name;
  const combined = `${name}${ext}`;
  return combined.length > 255 ? combined.slice(0, 255) : combined;
}

function isBlockedHostname(hostname: string): boolean {
  const host = String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "metadata.google.internal") return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map((p) => Number(p));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
      return true;
    }
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
    if (normalized.startsWith("fe80")) return true; // link-local
    if (normalized.startsWith("::ffff:")) {
      return isPrivateOrLocalIp(normalized.slice("::ffff:".length));
    }
    return false;
  }
  return true;
}

async function assertSafeRemoteUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new APIError("Invalid remote URL", 400);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new APIError("Only http and https URLs are allowed", 400);
  }
  if (url.username || url.password) {
    throw new APIError("URLs with credentials are not allowed", 400);
  }
  if (isBlockedHostname(url.hostname)) {
    throw new APIError("Remote URL host is not allowed", 400);
  }

  // Literal IP in hostname
  if (net.isIP(url.hostname) && isPrivateOrLocalIp(url.hostname)) {
    throw new APIError("Remote URL host is not allowed", 400);
  }

  try {
    const addresses = await dns.lookup(url.hostname, { all: true });
    if (!addresses.length) {
      throw new APIError("Could not resolve remote URL host", 400);
    }
    for (const addr of addresses) {
      if (isPrivateOrLocalIp(addr.address)) {
        throw new APIError("Remote URL host is not allowed", 400);
      }
    }
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError("Could not resolve remote URL host", 400);
  }

  return url;
}

function fileNameFromContentDisposition(
  header: string | null,
): string | undefined {
  if (!header) return undefined;
  // filename*=UTF-8''encoded or filename="value" / filename=value
  const starMatch = /filename\*\s*=\s*(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
  if (starMatch?.[1]) {
    try {
      return decodeURIComponent(starMatch[1].trim().replace(/^"|"$/g, ""));
    } catch {
      /* ignore */
    }
  }
  const match = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  if (match?.[2]) {
    return match[2].trim();
  }
  return undefined;
}

function fileNameFromUrl(url: URL): string {
  const base = path.basename(url.pathname);
  if (base && base !== "/" && base !== "." && base !== "..") {
    try {
      return decodeURIComponent(base);
    } catch {
      return base;
    }
  }
  return `download-${Date.now()}`;
}

async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<Buffer> {
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > maxBytes) {
      throw new APIError(
        `Remote file exceeds maximum allowed size of ${maxBytes} bytes`,
        413,
      );
    }
  }

  if (!response.body) {
    const ab = await response.arrayBuffer();
    if (ab.byteLength > maxBytes) {
      throw new APIError(
        `Remote file exceeds maximum allowed size of ${maxBytes} bytes`,
        413,
      );
    }
    return Buffer.from(ab);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      throw new APIError(
        `Remote file exceeds maximum allowed size of ${maxBytes} bytes`,
        413,
      );
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

/**
 * Download a remote file for ingestion via the upload pipeline.
 * Blocks private/local hosts (basic SSRF guard) and enforces size limits.
 */
export async function downloadRemoteFile(
  remoteUrl: string,
  options?: {
    fileName?: string | null;
    maxBytes?: number;
    timeoutMs?: number;
  },
): Promise<DownloadRemoteFileResult> {
  const maxBytes = options?.maxBytes ?? MAX_UPLOAD_BYTES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let currentUrl = await assertSafeRemoteUrl(String(remoteUrl || "").trim());
  let response: Response | null = null;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    try {
      response = await fetch(currentUrl.toString(), {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (error instanceof APIError) throw error;
      const message =
        error instanceof Error ? error.message : "Failed to fetch remote URL";
      throw new APIError(`Failed to download remote URL: ${message}`, 502);
    }

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")
    ) {
      const location = response.headers.get("location")!;
      const next = new URL(location, currentUrl);
      currentUrl = await assertSafeRemoteUrl(next.toString());
      continue;
    }
    break;
  }

  if (!response) {
    throw new APIError("Failed to download remote URL", 502);
  }

  if (!response.ok) {
    throw new APIError(
      `Remote URL returned HTTP ${response.status}`,
      response.status >= 400 && response.status < 600 ? response.status : 502,
    );
  }

  const data = await readBodyWithLimit(response, maxBytes);
  if (data.length === 0) {
    throw new APIError("Remote URL returned an empty file", 400);
  }

  const fromHeader = fileNameFromContentDisposition(
    response.headers.get("content-disposition"),
  );
  const contentType = response.headers.get("content-type") || "";
  const mimeType = contentType.split(";")[0]?.trim() || undefined;

  let sourceName = sanitizeFileName(fromHeader || fileNameFromUrl(currentUrl));
  sourceName = withResolvedExtension(sourceName, sourceName, mimeType);

  const overrideRaw =
    options?.fileName != null ? String(options.fileName).trim() : "";
  const override = overrideRaw
    ? withResolvedExtension(
        sanitizeFileName(overrideRaw),
        sourceName,
        mimeType,
      )
    : undefined;
  const fileName = sanitizeFileName(override || sourceName);

  return {
    data,
    fileName,
    mimeType,
    sourceUrl: currentUrl.toString(),
  };
}
