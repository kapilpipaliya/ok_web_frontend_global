import type { SetStoreFunction, Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { evaluate } from "~/lib/expression_eval";
import jsep from "jsep";

export function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
): Vertex[] {
  if (!child) {
    return [];
  }
  return (
    evaluate(jsep("->Attr"), { vertexes: [child], graph, setGraph }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}
