

import type { Id } from "../graph";



export type Revert = { revert: () => any };
export type InsertFn = {
  [key in
  | "deleteEdge"
  | "deleteVertex"
  | "insert"
  | "insertEdge"
  | "merge"
  | "replace"
  | "replaceEdge"
  | "replaceEdgeEnd"
  | "replaceEdgeStart"]?: () => any;
};

export enum ProcessStatus {
  AckReceived = 3,
  Processed = 4,
  Ready = 1,
  Sent = 2,
  Unset = 0,
}
export type TransactionValue = { data: any } & InsertFn & Revert;

export const vertexOldIdToNewIdMap = new Map<Id, Id>();
export const edgeOldIdToNewIdMap = new Map<Id, Id>();


