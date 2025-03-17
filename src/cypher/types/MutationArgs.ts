import type { EdgeMap, Id, VertexMap } from "~/lib/graph/graph";

export interface MutationArgs {
  edgeIdMap: [Id, Id][];
  transactions: any[];
  txnId: number;
  vertexIdMap: [Id, Id][];
}

export interface MutationResult {
  clientToServerEdgeIdMap?: Map<Id, Id>;
  clientToServerVertexIdMap?: Map<Id, Id>;
  data: {
    [key in
      | "deleteEdge"
      | "deleteVertex"
      | "insert"
      | "insertEdge"
      | "replace"
      | "replaceEdge"
      | "replaceEdgeEnd"
      | "replaceEdgeStart"]?: any;
  }[];
  error?: string;
  graph?: {
    deleted_edges?: Id[];
    deleted_vertexes?: Id[];
    edges: EdgeMap;
    vertexes: VertexMap;
  };
  txnId: number;
}
