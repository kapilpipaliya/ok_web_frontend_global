import type { Record } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/convertNodeToJson";

import type { ContextType } from "../../types/ContextType";

export function processResult(
  records: Record[],
  context: ContextType,
  nodeLabel: string | string[],
  typeLabel?: string,
) {
  const vertices: Vertex[] = [];
  const labels = Array.isArray(nodeLabel) ? nodeLabel : [nodeLabel];
  const { nodes, relationships: relationshipMap } = context;

  for (const record of records) {
    // Process nodes
    for (const label of labels) {
      const vertex = convertNodeToJson(record.get(label));
      vertices.push(vertex);
      if (nodes) {
        nodes[vertex.id] = vertex;
      }
    }

    // Process relationships
    if (!typeLabel) continue;

    const relationshipData = record.get(typeLabel);
    const relationships = Array.isArray(relationshipData) 
      ? relationshipData 
      : relationshipData ? [relationshipData] : [];

    for (const relationship of relationships) {
      const convertedRel = convertRelationshipToJson(relationship);
      if (relationshipMap) {
        updateNodeRelations(context, convertedRel);
        relationshipMap[convertedRel.id] = convertedRel;
      }
    }
  }

  return vertices;
}

function updateNodeRelations(context: ContextType, relationship: Edge) {
  if (!context.nodes) {
    return;
  }

  const sourceNode = context.nodes[relationship.S];
  if (sourceNode) {
    if (!sourceNode.OUT[relationship.T]) {
      sourceNode.OUT[relationship.T] = [];
    }
    sourceNode.OUT[relationship.T].push(relationship.id);
  }

  const targetNode = context.nodes[relationship.E];
  if (targetNode) {
    if (!targetNode.IN[relationship.T]) {
      targetNode.IN[relationship.T] = [];
    }
    targetNode.IN[relationship.T].push(relationship.id);
  }
}
