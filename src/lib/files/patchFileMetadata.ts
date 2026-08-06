import type { Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Patch File properties without replacing the entire property map.
 * Prefer this over `SET f = $properties` for worker/lifecycle updates.
 */
export async function patchFileMetadata(
  session: Session | Transaction,
  fileId: string,
  properties: Record<string, unknown>,
  options?: { label?: string },
): Promise<Vertex | null> {
  const label = options?.label || "File";
  const result = await session.run(
    `
    MATCH (f:${label})
    WHERE elementId(f) = $fileId
    SET f += $properties,
        f.updatedAt = datetime()
    RETURN f
    `,
    { fileId, properties },
  );
  if (result.records.length === 0) return null;
  return convertNodeToJson(result.records[0].get("f")) as Vertex;
}

export async function loadFileVertexById(
  session: Session | Transaction,
  fileId: string,
): Promise<Vertex | null> {
  const result = await session.run(
    `
    MATCH (f:File)
    WHERE elementId(f) = $fileId
    RETURN f
    LIMIT 1
    `,
    { fileId },
  );
  if (result.records.length === 0) return null;
  return convertNodeToJson(result.records[0].get("f")) as Vertex;
}
