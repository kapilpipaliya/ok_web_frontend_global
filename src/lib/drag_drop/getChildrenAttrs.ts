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

interface Item {
  name: string;
  type: string;
  children?: Item[];
}
export function getAllFields(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, vertex: Vertex): Item {
  const children = getChildrenAttrs(graph, setGraph, vertex);
  if (children.length === 0) {
    return {
      name: vertex.P.name,
      type: vertex.P.type,
    };
  }
  return {
    name: vertex.P.name,
    type: vertex.P.type,
    children: children.map((child) => getAllFields(graph, setGraph, child)),
  };
}
// use it when new field is drag and drop.
export function getUniqueName(graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>) {
  const meta = graph.meta || { lastUniqueId: 0 };
  let uniqueId = meta.lastUniqueId + 1;

  while (isUniqueIdUsed(graph, `unique_${uniqueId}`)) {
    uniqueId++;
  }

  setGraph("meta", { lastUniqueId: uniqueId });
  return `unique_${uniqueId}`;
}

//  traverse all the nodes and check if it is used or not?
export function isUniqueIdUsed(graph: Store<GraphInterface>, name: string) {
  function checkVertex(vertex: Vertex) {
    if (vertex.P.name === name) {
      return true;
    }
    if (vertex.children) {
      return vertex.children.some(checkVertex);
    }
    return false;
  }

  return graph.vertexes.some(checkVertex);
}
