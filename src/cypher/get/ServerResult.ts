import type {EdgeMap, VertexMap} from "~/lib/graph/graph";

export interface ServerResult {
  result: any, //Vertex[],
  graph: {
    vertexes: VertexMap,
    edges: EdgeMap
  }
}