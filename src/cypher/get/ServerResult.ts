import {EdgeMap, Vertex, VertexMap} from "~/lib/graph/graph";

export interface ServerResult {
  result: Vertex[],
  graph: {
    vertexes: VertexMap,
    edges: EdgeMap
  }
}