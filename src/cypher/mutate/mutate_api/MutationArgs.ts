export interface MutationArgs {
  txnId: number;
  vertexIdMap: [number, number][];
  edgeIdMap: [number, number][];
  transactions: any[];
}
