import type {APIEvent} from "@solidjs/start/dist/server";

import fs from "node:fs/promises";
import path from "node:path";
import {type HTTPEvent, getQuery, readMultipartFormData} from "vinxi/http";

import { processResult } from "~/cypher/get/evaluate/processResult";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {calculateChecksum} from "~/routes/api/upload/calculateChecksum";
import {ensureDirectoryExists} from "~/routes/api/upload/ensureDirectoryExists";
import {getFileMetadataFromNeo4j, saveFileMetadataToNeo4j} from "~/routes/api/upload/saveFileMetadataToNeo4j";
import {saveFileToDisk} from "~/routes/api/upload/saveFileToDisk";
import {getSubDomain} from "~/server/getSubDomain";

export async function POST({ request }: APIEvent, event: HTTPEvent) {
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
    return { error: "No file data available" };
  }

  const fileNodes = await Promise.all(data.map(async (file) => {
    if (!file?.filename) return null;
    const { ext, name } = path.parse(file.filename);
    const newFilename = `${name}_${currentDate}${ext}`;
    const filePath = saveFileToDisk(userDir, newFilename, file.data);
    const fileSize = file.data.length;
    const mimeType = file.type;
    const checksum = calculateChecksum(file.data);

    const metadata = {
      checksum,
      // fileId,
      fileSize,
      filename: newFilename,
      filepath: filePath,
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

export async function GET({ request }: APIEvent, event: HTTPEvent) {
  const query = getQuery(event);
  const fileId = query.fileId;
  const neo4jSession = await getSessionForSubdomain(request);

  if (!fileId) {
    return new Response(JSON.stringify({ error: "File ID is required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const fileMetadata = await getFileMetadataFromNeo4j(neo4jSession, fileId as string);

  if (!fileMetadata) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  // console.log(fileMetadata);

  try {
    const filePath = (fileMetadata.P.filepath);
    const fileData = await fs.readFile(filePath);

    // Ensure the filename is safe for headers
    const filename = encodeURIComponent(fileMetadata.P.originalFilename);

    return new Response(fileData, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": fileMetadata.P.mimeType,
      },
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Error reading file from disk" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
