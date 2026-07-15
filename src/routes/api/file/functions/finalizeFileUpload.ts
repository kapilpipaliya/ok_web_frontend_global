import type { Node, Session, Transaction } from "neo4j-driver";

import fs from "node:fs";
import path from "node:path";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { processResult } from "~/cypher/conversion/processResult";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import { calculateChecksum } from "~/lib/files/calculateChecksum";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { getBaseDir } from "~/lib/files/getBaseDir";
import { saveFileToDisk } from "~/lib/files/saveFileToDisk";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { saveFileMetadata } from "~/routes/api/file/functions/functions/saveFileMetadata";

export type FinalizeFileUploadInput = {
  data: Buffer;
  filename: string;
  mimeType?: string | null;
  subDomain: string;
  neo4jSession: Session | Transaction;
  linkUserUuid?: string | null;
  label?: string;
};

export async function assertFileNameAvailable(
  neo4jSession: Session | Transaction,
  filename: string,
  destinationPath: string,
) {
  if (fs.existsSync(destinationPath)) {
    throw new APIError(`File with name "${filename}" already exists`, 409);
  }

  const checkResult = await neo4jSession.run(
    `
      MATCH (f:File {fileName: $fileName})
      RETURN f
      LIMIT 1
    `,
    { fileName: filename },
  );

  if (checkResult.records.length > 0) {
    throw new APIError(
      `File with name "${filename}" already exists`,
      409,
    );
  }
}

export function buildDatedUserDir(subDomain: string) {
  const currentDate = new Date().toISOString();
  const [year, month, day] = currentDate.split("T")[0].split("-");
  const baseDir = getBaseDir();
  const userDir = path.join(baseDir, subDomain, year, month, day);
  ensureDirectoryExists(userDir);
  return userDir;
}

export async function finalizeFileUpload(input: FinalizeFileUploadInput) {
  const {
    data,
    filename,
    mimeType,
    subDomain,
    neo4jSession,
    linkUserUuid,
    label,
  } = input;

  if (!filename) {
    throw new Error("File name is required");
  }

  const userDir = buildDatedUserDir(subDomain);
  const filePath = path.join(userDir, filename);
  await assertFileNameAvailable(neo4jSession, filename, filePath);

  saveFileToDisk(userDir, filename, data);

  const metadata = {
    checksum: calculateChecksum(data),
    fileName: filename,
    filePath,
    fileSize: data.length,
    mimeType: mimeType || undefined,
    originalFileName: filename,
    subDomain,
    uploadDate: new Date().toISOString(),
  };

  const record = await saveFileMetadata(
    neo4jSession,
    metadata,
    undefined,
    label,
  );

  if (record && linkUserUuid) {
    try {
      const node = record.get("f");
      if (node) {
        const v = convertNodeToJson(node as Node);
        const fileId = v?.id;
        if (fileId) {
          await neo4jSession.run(
            `MATCH (u:User {uuid: $uuid})
             MATCH (f:File) WHERE elementId(f) = $fileId
             MERGE (u)-[r:UserFile]->(f)
             ON CREATE SET r.createdAt = datetime()`,
            { uuid: linkUserUuid, fileId },
          );
        }
      }
    } catch (e) {
      console.error("finalizeFileUpload: UserFile link failed", e);
    }
  }

  const context = {
    nodes: {} as Record<string, Vertex>,
    relationships: {} as Record<string, Edge>,
  };

  const result = processResult(
    record ? [record] : [],
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
