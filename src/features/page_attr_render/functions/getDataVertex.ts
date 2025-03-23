import type { Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";

export function getDataVertex(graph: Store<GraphInterface>, item?: Vertex) {
  const vertexes = evalExpression("->$0Data", {
    graph,
    vertexes: [item],
  });
  return vertexes?.[0];
}
