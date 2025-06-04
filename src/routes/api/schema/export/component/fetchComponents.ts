import type { Session } from "neo4j-driver";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";
import { collectComponentData } from "./collectComponentData";

export async function fetchComponents(
  dbSession: Session,
): Promise<Record<string, ExportedSchema>> {
  const result = await dbSession.run(`
    MATCH (c:Component)
    RETURN c.key as key
    ORDER BY c.key
  `);

  const components: Record<string, ExportedSchema> = {};

  for (const record of result.records) {
    const componentKey = record.get("key");
    if (!componentKey) continue;

    const data = await collectComponentData(dbSession, componentKey);

    // Convert nodes and relationships
    const convertedVertices = data.vertices.map((v) => convertNodeToJson(v));
    const convertedEdges = data.edges.map((e) => convertRelationshipToJson(e));

    components[componentKey] = {
      vertexes: convertedVertices.map((v) => ({
        id: v.id,
        L: v.L[0], // Take the first label
        P: v.P,
      })),
      edges: convertedEdges,
    };
  }

  return components;
}
