import type { Record } from "neo4j-driver";

import { convertNodeToJson, convertRelationshipToJson } from "~/cypher/convertNodeToJson";

import type { ContextType } from "../../types/ContextType";

export function processResult(
  records: Record[],
  context: ContextType,
  nodeLabel: string,
  typeLabel?: string,
  _inward?: boolean,
) {
  const vertices = records.map((record) => convertNodeToJson(record.get(nodeLabel)));
  const relationships = typeLabel ? records.map((record) => convertRelationshipToJson(record.get(typeLabel))) : [];

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
  if (!context.nodes) { return; }

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
