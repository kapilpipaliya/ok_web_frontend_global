import type { EdgeMap, Id, VertexMap } from "~/lib/graph/graph";

export interface ServerResult {
  error?: null | string;
  graph?: {
    deleted_edges?: Id[];
    deleted_vertexes?: Id[];
    edges: EdgeMap;
    vertexes: VertexMap;
  };
  result?: any; //Vertex[],
}
