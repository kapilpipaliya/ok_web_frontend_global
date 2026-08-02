import type { Session, Transaction } from "neo4j-driver";

import { resolveUploadFolderKeyPath } from "~/lib/files/folderOrganize";

import { finalizeFileUpload } from "./finalizeFileUpload";

export function extractUploadFolderOptions(formData: FormData) {
  let folderId = "";
  let folderKeyPath: string[] | null = null;
  let categoryLabel = "Folder";
  let toParentEdgeType = "ParentFolder";
  const fileParts: File[] = [];

  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.name) {
        fileParts.push(value);
      }
      continue;
    }
    if (name === "folderId") {
      folderId = String(value).trim();
    } else if (name === "folderKeyPath") {
      try {
        const parsed = JSON.parse(String(value).trim());
        if (Array.isArray(parsed)) {
          folderKeyPath = parsed
            .map((k) => String(k || "").trim())
            .filter(Boolean);
        }
      } catch {
        /* ignore invalid JSON */
      }
    } else if (name === "categoryLabel") {
      const v = String(value).trim();
      if (v) categoryLabel = v;
    } else if (name === "toParentEdgeType") {
      const v = String(value).trim();
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
  data: File[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
  folderKeyPath?: string[] | null,
) {
  const fileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file?.name) {
        return null;
      }

      const uploaded = await finalizeFileUpload({
        data: Buffer.from(await file.arrayBuffer()),
        filename: file.name,
        mimeType: file.type,
        subDomain,
        neo4jSession,
        linkUserUuid,
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
  formData: FormData,
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
) {
  const extracted = extractUploadFolderOptions(formData);
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
