import type { Store } from "solid-js/store";
import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";


export function getDataVertex(graph: Store<GraphInterface>, item?: Vertex) {
  const vertexes = evalExpression("->$0Data", {
    graph,
    vertexes: [item],
  });
  return vertexes?.[0];
}
