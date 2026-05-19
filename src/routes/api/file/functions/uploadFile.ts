import type { MultiPartData } from "h3";
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
import { saveFileMetadata } from "~/routes/api/file/functions/functions/saveFileMetadata";

export async function uploadFiles(
  data: (MultiPartData & { label?: string })[],
  subDomain: string,
  neo4jSession: Session | Transaction,
  linkUserUuid?: string | null,
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
      const { data, filename, type, ...others } = file;
      if (!filename) {
        return null;
      }

      // Use original filename without timestamp
      const newFilename = filename;
      const filePath = path.join(userDir, newFilename);

      // Check if file already exists on disk
      if (fs.existsSync(filePath)) {
        throw new Error(`File with name "${filename}" already exists`);
      }

      // Check if file with same name exists in database
      const checkQuery = `
        MATCH (f:File {fileName: $fileName})
        RETURN f
        LIMIT 1
      `;
      const checkResult = await neo4jSession.run(checkQuery, {
        fileName: newFilename,
      });

      if (checkResult.records.length > 0) {
        throw new Error(
          `File with name "${filename}" already exists in database`,
        );
      }

      // Save file to disk
      saveFileToDisk(userDir, newFilename, data);

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

      const record = await saveFileMetadata(
        neo4jSession,
        metadata,
        undefined,
        others.label,
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
          console.error("uploadFiles: UserFile link failed", e);
        }
      }
      return record;
    }),
  );

  const context = {
    nodes: {} as Record<string, Vertex>,
    relationships: {} as Record<string, Edge>,
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
