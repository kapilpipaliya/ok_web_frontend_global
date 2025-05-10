import type { EdgeMap, Id, VertexMap } from "~/lib/graph/graph";

export interface GraphData {
  deleted_edges?: Id[];
  deleted_vertexes?: Id[];
  edges: EdgeMap;
  vertexes: VertexMap;
}

export interface ServerResult {
  error?: null | string;
  graph?: GraphData;
  result?: any; //Vertex[],
  message?: string;
}
