import type { Session, Transaction } from "neo4j-driver";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";

import {
  assertFileNameAvailable,
  buildDatedUserDir,
  finalizeFileUpload,
} from "./finalizeFileUpload";

export const DEFAULT_CHUNK_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

type ChunkSessionMeta = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalChunks: number;
  chunkSize: number;
  subDomain: string;
  createdAt: string;
  receivedChunks: number[];
};

function getChunksRoot(subDomain: string) {
  return path.join(getBaseDir(), subDomain, "_chunks");
}

function getSessionDir(subDomain: string, uploadId: string) {
  return path.join(getChunksRoot(subDomain), uploadId);
}

function getMetaPath(sessionDir: string) {
  return path.join(sessionDir, "meta.json");
}

function getChunkPath(sessionDir: string, chunkIndex: number) {
  return path.join(sessionDir, `chunk_${chunkIndex}.part`);
}

function readMeta(sessionDir: string): ChunkSessionMeta {
  const metaPath = getMetaPath(sessionDir);
  if (!fs.existsSync(metaPath)) {
    throw new Error("Upload session not found or expired");
  }
  return JSON.parse(fs.readFileSync(metaPath, "utf8")) as ChunkSessionMeta;
}

function writeMeta(sessionDir: string, meta: ChunkSessionMeta) {
  fs.writeFileSync(getMetaPath(sessionDir), JSON.stringify(meta), "utf8");
}

function removeSessionDir(sessionDir: string) {
  try {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  } catch (e) {
    console.error("removeSessionDir failed", e);
  }
}

function sanitizeFileName(fileName: string) {
  const base = path.basename(String(fileName || "").trim());
  if (!base || base === "." || base === "..") {
    throw new Error("Invalid file name");
  }
  return base;
}

export async function initChunkedUpload(options: {
  fileName: string;
  fileSize: number;
  mimeType?: string | null;
  chunkSize?: number | null;
  subDomain: string;
  neo4jSession: Session | Transaction;
}) {
  const fileName = sanitizeFileName(options.fileName);
  const fileSize = Number(options.fileSize);
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw new Error("Valid fileSize is required");
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES} bytes`,
    );
  }

  const chunkSize = Math.max(
    256 * 1024,
    Math.min(
      Number(options.chunkSize) || DEFAULT_CHUNK_SIZE_BYTES,
      8 * 1024 * 1024,
    ),
  );
  const totalChunks = Math.ceil(fileSize / chunkSize);
  const userDir = buildDatedUserDir(options.subDomain);
  const destinationPath = path.join(userDir, fileName);
  await assertFileNameAvailable(
    options.neo4jSession,
    fileName,
    destinationPath,
  );

  const uploadId = crypto.randomUUID();
  const sessionDir = getSessionDir(options.subDomain, uploadId);
  ensureDirectoryExists(sessionDir);

  const meta: ChunkSessionMeta = {
    uploadId,
    fileName,
    fileSize,
    mimeType: options.mimeType != null ? String(options.mimeType) : "",
    totalChunks,
    chunkSize,
    subDomain: options.subDomain,
    createdAt: new Date().toISOString(),
    receivedChunks: [],
  };
  writeMeta(sessionDir, meta);

  return {
    uploadId,
    chunkSize,
    totalChunks,
    fileName,
    fileSize,
  };
}

export async function saveUploadChunk(options: {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  chunkData: Buffer;
  subDomain: string;
}) {
  const uploadId = String(options.uploadId || "").trim();
  if (!uploadId) {
    throw new Error("uploadId is required");
  }

  const chunkIndex = Number(options.chunkIndex);
  const totalChunks = Number(options.totalChunks);
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("Invalid chunkIndex");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("Invalid totalChunks");
  }
  if (!options.chunkData || options.chunkData.length === 0) {
    throw new Error("Empty chunk");
  }

  const sessionDir = getSessionDir(options.subDomain, uploadId);
  const meta = readMeta(sessionDir);

  if (meta.subDomain !== options.subDomain) {
    throw new Error("Upload session subdomain mismatch");
  }
  if (meta.totalChunks !== totalChunks) {
    throw new Error("totalChunks mismatch");
  }
  if (chunkIndex >= meta.totalChunks) {
    throw new Error("chunkIndex out of range");
  }

  const expectedSize =
    chunkIndex === meta.totalChunks - 1
      ? meta.fileSize - meta.chunkSize * (meta.totalChunks - 1)
      : meta.chunkSize;
  if (options.chunkData.length !== expectedSize) {
    throw new Error(
      `Unexpected chunk size for index ${chunkIndex}: got ${options.chunkData.length}, expected ${expectedSize}`,
    );
  }

  fs.writeFileSync(getChunkPath(sessionDir, chunkIndex), options.chunkData);

  if (!meta.receivedChunks.includes(chunkIndex)) {
    meta.receivedChunks.push(chunkIndex);
    meta.receivedChunks.sort((a, b) => a - b);
    writeMeta(sessionDir, meta);
  }

  return {
    uploadId,
    chunkIndex,
    receivedChunks: meta.receivedChunks.length,
    totalChunks: meta.totalChunks,
  };
}

export async function completeChunkedUpload(options: {
  uploadId: string;
  subDomain: string;
  neo4jSession: Session | Transaction;
  linkUserUuid?: string | null;
  label?: string;
}) {
  const uploadId = String(options.uploadId || "").trim();
  if (!uploadId) {
    throw new Error("uploadId is required");
  }

  const sessionDir = getSessionDir(options.subDomain, uploadId);
  const meta = readMeta(sessionDir);

  if (meta.subDomain !== options.subDomain) {
    throw new Error("Upload session subdomain mismatch");
  }

  if (meta.receivedChunks.length !== meta.totalChunks) {
    throw new Error(
      `Incomplete upload: received ${meta.receivedChunks.length} of ${meta.totalChunks} chunks`,
    );
  }

  for (let i = 0; i < meta.totalChunks; i++) {
    if (!fs.existsSync(getChunkPath(sessionDir, i))) {
      throw new Error(`Missing chunk ${i}`);
    }
  }

  const parts: Buffer[] = [];
  let total = 0;
  for (let i = 0; i < meta.totalChunks; i++) {
    const part = fs.readFileSync(getChunkPath(sessionDir, i));
    parts.push(part);
    total += part.length;
  }

  if (total !== meta.fileSize) {
    removeSessionDir(sessionDir);
    throw new Error(
      `Assembled size mismatch: got ${total}, expected ${meta.fileSize}`,
    );
  }

  const data = Buffer.concat(parts, total);

  try {
    const result = await finalizeFileUpload({
      data,
      filename: meta.fileName,
      mimeType: meta.mimeType || null,
      subDomain: options.subDomain,
      neo4jSession: options.neo4jSession,
      linkUserUuid: options.linkUserUuid,
      label: options.label,
    });
    removeSessionDir(sessionDir);
    return result;
  } catch (error) {
    removeSessionDir(sessionDir);
    throw error;
  }
}

export async function abortChunkedUpload(options: {
  uploadId: string;
  subDomain: string;
}) {
  const uploadId = String(options.uploadId || "").trim();
  if (!uploadId) {
    return { aborted: false };
  }
  removeSessionDir(getSessionDir(options.subDomain, uploadId));
  return { aborted: true };
}
