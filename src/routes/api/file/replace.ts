import type { APIEvent } from "@solidjs/start/dist/server";
import type { HTTPEvent } from "vinxi/runtime/http-types";

import path from "node:path";
import { readMultipartFormData } from "vinxi/runtime/http-types";

import { processResult } from "~/cypher/get/evaluate/processResult";
import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { calculateChecksum } from "~/routes/api/upload/calculateChecksum";
import { ensureDirectoryExists } from "~/routes/api/upload/ensureDirectoryExists";
import { getFileMetadataFromNeo4j, saveFileMetadataToNeo4j} from "~/routes/api/upload/saveFileMetadataToNeo4j";
import { saveFileToDisk } from "~/routes/api/upload/saveFileToDisk";
import { getSubDomain } from "~/server/getSubDomain";

export async function PUT({ request }: APIEvent, event: HTTPEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const neo4jSession = await getSessionForSubdomain(request);
  const data = await readMultipartFormData(event);

  if (!data || data.length === 0) {
    return { error: "No file data available" };
  }

  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split('T')[0].split('-');
  const userDir = path.join("/Users/ankit", subdomain, year, month, day);

  ensureDirectoryExists(userDir);

  const query = new URL(request.url).searchParams;
  const fileId = query.get('fileId');
  if (!fileId) {
    return { error: "fileId is required" };
  }

  const oldFileMetadata = await getFileMetadataFromNeo4j(neo4jSession, fileId);
  if (!oldFileMetadata) {
    return { error: "File metadata not found for the provided fileId" };
  }

  const newFileNodes = await Promise.all(data.map(async (file) => {
    if (!file?.filename) return null;

    const { ext, name } = path.parse(file.filename);
    const newVersion = (oldFileMetadata.P.version || 0) + 1;
    const newFilename = `${name}_v${newVersion}_${currentDate}${ext}`;
    const filePath = saveFileToDisk(userDir, newFilename, file.data);
    const fileSize = file.data.length;
    const mimeType = file.type;
    const checksum = calculateChecksum(file.data);

    const newMetadata = {
      checksum,
      fileSize,
      filename: newFilename,
      filepath: filePath,
      mimeType,
      originalFilename: file.filename,
      subdomain,
      version: newVersion,
    };

    return await saveFileMetadataToNeo4j(neo4jSession, newMetadata);
  }));

  const context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
  };
  const result = processResult(newFileNodes.filter(node => node !== null), context, "f");
  return {
    graph: {
      edges: context.relationships!,
      vertexes: context.nodes!,
    },
    result,
  };
}
