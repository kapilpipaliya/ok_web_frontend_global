import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getPkForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks =
    evalExpression("->$0Pk", {
      graph,
      vertexes: [collVertex],
    }) || [];
  return pks.map((pk: Vertex) => pk.P.key);
}
