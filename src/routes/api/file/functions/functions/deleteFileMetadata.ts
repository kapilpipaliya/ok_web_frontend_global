import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function deleteFileMetadata(dbSession: Session, fileId: string) {
  try {
    const query =
      "MATCH (f:File) WHERE elementId(f) = $fileId DELETE f return f";
    const result = await dbSession.run(query, { fileId: fileId });
    if (result.records.length === 0) {
      return null;
    }
    return convertNodeToJson(result.records[0]?.get("f"));
  } catch (error) {
    console.error("Error deleting file metadata from Neo4j:", error);
    throw error;
  }
}
