// return a new Vertex
import type { Id, Vertex } from "~/lib/graph/graph";

export function newVertex<T extends { [key: string]: any }>(
  id: Id,
  labels: string[],
  properties?: T,
): Vertex {
  return { id, IN: {}, L: labels, OUT: {}, P: properties || {} };
}
