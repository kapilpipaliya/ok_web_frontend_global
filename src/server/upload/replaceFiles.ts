import type { Session } from "neo4j-driver";
import type { MultiPartData } from "vinxi/runtime/http-types";

import path from "node:path";

import { processResult } from "~/cypher/get/evaluate/processResult";
import { calculateChecksum } from "~/server/upload/utils/calculateChecksum";
import { ensureDirectoryExists } from "~/server/upload/utils/ensureDirectoryExists";
import { getFileMetadataFromNeo4j } from "~/server/upload/utils/getFileMetadataFromNeo4j";
import { saveFileMetadataToNeo4j } from "~/server/upload/utils/saveFileMetadataToNeo4j";
import { saveFileToDisk } from "~/server/upload/utils/saveFileToDisk";

import { getBaseDir } from "./getBaseDir";

export async function replaceFiles(
  request: Request,
  data: MultiPartData[],
  neo4jSession: Session,
  subDomain: string,
) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);

  ensureDirectoryExists(userDir);

  const query = new URL(request.url).searchParams;
  const fileId = query.get("fileId");
  if (!fileId) {
    return { error: "fileId is required" };
  }

  const oldFileMetadata = await getFileMetadataFromNeo4j(neo4jSession, fileId);
  if (!oldFileMetadata) {
    return { error: "File metadata not found for the provided fileId" };
  }

  const newFileNodes = await Promise.all(
    data.map(async (file) => {
      if (!file?.filename) {
        return null;
      }

      const { ext, name } = path.parse(file.filename);
      const newVersion = (oldFileMetadata.P.version || 0) + 1;
      const newFilename = `${name}_v${newVersion}_${currentDate}${ext}`;
      const filePath = saveFileToDisk(userDir, newFilename, file.data);
      const fileSize = file.data.length;
      const mimeType = file.type;
      const checksum = calculateChecksum(file.data);

      const newMetadata = {
        checksum,
        filename: newFilename,
        filepath: filePath,
        fileSize,
        mimeType,
        originalFilename: file.filename,
        subDomain,
        version: newVersion,
      };

      return await saveFileMetadataToNeo4j(neo4jSession, newMetadata);
    }),
  );

  const context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
  };
  const result = processResult(
    newFileNodes.filter((node) => node !== null),
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
