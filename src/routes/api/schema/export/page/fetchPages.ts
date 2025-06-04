import type { Session } from "neo4j-driver";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";
import { collectPageData } from "./collectPageData";

export async function fetchPages(
  dbSession: Session,
): Promise<Record<string, ExportedSchema>> {
  const result = await dbSession.run(`
    MATCH (p:Page)
    RETURN p.key as key
    ORDER BY p.key
  `);

  const pages: Record<string, ExportedSchema> = {};

  for (const record of result.records) {
    const pageKey = record.get("key");
    if (!pageKey) continue;

    const data = await collectPageData(dbSession, pageKey);

    // Convert nodes and relationships
    const convertedVertices = data.vertices.map((v) => convertNodeToJson(v));
    const convertedEdges = data.edges.map((e) => convertRelationshipToJson(e));

    pages[pageKey] = {
      vertexes: convertedVertices.map((v) => ({
        id: v.id,
        L: v.L[0], // Take the first label
        P: v.P,
      })),
      edges: convertedEdges,
    };
  }

  return pages;
}
