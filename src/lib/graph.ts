import { createStore, reconcile } from "solid-js/store";
import { G } from "@mobily/ts-belt";
import { klona } from "klona";
import { get, set } from "idb-keyval";
import { Edge, Id, Vertex } from "ok_web_components/src/components/input/Form";
import {
  ServerEventsDispatcher,
} from "../components/ws_events_dispatcher";

export type VertexMap = { [key: string]: Vertex };
export type EdgeMap = { [key: string]: Edge };
// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.
// this is the In-Memory Graph Store, entire application will be based on this to work offline.
// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage
export const [graph, setGraph] = createStore({
  uniqueId: 0,
 _isPartialSynced: false,
  vertexes: {} as VertexMap,
  edges: {} as EdgeMap,
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  initialSynced: false, // TODO: Display initialSynced status to the UI
  lastSyncedTime: 0
});
export type Revert = {revert: () => any}
export type InsertFn = {
  [key in "insert" | "replace" | "deleteVertex" | "insertEdge" | 'replaceEdge' | 'replaceEdgeStart' | 'replaceEdgeEnd' | 'deleteEdge']?: () => any;
};
export enum ProcessStatus {
 Unset,
 Ready,
 Sent,
 AckReceived,
 Processed
}
export type TransactionValue = InsertFn & Revert;
export const transactions = new Map<number, {status: ProcessStatus, steps: TransactionValue[]}>();

export const transactionDetailAdd = (txnId: number, txnValue: TransactionValue) => {
 if(!txnId) return;
  const existingTxnValue = transactions.get(txnId) || {status: ProcessStatus.Unset, steps: []};
  existingTxnValue.steps = [...existingTxnValue.steps, txnValue];
  transactions.set(txnId, existingTxnValue)
}
let txnNo = 1;
export const getNewTxnId = () => ++txnNo

export const getExistingOrDefaultTxnValue = (txnId: number) => transactions.get(txnId) || {
 status: ProcessStatus.Unset,
 steps: []
};

export const revertOneTransactionUnSafe = (txnId: number, txnIndex: number) => {
 if(!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
  const newTxnValue = existingTxnValue.steps.splice(txnIndex, 1);
  newTxnValue[0]?.revert();
}
export const revertTransactionUpTo = (txnId: number, txnIndex: number) => {
 if(!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = transactions.get(txnId) || {status: ProcessStatus.Unset, steps: []};
  const newTxnValue = existingTxnValue.steps.splice(txnIndex);
  newTxnValue.reverse().forEach(x=>x.revert());
}
export const revertTransaction = (txnId: number) => {
  if(!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = [...transactions.get(txnId).steps || []];
  existingTxnValue.reverse().forEach(txn => txn.revert());
  transactions.delete(txnId);
}

export const getTransactionData = (txnId: number) => {
  const existingTxnValue = [...transactions.get(txnId).steps || []].map(txnDetail => ({
    insert: txnDetail.insert?.(),
    replace: txnDetail.replace?.(),
    deleteVertex: txnDetail.deleteVertex?.(),
    insertEdge: txnDetail.insertEdge?.(),
    replaceEdge: txnDetail.replaceEdge?.(),
    replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
    replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
    deleteEdge: txnDetail.deleteEdge?.()
  }));
  return existingTxnValue;
}
export let vertexOldIdToNewIdMap = new Map<string, string>();
export let edgeOldIdToNewIdMap = new Map<string, string>();
export const commitTransaction = (Ws: ServerEventsDispatcher) => {
 let firstReadyTxn = 0;
 // If any pending transaction exist don't send it.
 for(const [txnId, value] of transactions.entries()) {
  if(value.status === ProcessStatus.Ready) {
   if(!firstReadyTxn) firstReadyTxn = txnId;
  } else if(value.status === ProcessStatus.AckReceived || value.status === ProcessStatus.Sent){
   return;
  }
 }
 if(firstReadyTxn){
  const existingTxnValue = getTransactionData(firstReadyTxn);
  transactions.get(firstReadyTxn).status = ProcessStatus.Sent
  if(existingTxnValue.length) {
   Ws.trigger([[['post', 'mutate', 0], [[firstReadyTxn,[...vertexOldIdToNewIdMap], [...edgeOldIdToNewIdMap], existingTxnValue]]]])
  }
 }
}
// TODO: future plan: once committed current system should be able to revert and sync to server too.
export function getNewGraphId(): Id {
  setGraph('uniqueId', graph.uniqueId + 1);
  return `${graph.uniqueId}`;
 // Muration Actor Exception Error : Integer overflow -
 // return `${new Date().getTime()}`;
}

export function resetDatabase() {
  setGraph(reconcile({
    uniqueId: 0,
   _isPartialSynced: false,
    vertexes: {} as { [key: string]: Vertex },
    edges: {} as { [key: string]: Edge },
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    initialSynced: false,
   lastSyncedTime: 0
  }));
}

export function isValidId(startVertexId: string) {
  return G.isString(startVertexId) || G.isNumber(startVertexId);
}
window.graph = graph;
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
  get("graph").then((data)=>setGraph(reconcile(data)));
}

export function backupToJson() {
  return klona(graph);
}

export function restoreFromJson(json: { [key: string]: any }) {
  resetDatabase();
  setGraph(json);
}
