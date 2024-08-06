import type {APIEvent} from "@solidjs/start/dist/server";
import type {HTTPEvent} from "vinxi/runtime/http-types";

import path from "node:path";
import {readMultipartFormData} from "vinxi/http";

import {processResult} from "~/cypher/get/evaluate/processResult";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {calculateChecksum} from "~/routes/api/upload/calculateChecksum";
import {ensureDirectoryExists} from "~/routes/api/upload/ensureDirectoryExists";
import {saveFileMetadataToNeo4j} from "~/routes/api/upload/saveFileMetadataToNeo4j";
import {saveFileToDisk} from "~/routes/api/upload/saveFileToDisk";
import {getSubDomain} from "~/server/getSubDomain";

export async function POST({request}: APIEvent, event: HTTPEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const neo4jSession = await getSessionForSubdomain(request);
  // const query = getQuery(event);
  // const fileId = query.name;
  const data = await readMultipartFormData(event);

  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split('T')[0].split('-');
  const userDir = path.join("/Users/ankit", subdomain, year, month, day);

  ensureDirectoryExists(userDir);

  if (!data || data.length === 0) {
    return {error: "No file data available"};
  }

  const fileNodes = await Promise.all(data.map(async (file) => {
    if (!file?.filename) { return null; }
    const {ext, name} = path.parse(file.filename);
    const newFilename = `${name}_${currentDate}${ext}`;
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
      subdomain,
      // username,
    };

    return await saveFileMetadataToNeo4j(neo4jSession, metadata);
  }));

  const context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
  };
  const result = processResult(fileNodes.filter(node => node !== null), context, "f");
  return {
    graph: {
      edges: context.relationships!,
      vertexes: context.nodes!,
    },
    result,
  };
}

// File Repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FileRepository.kt
// implement other API like move, update etc..

// folder repository:
// https://github.com/massigerardi/File-Manager-Demo/blob/development/src/main/kotlin/com/example/FileManager/repositories/FolderRepository.kt
