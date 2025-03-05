export interface MutationArgs {
  edgeIdMap: [number, number][];
  transactions: any[];
  txnId: number;
  vertexIdMap: [number, number][];
}

export interface MutationResult {
  clientToServerEdgeIdMap?: Map<number, number>;
  clientToServerVertexIdMap?: Map<number, number>;
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
