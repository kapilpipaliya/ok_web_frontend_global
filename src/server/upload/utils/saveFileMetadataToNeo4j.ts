import type { Session } from "neo4j-driver";

export async function saveFileMetadataToNeo4j(
  dbSession: Session,
  properties: Record<string, any>,
  fileId?: string,
) {
  try {
    let query;
    if (fileId) {
      // Update existing file node
      query = `
        MATCH (f:File)
        WHERE elementId(f) = $fileId 
        SET f = $properties
        RETURN f
      `;
      const result = await dbSession.run(query, { fileId, properties });
      return result.records[0];
    }
    // Create new file node
    query = "CREATE (f:File) SET f = $properties RETURN f";
    const result = await dbSession.run(query, { properties });
    return result.records[0];
  } catch (error) {
    console.error("Error saving file metadata to Neo4j:", error);
    throw error;
  }
}
