import type { Session } from "neo4j-driver";
import type { CollectedData } from "../types";

export async function fetchPageUnique(
  dbSession: Session,
  pageKey: string,
): Promise<CollectedData> {
  const result = await dbSession.run(
    `
    MATCH (p:Page {key: $key})
    OPTIONAL MATCH (p)-[uniqueRel:PageUnique]->(pu:PageUnique)
    RETURN 
      collect(pu) as pageUniques,
      collect(uniqueRel) as uniqueRels
  `,
    { key: pageKey },
  );

  if (result.records.length === 0) {
    return { vertices: [], edges: [] };
  }

  const record = result.records[0];
  const vertices = (record.get("pageUniques") || []).filter(Boolean);
  const edges = (record.get("uniqueRels") || []).filter(Boolean);

  return { vertices, edges };
}
