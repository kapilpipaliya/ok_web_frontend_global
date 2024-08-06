import { int, type Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function saveFileMetadataToNeo4j(session: Session, properties: Record<string, any>) {
  try {
    const query = 'CREATE (f:File) SET f = $properties RETURN f';
    const result = await session.run(query, { properties });
    return result.records[0];
  } catch (error) {
    console.error("Error saving file metadata to Neo4j:", error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function getFileMetadataFromNeo4j(session: Session, fileId: string) {
  try {
    const query = 'MATCH (f:File) WHERE id(f) = $fileId RETURN f';
    const result = await session.run(query, { fileId: int(fileId) });
    return convertNodeToJson(result.records[0].get("f"));
  } catch (error) {
    console.error("Error retrieving file metadata from Neo4j:", error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function deleteFileMetadataFromNeo4j(session: Session, fileId: string) {
  try {
    const query = 'MATCH (f:File) WHERE id(f) = $fileId DELETE f';
    await session.run(query, { fileId: int(fileId) });
  } catch (error) {
    console.error("Error deleting file metadata from Neo4j:", error);
    throw error;
  } finally {
    await session.close();
  }
}
