import type {Session} from "neo4j-driver";

import {int} from "neo4j-driver";

export async function deleteFileMetadataFromNeo4j(
  session: Session,
  fileId: string,
) {
  try {
    const query = "MATCH (f:File) WHERE id(f) = $fileId DELETE f";
    await session.run(query, {fileId: int(fileId)});
  } catch (error) {
    console.error("Error deleting file metadata from Neo4j:", error);
    throw error;
  }
}