import type { Session } from "neo4j-driver";

import { int } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function getFileMetadataFromNeo4j(
  dbSession: Session,
  fileId: string,
) {
  try {
    const query = "MATCH (f:File) WHERE elementId(f) = $fileId RETURN f";
    const result = await dbSession.run(query, { fileId: fileId });
    return convertNodeToJson(result.records[0].get("f"));
  } catch (error) {
    console.error("Error retrieving file metadata from Neo4j:", error);
    throw error;
  }
}
