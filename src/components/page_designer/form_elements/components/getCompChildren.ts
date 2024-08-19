import jsep from "jsep";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

export function getCompChildren(vertex: Vertex, graph: GraphInterface) {
  if (!vertex) { return []; }
  const children: Vertex[] = evaluate(jsep("<-ParentComp"), { graph, vertexes: [vertex] }) || [];
  return children;
}
