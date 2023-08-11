import { JSX } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { G } from "@mobily/ts-belt";
import { klona } from "klona";
import { get, set } from "idb-keyval";
import { ServerEventsDispatcher } from "../utils/ws_events_dispatcher";
import { batch } from "solid-js";
window.s = createStore;

export type Id = number;

export const IdAttr = "name";

export interface Vertex {
  id: Id;
  L: string[];
  P: {
    [key: string]: any,
  };
  IN: { [key: string]: Id[] };
  OUT: { [key: string]: Id[] };
}
export interface VertexUnsafe {
  id?: Id;
  L?: string[];
  P: { [key: string]: any };
  IN?: { [key: string]: Id[] };
  OUT?: { [key: string]: Id[] };
}

export interface Edge {
  id: Id;
  P: { [key: string]: any };
  T: string;
  S: Id;
  E: Id;
}

export type VertexMap = { [key: string]: Vertex };
export type EdgeMap = { [key: string]: Edge };
// temporary we start from 500000 because newId should not conflict with existing Ids
let uniqueId = -50000;
// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.
// this is the In-Memory Graph Store, entire application will be based on this to work offline.
// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage
export const [graph, setGraph] = createStore<{
  _isPartialSynced: boolean,
  vertexes: VertexMap,
  edges: EdgeMap,
  vertexLabelIdMap: { [key: string]: Id[] },
initialSynced: boolean,
 lastSyncedTime: 0,
 member?: { [key: string]: any } | null}>({
  _isPartialSynced: false,
  vertexes: {} as VertexMap,
  edges: {} as EdgeMap,
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  initialSynced: false, // TODO: Display initialSynced status to the UI
  lastSyncedTime: 0,
  member: {}
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
window.t = transactions;
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

export const getExistingOrDefaultTxnValue = (txnId: number) =>
  transactions.get(txnId) || {
    status: ProcessStatus.Unset,
    steps: [],
  };

export const revertOneTransactionUnSafe = (txnId: number, txnIndex: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
  // todo dont use splice
  const newTxnValue = existingTxnValue.steps.splice(txnIndex, 1);
  newTxnValue[0]?.revert();
};
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

export const getTransactionData = (txnId: number) => {
  if (!transactions.has(txnId)) return [];
  const existingTxnValue = [...(transactions.get(txnId)!.steps || [])].map((txnDetail) => ({
    insert: txnDetail.insert?.(),
    replace: txnDetail.replace?.(),
    merge: txnDetail.merge?.(),
    deleteVertex: txnDetail.deleteVertex?.(),
    insertEdge: txnDetail.insertEdge?.(),
    replaceEdge: txnDetail.replaceEdge?.(),
    replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
    replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
    deleteEdge: txnDetail.deleteEdge?.(),
  }));
  return existingTxnValue;
};
export let vertexOldIdToNewIdMap = new Map<Id, Id>();
export let edgeOldIdToNewIdMap = new Map<Id, Id>();

export const commitTransaction = (Ws: ServerEventsDispatcher) => {
  let firstReadyTxn = 0;
  // If any pending transaction exist don't send it. // we will clear the previous txn on txn mutation result receive.
  for (const [txnId, value] of transactions.entries()) {
    if (value.status === ProcessStatus.Ready) {
      if (!firstReadyTxn) firstReadyTxn = txnId;
      break;
    } else if (value.status === ProcessStatus.AckReceived || value.status === ProcessStatus.Sent) {
      return;
    }
  }
  if (firstReadyTxn) {
    const existingTxnValue = getTransactionData(firstReadyTxn);
    transactions.get(firstReadyTxn)!.status = ProcessStatus.Sent;
    if (existingTxnValue.length) {
      Ws.trigger([
        [
          ["post", "mutate", 0],
          [[firstReadyTxn, [...vertexOldIdToNewIdMap], [...edgeOldIdToNewIdMap], existingTxnValue]],
        ],
      ]);
    }
  }
};
// Bug: if commitTxn is called many times it is sending event many times.
export const commitTxn = (txnId: number, Ws: ServerEventsDispatcher) => {
  if (transactions.has(txnId)) {
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    commitTransaction(Ws);
  }
};
// TODO: future plan: once committed current system should be able to revert and sync to server too.
export function getNewGraphId(): Id {
  uniqueId = uniqueId + 1;
  return uniqueId;
  // Muration Actor Exception Error : Integer overflow -
  // return `${new Date().getTime()}`;
}

export function resetDatabase() {
  setGraph(
    reconcile({
      _isPartialSynced: true,
      vertexes: {} as { [key: string]: Vertex },
      edges: {} as { [key: string]: Edge },
      vertexLabelIdMap: {} as { [key: string]: Id[] },
      initialSynced: true,
      lastSyncedTime: 0,
    }),
  );
}
export function resetDatabaseLogin() {
  setGraph(
    reconcile({
      _isPartialSynced: false,
      vertexes: {} as { [key: string]: Vertex },
      edges: {} as { [key: string]: Edge },
      vertexLabelIdMap: {} as { [key: string]: Id[] },
      initialSynced: false,
      lastSyncedTime: 0,
    }),
  );
}

export function isValidId(startVertexId: Id) {
  return G.isNumber(startVertexId);
}
// @ts-ignore
window.graph = graph;
// @ts-ignore
window.setGraph = setGraph;
/*
// ***********
// Development
// ***********
// @ts-ignore
window.graph = graph;
// to safely persist to indexDB from different tabs need to use Ws Layer in PWA manifest.
// restoreFromIndexDB();
// This is not proper only for development
restoreFromIndexDB().then(data=>{
  ws.send(['sync vertex', [id, rev][]);
  ws.send(['sync_edge', [id, rev][]);
});
createComputed(() => {
  backupToIndexDB();
});
// ***********
*/

// Backup graphDb to IndexDB using idb-keyval key-value store
export function backupToIndexDB() {
  return set("graph", klona(graph));
}

export function restoreFromIndexDB() {
  get("graph").then((data) => setGraph(reconcile(data)));
}

export function backupToJson() {
  return klona(graph);
}

export function restoreFromJson(json: { [key: string]: any }) {
  resetDatabase();
  setGraph(json);
}

