import type { Session } from "neo4j-driver";

import { types } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";

import { updateNodeRelations } from "./updateRelations";

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
      for (const value of record) {
        if (value instanceof types.Node) {
          const id = value.elementId;
          nodeObj[id] = convertNodeToJson(value);
        } else if (value instanceof types.Relationship) {
          const id = value.elementId;
          const convertedRel = convertRelationshipToJson(value);
          relationshipObj[id] = convertedRel;
          updateNodeRelations(nodeObj, convertedRel);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            const id = item.elementId;
            if (item instanceof types.Node) {
              nodeObj[id] = convertNodeToJson(item);
            } else if (item instanceof types.Relationship) {
              const convertedRel = convertRelationshipToJson(item);
              relationshipObj[id] = convertedRel;
              updateNodeRelations(nodeObj, convertedRel);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to execute query:", query, "Error:", error);
    throw error;
  }
}
