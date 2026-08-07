import type { Session, Transaction } from "neo4j-driver";

import type { MultipartPart } from "~/lib/http/multipart";
import { resolveUploadFolderKeyPath } from "~/lib/files/folderOrganize";

import { finalizeFileUpload } from "./finalizeFileUpload";

function partText(part: MultipartPart | undefined): string {
  if (!part?.data) return "";
  return Buffer.from(part.data).toString("utf8").trim();
}

export function extractUploadFolderOptions(data: MultipartPart[]) {
  let folderId = "";
  let folderKeyPath: string[] | null = null;
  let categoryLabel = "Folder";
  let toParentEdgeType = "ParentFolder";
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
    }
  }

  return {
    fileParts,
    folderId: folderId || null,
    folderKeyPath,
    categoryLabel,
    toParentEdgeType,
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
  if (uploads.length === 0) {
    return {
      graph: { edges: {}, vertexes: {} },
      result: [],
    };
  }

  if (uploads.length === 1) {
    return uploads[0];
  }

  const merged = {
    graph: {
      edges: {} as Record<string, unknown>,
      vertexes: {} as Record<string, unknown>,
    },
    result: [] as unknown[],
  };

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

export async function uploadFilesWithFolderOptions(
  data: MultipartPart[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
) {
  const extracted = extractUploadFolderOptions(data);
  const folderKeyPath = await resolveUploadFolderKeyPath(neo4jSession, {
    folderId: extracted.folderId,
    folderKeyPath: extracted.folderKeyPath,
    categoryLabel: extracted.categoryLabel,
    toParentEdgeType: extracted.toParentEdgeType,
  });
  return uploadFiles(
    extracted.fileParts,
    subDomain,
    neo4jSession,
    linkUserUuid,
    folderKeyPath,
  );
}
