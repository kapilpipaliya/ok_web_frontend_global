import type { Vertex } from "~/lib/graph/graph";
import { isObject } from "~/lib/data_structure/object/isObject";

export function isVertex(vertex: unknown): vertex is Vertex {
  return (
    isObject(vertex) &&
    typeof vertex.id === "string" &&
    Array.isArray(vertex.L) &&
    isObject(vertex.P)
  );
}
