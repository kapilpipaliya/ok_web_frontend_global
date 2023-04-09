import { Id, Vertex } from "./Form";

export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
  return { id, labels, properties, in_edges: {}, out_edges: {} };
}
