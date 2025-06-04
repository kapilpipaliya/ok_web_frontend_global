import type { Node, Session } from "neo4j-driver";
import type { CollectedData } from "../types";

export async function fetchAttrSrcFiles(
  dbSession: Session,
  attrNodes: Node[],
): Promise<CollectedData> {
  if (attrNodes.length === 0) {
    return { vertices: [], edges: [] };
  }

  const attrIds = attrNodes.map((n) => n.elementId);

  // Fetch AttrSrc relationships and related File nodes
  const result = await dbSession.run(
    `
    MATCH (n)
    WHERE elementId(n) IN $attrIds
    OPTIONAL MATCH (n)-[srcRel:AttrSrc]->(file:File)
    WHERE srcRel IS NOT NULL
    RETURN 
      collect(DISTINCT file) as files,
      collect(DISTINCT srcRel) as srcRels
  `,
    { attrIds },
  );

  if (result.records.length === 0) {
    return { vertices: [], edges: [] };
  }

  const record = result.records[0];
  const files = record.get("files") || [];
  const srcRels = record.get("srcRels") || [];

  return {
    vertices: files.filter(Boolean),
    edges: srcRels.filter(Boolean),
  };
}
