import type { EdgeMap, VertexMap } from "~/lib/graph/graph";

export interface ServerResult {
  error?: null | string;
  graph?: {
    edges: EdgeMap;
    vertexes: VertexMap;
  };
  result?: any; //Vertex[],
}
