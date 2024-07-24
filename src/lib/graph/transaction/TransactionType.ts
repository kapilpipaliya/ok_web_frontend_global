import type { Id } from "../graph";

export type Revert = { redo: () => void; revert: () => void };
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
    | "replaceEdgeStart"]?: () => void;
};

export type TransactionValue = { data: any } & InsertFn & Revert;

export const vertexOldIdToNewIdMap = new Map<Id, Id>();
export const edgeOldIdToNewIdMap = new Map<Id, Id>();
