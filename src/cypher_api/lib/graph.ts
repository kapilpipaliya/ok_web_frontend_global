import {batch} from "solid-js";
import {createStore} from "solid-js/store";
import {isNumber} from "../utils/utils";
import {Node as Neo4jNode, Relationship as Neo4jRelationship} from 'neo4j-driver';

export type Id = number | string | any;

export const IdAttr = "name";

export interface Node extends Partial<Neo4jNode> {
  id: Id;
  L: string[];
  P: {
    [key: string]: any,
  };
  IN: { [key: string]: Id[] };
  OUT: { [key: string]: Id[] };
}
export interface NodeUnsafe {
  id?: Id;
  L?: string[];
  P: { [key: string]: any };
  IN?: { [key: string]: Id[] };
  OUT?: { [key: string]: Id[] };
}

export interface Relationship extends Partial<Neo4jRelationship>{
  id: Id;
  P: { [key: string]: any };
  T: string;
  S: Id;
  E: Id;
}

export type VertexMap = { [key: string]: Node };
export type EdgeMap = { [key: string]: Relationship };
// temporary we start from 500000 because newId should not conflict with existing Ids
let uniqueId = -50000;

export interface IGraph {
  vertexes: VertexMap;
  edges: EdgeMap;
  vertexLabelIdMap: { [key: string]: Id[] };
  member?: { [key: string]: any } | null;
}

export const getGraph = () => createStore<IGraph>({
  vertexes: {} as VertexMap,
  edges: {} as EdgeMap,
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  member: {},
});
export type Revert = { revert: () => any };
export type InsertFn = {
  [key in
    | "insert"
    | "replace"
    | "merge"
    | "deleteVertex"
    | "insertEdge"
    | "replaceEdge"
    | "replaceEdgeStart"
    | "replaceEdgeEnd"
    | "deleteEdge"]?: () => any;
};
export enum ProcessStatus {
  Unset,
  Ready,
  Sent,
  AckReceived,
  Processed,
}
export type TransactionValue = InsertFn & Revert & {data: any};
export const transactions = new Map<number, { status: ProcessStatus; steps: TransactionValue[] }>();
// @ts-ignore
export const transactionDetailAdd = (txnId: number, txnValue: TransactionValue) => {
  if (!txnId) return;
  const existingTxnValue = transactions.get(txnId) || {
    status: ProcessStatus.Unset,
    steps: [],
  };
  existingTxnValue.steps = [...existingTxnValue.steps, txnValue];
  transactions.set(txnId, existingTxnValue);
};
let txnNo = 1;
export const getNewTxnId = () => ++txnNo;

export const revertTransactionUpTo = (txnId: number, txnIndex: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = transactions.get(txnId) || {
    status: ProcessStatus.Unset,
    steps: [],
  };
  const newTxnValue = existingTxnValue.steps.splice(txnIndex);
  newTxnValue.reverse().forEach((x) => x.revert());
};
export const revertTransaction = (txnId: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = [...(transactions.get(txnId)!.steps || [])];
  batch(() => {
    existingTxnValue.reverse().forEach((txn) => txn.revert());
  });
  transactions.delete(txnId);
};
export const txnHasSteps = (txnId: number) => {
  if (!txnId || !transactions.has(txnId)) return false;
  const existingTxnValue = transactions.get(txnId)!.steps || [];
  return existingTxnValue.length > 0;
};


// TODO: future plan: once committed current system should be able to revert and sync to server too.
export function getNewGraphId(): Id {
  uniqueId = uniqueId + 1;
  return uniqueId;
  // Muration Actor Exception Error : Integer overflow -
  // return `${new Date().getTime()}`;
}

export function isValidId(startVertexId: Id) {
  return isNumber(startVertexId);
}

export function compareId(id1: any, id2: any) {
  if (typeof id1 === 'object') {
    id1 = id1.toString();
  }
  if (typeof id2 === 'object') {
    id2 = id2.toString();
  }
  return id1 == id2;
}
export function isIdArrayIncludesID(value: Array<any>, id: any) {
  for (const element of value) {
    if (compareId(element, id)) {
      return true;
    }
  }

  return false;
}