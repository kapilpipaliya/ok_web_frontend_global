import type { Session, Transaction } from "neo4j-driver";

import { APIError } from "~/lib/api/server/apiErrorHandler";
import type { MultipartPart } from "~/lib/http/multipart";
import { resolveUploadFolderKeyPath } from "~/lib/files/folderOrganize";

import { downloadRemoteFile } from "./downloadRemoteFile";
import { finalizeFileUpload } from "./finalizeFileUpload";

function partText(part: MultipartPart | undefined): string {
  if (!part?.data) return "";
  return Buffer.from(part.data).toString("utf8").trim();
}

export type RemoteFileEntry = {
  url: string;
  fileName?: string | null;
};

export type RemoteUploadItemResult = {
  ok: boolean;
  url: string;
  fileName?: string;
  error?: string;
  result?: unknown;
};

function parseRemoteFilesJson(raw: string): RemoteFileEntry[] {
  try {
    const parsed = JSON.parse(raw);
    return normalizeRemoteFileEntries(parsed);
  } catch {
    return [];
  }
}

function normalizeRemoteFileEntries(value: unknown): RemoteFileEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: RemoteFileEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.url !== "string") continue;
    const url = row.url.trim();
    if (!url) continue;
    const fileName =
      typeof row.fileName === "string" ? row.fileName.trim() : null;
    entries.push({ url, fileName: fileName || null });
  }
  return entries;
}

export function extractUploadFolderOptions(data: MultipartPart[]) {
  let folderId = "";
  let folderKeyPath: string[] | null = null;
  let categoryLabel = "Folder";
  let toParentEdgeType = "ParentFolder";
  let remoteFileEntries: RemoteFileEntry[] = [];
  const fileParts: MultipartPart[] = [];

  for (const part of data) {
    if (!part) continue;
    const name = part.name == null ? "" : String(part.name);
    if (part.filename) {
      fileParts.push(part);
      continue;
    }
    if (name === "folderId") {
      folderId = partText(part);
    } else if (name === "folderKeyPath") {
      try {
        const parsed = JSON.parse(partText(part));
        if (Array.isArray(parsed)) {
          folderKeyPath = parsed
            .map((k) => String(k || "").trim())
            .filter(Boolean);
        }
      } catch {
        /* ignore invalid JSON */
      }
    } else if (name === "categoryLabel") {
      const v = partText(part);
      if (v) categoryLabel = v;
    } else if (name === "toParentEdgeType") {
      const v = partText(part);
      if (v) toParentEdgeType = v;
    } else if (name === "files") {
      remoteFileEntries = parseRemoteFilesJson(partText(part));
    }
  }

  return {
    fileParts,
    remoteFileEntries,
    folderId: folderId || null,
    folderKeyPath,
    categoryLabel,
    toParentEdgeType,
  };
}

function collectRemoteFileEntriesFromBody(
  body: Record<string, unknown>,
): RemoteFileEntry[] {
  return normalizeRemoteFileEntries(body.files);
}

function errorMessage(error: unknown): string {
  if (error instanceof APIError) return error.message;
  if (error instanceof Error) return error.message;
  return "Upload failed";
}

function emptyUploadResult() {
  return {
    graph: {
      edges: {} as Record<string, unknown>,
      vertexes: {} as Record<string, unknown>,
    },
    result: [] as unknown[],
  };
}

function mergeUploadResults(
  uploads: Array<{
    graph: {
      edges: Record<string, unknown>;
      vertexes: Record<string, unknown>;
    };
    result: unknown;
  }>,
) {
  if (uploads.length === 0) return emptyUploadResult();
  if (uploads.length === 1) return uploads[0];

  const merged = emptyUploadResult();
  for (const upload of uploads) {
    Object.assign(merged.graph.edges, upload.graph.edges);
    Object.assign(merged.graph.vertexes, upload.graph.vertexes);
    if (Array.isArray(upload.result)) {
      merged.result.push(...upload.result);
    } else if (upload.result != null) {
      merged.result.push(upload.result);
    }
  }
  return merged;
}

/**
 * Download + finalize remote files independently.
 * Continues after per-file failures and reports them in `uploads`.
 */
