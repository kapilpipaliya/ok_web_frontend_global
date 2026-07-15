import type { MultiPartData } from "h3";
import type { Session, Transaction } from "neo4j-driver";

import { finalizeFileUpload } from "./finalizeFileUpload";

export async function uploadFiles(
  data: (MultiPartData & { label?: string })[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
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
      });

      // Preserve previous shape: callers expect { graph, result } once for all files.
      // Collect records via result array entries.
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

// File Repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FileRepository.kt
// implement other API like move, update etc..

// folder repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FolderRepository.kt
