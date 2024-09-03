import type { Session } from "neo4j-driver";

import { types } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/convertNodeToJson";

export async function fetchFromMGAndSaveToArray(
  dbSession: Session,
  query: string,
  params: Record<string, unknown>,
  nodeObj: Record<string, Vertex>,
  relationshipObj: Record<string, Edge>,
): Promise<void> {
  try {
    const result = await dbSession.run(query, params);
    for (const record of result.records) {
      record.forEach((value) => {
        if (value instanceof types.Node) {
          const id = value.elementId;
          nodeObj[id] = convertNodeToJson(value);
        } else if (value instanceof types.Relationship) {
          const id = value.elementId;
          relationshipObj[id] = convertRelationshipToJson(value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            const id = item.elementId;
            if (item instanceof types.Node) {
              nodeObj[id] = convertNodeToJson(item);
            } else if (item instanceof types.Relationship) {
              relationshipObj[id] = convertRelationshipToJson(item);
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to execute query:", query, "Error:", error);
    throw error;
  }
}
