import type { Edge, Vertex } from "~/lib/graph/graph";

import type { ContextType } from "../types/ContextType";

/**
 * Updates the IN and OUT properties of nodes when a relationship is processed
 * Can work with either a ContextType object or a direct nodeObj map
 */
export function updateNodeRelations(
  nodes: Record<string, Vertex>,
  relationship: Edge,
): void {
  if (!nodes) {
    return;
  }

  const sourceNode = nodes[relationship.S];
  if (sourceNode) {
    if (!sourceNode.OUT[relationship.T]) {
      sourceNode.OUT[relationship.T] = [];
    }
    sourceNode.OUT[relationship.T].push(relationship.id);
  }

  const targetNode = nodes[relationship.E];
  if (targetNode) {
    if (!targetNode.IN[relationship.T]) {
      targetNode.IN[relationship.T] = [];
    }
    targetNode.IN[relationship.T].push(relationship.id);
  }
} 