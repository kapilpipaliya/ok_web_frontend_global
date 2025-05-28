import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function getComponentFromLayoutRow(
  layoutRowId: number | string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];

  // First try to find Component by componentName
  if (currentVertex.P.componentName) {
    const compVertex = findVertexByLabelAndUniqueId(
      graph,
      "Component",
      "key",
      currentVertex.P.componentName,
    );
    if (compVertex) {
      return compVertex;
    }
  }

  // If not found, fall back to the other expressions
  const compVertex =
    evalExpression("->$0Att->$0Comp||->$0Att->$0DataType->$0Default", {
      graph,
      setGraph,
      vertexes: [currentVertex],
    }) ?? [];
  if (compVertex[0]) {
    return compVertex[0];
  }

  return;
}
