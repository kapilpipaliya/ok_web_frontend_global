// Function to save file metadata to Neo4j
import {type Session, int} from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function saveFileMetadataToNeo4j(session: Session, properties: Record<string, any>) {
  try {
    const query = `CREATE (f:File) set f = $properties RETURN f`;
    const result = await session.run(query, {properties});
    return result.records[0];
  } finally {
    await session.close();
  }
}

export async function getFileMetadataFromNeo4j(session: Session, fileId: string) {
  const query = `MATCH (f:File) WHERE id(f) = $fileId RETURN f`; // WHERE f.subdomain = $subdomain AND
  const result = await session.run(query, {fileId: int(fileId)});
  return convertNodeToJson(result.records[0].get("f"));
}