export async function uploadRemoteFileEntries(
  entries: RemoteFileEntry[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
  folderKeyPath?: string[] | null,
) {
  if (entries.length === 0) {
    throw new APIError("No remote URL provided", 400);
  }

  const settled = await Promise.allSettled(
    entries.map(async (entry) => {
      const downloaded = await downloadRemoteFile(entry.url, {
        fileName: entry.fileName,
      });
      const uploaded = await finalizeFileUpload({
        data: downloaded.data,
        filename: downloaded.fileName,
        mimeType: downloaded.mimeType,
        subDomain,
        neo4jSession,
        linkUserUuid,
        folderKeyPath,
      });
      return { entry, downloaded, uploaded };
    }),
  );

  const itemResults: RemoteUploadItemResult[] = [];
  const successfulUploads: Array<{
    graph: {
      edges: Record<string, unknown>;
      vertexes: Record<string, unknown>;
    };
    result: unknown;
  }> = [];

  for (let i = 0; i < settled.length; i++) {
    const entry = entries[i];
    const outcome = settled[i];
    if (outcome.status === "fulfilled") {
      const { downloaded, uploaded } = outcome.value;
      successfulUploads.push(uploaded);
      itemResults.push({
        ok: true,
        url: entry.url,
        fileName: downloaded.fileName,
        result: uploaded.result,
      });
    } else {
      itemResults.push({
        ok: false,
        url: entry.url,
        fileName: entry.fileName || undefined,
        error: errorMessage(outcome.reason),
      });
    }
  }

  const merged = mergeUploadResults(successfulUploads);
  const successCount = itemResults.filter((item) => item.ok).length;
  const failureCount = itemResults.length - successCount;

  return {
    ...merged,
    uploads: itemResults,
    successCount,
    failureCount,
  };
}

export async function uploadFiles(
  data: (MultipartPart & { label?: string })[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
  folderKeyPath?: string[] | null,
) {
  const fileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file) {
        return null;
      }
      const { data: fileData, filename, type, ...others } = file;
      if (!filename) {
        return null;
      }

      const uploaded = await finalizeFileUpload({
        data: fileData,
        filename,
        mimeType: type,
        subDomain,
        neo4jSession,
        linkUserUuid,
        label: others.label,
        folderKeyPath,
      });

      return uploaded;
    }),
  );

  const uploads = fileNodes.filter((node) => node !== null);
  return mergeUploadResults(uploads);
}

export async function uploadFilesWithFolderOptions(
  data: MultipartPart[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
) {
  const extracted = extractUploadFolderOptions(data);
  const remoteEntries = extracted.remoteFileEntries;
  const folderKeyPath = await resolveUploadFolderKeyPath(neo4jSession, {
    folderId: extracted.folderId,
    folderKeyPath: extracted.folderKeyPath,
    categoryLabel: extracted.categoryLabel,
    toParentEdgeType: extracted.toParentEdgeType,
  });

  if (extracted.fileParts.length === 0 && remoteEntries.length === 0) {
    throw new APIError("No file or remote URL provided", 400);
  }

  if (extracted.fileParts.length === 0) {
    return uploadRemoteFileEntries(
      remoteEntries,
      subDomain,
      neo4jSession,
      linkUserUuid,
      folderKeyPath,
    );
  }

  const localResult = await uploadFiles(
    extracted.fileParts,
    subDomain,
    neo4jSession,
    linkUserUuid,
    folderKeyPath,
  );

  if (remoteEntries.length === 0) {
    return localResult;
  }

  const remoteResult = await uploadRemoteFileEntries(
    remoteEntries,
    subDomain,
    neo4jSession,
    linkUserUuid,
    folderKeyPath,
  );

  const merged = mergeUploadResults([localResult, remoteResult]);
  return {
    ...merged,
    uploads: remoteResult.uploads,
    successCount:
      (Array.isArray(localResult.result) ? localResult.result.length : 0) +
      remoteResult.successCount,
    failureCount: remoteResult.failureCount,
  };
}

/**
 * Upload by downloading remote URLs (JSON body).
 * Accepts: { files: [{ url, fileName? }, ...], folder options... }
 */
export async function uploadFromRemoteUrlOptions(
  body: Record<string, unknown>,
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
) {
  const remoteEntries = collectRemoteFileEntriesFromBody(body);
  if (remoteEntries.length === 0) {
    throw new APIError(
      'No remote files provided. Expected { files: [{ url, fileName? }] }',
      400,
    );
  }

  const folderKeyPath = await resolveUploadFolderKeyPath(neo4jSession, {
    folderId: typeof body.folderId === "string" ? body.folderId : null,
    folderKeyPath: Array.isArray(body.folderKeyPath)
      ? body.folderKeyPath.map((k) => String(k || "").trim()).filter(Boolean)
      : null,
    categoryLabel:
      typeof body.categoryLabel === "string" ? body.categoryLabel : undefined,
    toParentEdgeType:
      typeof body.toParentEdgeType === "string"
        ? body.toParentEdgeType
        : undefined,
  });

  return uploadRemoteFileEntries(
    remoteEntries,
    subDomain,
    neo4jSession,
    linkUserUuid,
    folderKeyPath,
  );
}
