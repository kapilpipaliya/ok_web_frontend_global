import type { Session } from "neo4j-driver";
import type { CollectedData } from "../types";

export async function fetchComponentVariants(
  dbSession: Session,
  componentKey: string,
): Promise<CollectedData> {
  const result = await dbSession.run(
    `
    MATCH (c:Component {key: $key})
    OPTIONAL MATCH (c)-[variantRel:ComponentVariant]->(cv:ComponentVariant)
    OPTIONAL MATCH (cv)-[optionRel:ComponentVariantOption]->(cvo:ComponentVariantOption)
    RETURN 
      collect(DISTINCT cv) as variants,
      collect(DISTINCT cvo) as options,
      collect(DISTINCT variantRel) as variantRels,
      collect(DISTINCT optionRel) as optionRels
  `,
    { key: componentKey },
  );

  if (result.records.length === 0) {
    return { vertices: [], edges: [] };
  }

  const record = result.records[0];
  const vertices = [
    ...(record.get("variants") || []),
    ...(record.get("options") || []),
  ].filter(Boolean);

  const edges = [
    ...(record.get("variantRels") || []),
    ...(record.get("optionRels") || []),
  ].filter(Boolean);

  return { vertices, edges };
}
