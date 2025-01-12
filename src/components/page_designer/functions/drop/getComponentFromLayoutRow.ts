import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";

export function getComponentFromLayoutRow(
  layoutRowId: number | string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex =
    getSelectionOptions(
      graph,
      setGraph,
      "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default",
      [currentVertex],
    ).vertexes || [];
  if (compVertex[0]) {
    return compVertex[0];
  }

  return;
}
