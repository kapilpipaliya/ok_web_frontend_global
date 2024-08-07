import type { Record } from "neo4j-driver";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/convertNodeToJson";

import type { ContextType } from "../../types/ContextType";

export function processResult(
  records: Record[],
  context: ContextType,
  nodeLabel: string,
  typeLabel?: string,
  _inward?: boolean,
) {
  const vertices = records.map((record) =>
    convertNodeToJson(record.get(nodeLabel)),
  );
  const relationships = [];
  if (typeLabel) {
    for (const record of records) {
      const relationshipData = record.get(typeLabel);
      if (Array.isArray(relationshipData)) {
        for (const relationship of relationshipData) {
          relationships.push(convertRelationshipToJson(relationship));
        }
      } else {
        relationships.push(convertRelationshipToJson(relationshipData));
      }
    }
  }

  if (context.nodes) {
    for (const vertex of vertices) {
      context.nodes[vertex.id] = vertex;
    }
  }

  if (context.relationships) {
    for (const relationship of relationships) {
      updateNodeRelations(context, relationship);
      context.relationships[relationship.id] = relationship;
    }
  }

  return vertices;
}

function updateNodeRelations(context: ContextType, relationship: any) {
  if (!context.nodes) {
    return;
  }

  if (context.nodes[relationship.S]) {
    if (!context.nodes[relationship.S].OUT[relationship.T]) {
      context.nodes[relationship.S].OUT[relationship.T] = [];
    }
    context.nodes[relationship.S].OUT[relationship.T].push(relationship.id);
  }

  if (context.nodes[relationship.E]) {
    if (!context.nodes[relationship.E].IN[relationship.T]) {
      context.nodes[relationship.E].IN[relationship.T] = [];
    }
    context.nodes[relationship.E].IN[relationship.T].push(relationship.id);
  }
}
