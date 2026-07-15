import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Updates the IN and OUT properties of nodes when a relationship is processed
 * Can work with either a EvalExpressionContext object or a direct nodeObj map
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
    if (!sourceNode.OUT) {
      sourceNode.OUT = {};
    }
    if (!sourceNode.OUT[relationship.T]) {
      sourceNode.OUT[relationship.T] = [];
    }
    const outArr = sourceNode.OUT[relationship.T];
    if (!outArr.includes(relationship.id)) outArr.push(relationship.id);
  }

  const targetNode = nodes[relationship.E];
  if (targetNode) {
    if (!targetNode.IN) {
      targetNode.IN = {};
    }
    if (!targetNode.IN[relationship.T]) {
      targetNode.IN[relationship.T] = [];
    }
    const inArr = targetNode.IN[relationship.T];
    if (!inArr.includes(relationship.id)) inArr.push(relationship.id);
  }
}
