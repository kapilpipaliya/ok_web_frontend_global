import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getStringComponent } from "./getStringComponent";
import { getChildVertex } from "./traverse";


export function getCompFallbackToString(
  attrVertex: Vertex,
  graph: Store<GraphInterface>
): Vertex | undefined {
  const attrComp = getChildVertex(graph, ["$0Comp"], attrVertex).vertex;
  if (attrComp) return attrComp;

  const attrDataTypeVertex = getChildVertex(
    graph,
    ["$0DataType"],
    attrVertex
  ).vertex;
  return getStringComponent(graph, attrDataTypeVertex);
} // This method read all property vertexes and make an object.

