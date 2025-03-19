import type { Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";

export function getNameKeyForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
): string[] {
  const pks =
    evalExpression("->$0NameKey", {
      graph,
      vertexes: [collVertex],
    }) || [];
  return pks.map((pk: Vertex) => pk.P.key);
}
