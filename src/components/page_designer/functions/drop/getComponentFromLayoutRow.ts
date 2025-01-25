import type { SetStoreFunction, Store } from "solid-js/store";
import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface } from "~/lib/graph/graph";



export function getComponentFromLayoutRow(
  layoutRowId: number | string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex = evalExpression(
    "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default",
    {
      graph,
      setGraph,
      vertexes: [currentVertex],
    },
  ) ?? [];
  if (compVertex[0]) {
    return compVertex[0];
  }

  return;
}
