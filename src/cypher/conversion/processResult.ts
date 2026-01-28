import type { Record } from "neo4j-driver";

import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "~/cypher/conversion/convertNodeToJson";

import type { EvalExpressionContext } from "../types/EvalExpressionContext";

import { updateNodeRelations } from "./updateRelations";
import type { Vertex } from "~/lib/graph/type/vertex";

export function processResult(
  records: Record[],
  context: EvalExpressionContext,
  nodeLabel: string | string[],
  typeLabel?: string | string[],
) {
  const vertices: Vertex[] = [];
  const labels = Array.isArray(nodeLabel) ? nodeLabel : [nodeLabel];
  const { nodes, relationships: relationshipMap } = context;

  for (const record of records) {
    // Process nodes
    for (let index = 0; index < labels.length; index++) {
      const label = labels[index];
      const nodeData = record.get(label);
      if (nodeData) {
        // Handle both single nodes and arrays of nodes (from collect())
        const nodeArray = Array.isArray(nodeData) ? nodeData : [nodeData];

        for (const node of nodeArray) {
          if (node) {
            const vertex = convertNodeToJson(node);
            if (index === 0 && !Array.isArray(nodeData)) {
              vertices.push(vertex);
            }
            if (nodes) {
              // Don't overwrite existing vertex: preserves IN/OUT from previous updateNodeRelations
              // (e.g. getSidebarTreeRoots loadFullTree: same vertex can be parent in one edge and child in another)
              if (!nodes[vertex.id]) {
                nodes[vertex.id] = vertex;
              }
            }
          }
        }
      }
    }

    const typeLabels = typeLabel
      ? Array.isArray(typeLabel)
        ? typeLabel
        : [typeLabel]
      : [];
    // Process relationships for all type labels
    for (const currentTypeLabel of typeLabels) {
      const relationshipData = record.get(currentTypeLabel);
      const relationships = Array.isArray(relationshipData)
        ? relationshipData
        : relationshipData
          ? [relationshipData]
          : [];

      for (const relationship of relationships) {
        // Skip null relationships (from OPTIONAL MATCH with DISTINCT collect)
        if (!relationship) {
          continue;
        }
        const convertedRel = convertRelationshipToJson(relationship);
        if (relationshipMap) {
          updateNodeRelations(context.nodes!, convertedRel);
          relationshipMap[convertedRel.id] = convertedRel;
        }
      }
    }
  }

  return vertices;
}
