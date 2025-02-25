import type { Session } from "neo4j-driver";

export async function deleteFileMetadata(dbSession: Session, fileId: string) {
  try {
    const query = "MATCH (f:File) WHERE elementId(f) = $fileId DELETE f";
    await dbSession.run(query, { fileId: fileId });
  } catch (error) {
    console.error("Error deleting file metadata from Neo4j:", error);
    throw error;
  }
}
