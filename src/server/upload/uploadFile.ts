import type { Transaction } from "neo4j-driver";
import type { Session } from "neo4j-driver";
import type { MultiPartData } from "vinxi/runtime/http-types";

import path from "node:path";

import { processResult } from "~/cypher/get/evaluate/processResult";
import { calculateChecksum } from "~/server/upload/utils/calculateChecksum";
import { ensureDirectoryExists } from "~/server/upload/utils/ensureDirectoryExists";
import { saveFileMetadataToNeo4j } from "~/server/upload/utils/saveFileMetadataToNeo4j";
import { saveFileToDisk } from "~/server/upload/utils/saveFileToDisk";

import { getBaseDir } from "./getBaseDir";

export async function uploadFiles(
  data: (MultiPartData & { label?: string })[],
  subDomain: string,
  neo4jSession: Session | Transaction,
) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);

  ensureDirectoryExists(userDir);

  const fileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file) {
        return null;
      }
      const { data, filename, name: _, type, ...others } = file;
      if (!filename) {
        return null;
      }
      const { ext, name } = path.parse(filename);
      const timestamp = currentDate.replace(/[:.]/g, "-"); // Replace colons and dots with dashes for filename
      const newFilename = `${name}_${timestamp}${ext}`;
      const filePath = saveFileToDisk(userDir, newFilename, data);
      const fileSize = data.length;
      const mimeType = type;
      const checksum = calculateChecksum(data);

      const metadata = {
        checksum,
        fileName: newFilename,
        filePath: filePath,
        // fileId,
        fileSize,
        mimeType,
        originalFileName: filename,
        subDomain,
        // username,
      };

      return await saveFileMetadataToNeo4j(neo4jSession, metadata, undefined, others.label);
    }),
  );

  const context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
  };

  const result = processResult(
    fileNodes.filter((node) => node !== null),
    context,
    "f",
  );

  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result,
  };
}

// File Repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FileRepository.kt
// implement other API like move, update etc..

// folder repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FolderRepository.kt
