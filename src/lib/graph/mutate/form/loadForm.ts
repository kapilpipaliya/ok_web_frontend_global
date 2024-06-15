import type {
  GraphInterface,
  Id,
  Vertex
} from "~/lib/graph/graph";
import type { Store } from "solid-js/store";


export function loadForm(
  graph: Store<GraphInterface>,
  id: Id
): { error: string | boolean; vertex?: Vertex; } {
  if (!graph.vertexes[id]) {
    return { error: "vertex not found" };
  }
  const vertex = graph.vertexes[id];

  return {
    error: false,
    vertex: vertex,
  };
}
