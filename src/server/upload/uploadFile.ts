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
  data: MultiPartData[],
  subDomain: string,
  neo4jSession: Session,
) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);

  ensureDirectoryExists(userDir);

  const fileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file?.filename) {
        return null;
      }
      const { ext, name } = path.parse(file.filename);
      const timestamp = currentDate.replace(/[:.]/g, "-"); // Replace colons and dots with dashes for filename
      const newFilename = `${name}_${timestamp}${ext}`;
      const filePath = saveFileToDisk(userDir, newFilename, file.data);
      const fileSize = file.data.length;
      const mimeType = file.type;
      const checksum = calculateChecksum(file.data);

      const metadata = {
        checksum,
        filename: newFilename,
        filepath: filePath,
        // fileId,
        fileSize,
        mimeType,
        originalFilename: file.filename,
        subDomain,
        // username,
      };

      return await saveFileMetadataToNeo4j(neo4jSession, metadata);
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
