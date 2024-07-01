import type {EdgeMap, VertexMap} from "~/lib/graph/graph";

export interface ServerResult {
  graph: {
    edges: EdgeMap
    vertexes: VertexMap,
  }
  result: any, //Vertex[],
}