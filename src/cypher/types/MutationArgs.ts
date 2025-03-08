import { Id } from "~/lib/graph/graph";

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
  txnId: number;
}
