import { createStore, SetStoreFunction } from "solid-js/store";
import type { GraphInterface } from "../graph";

export function generateNewVertexId(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>): string {
  setGraph("newVertexId_", (newVertexId: number) => newVertexId + 1);
  return graph.newVertexId_.toString();
}
