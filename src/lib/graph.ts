import { createStore, reconcile } from "solid-js/store";
import { G } from "@mobily/ts-belt";
import { klona } from "klona";
import { get, set } from "idb-keyval";
import { Edge, Id, Vertex } from "ok_web_components/src/components/input/Form";

export type VertexMap = { [key: string]: Vertex };
export type EdgeMap = { [key: string]: Edge };
// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.
// this is the In-Memory Graph Store, entire application will be based on this to work offline.
export const [graph, setGraph] = createStore({
  uniqueId: 0,
  vertexes: {} as VertexMap,
  edges: {} as EdgeMap,
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  syncing: false
});
export type Revert = {revert: () => any}
export type InsertFn = {
  [key in "insert" | "replace" | "deleteVertex" | "insertEdge" | 'replaceEdge' | 'replaceEdgeStart' | 'replaceEdgeEnd' | 'deleteEdge']?: () => any;
};
export type TransactionValue = InsertFn & Revert;
export const transactions = new Map<number, TransactionValue[]>();
export const transactionDetailAdd = (txnId: number, txnValue: TransactionValue) => {
  if(!txnId) return;
  const existingTxnValue = transactions.get(txnId) || [];
  transactions.set(txnId, [...existingTxnValue, txnValue])
}
export const revertOneTransaction = (txnId: number, txnIndex: number) => {
  if(!txnId) return;
  const existingTxnValue = transactions.get(txnId) || [];
  const newTxnValue = existingTxnValue.splice(txnIndex, 1);
  newTxnValue[0]?.revert();
  transactions.set(txnId, newTxnValue)
}
export const revertTransaction = (txnId: number) => {
  if(!txnId) return;
  const existingTxnValue = transactions.get(txnId) || [];
  existingTxnValue.forEach(txn => txn.revert());
  transactions.delete(txnId);
}
export const deleteVertex = new Map<string, Transaction[]>();

export function getNewGraphId(): Id {
  setGraph('uniqueId', graph.uniqueId + 1);
  return `${graph.uniqueId}`;
}

export function resetDatabase() {
  setGraph(reconcile({
    uniqueId: 0,
    vertexes: {} as { [key: string]: Vertex },
    edges: {} as { [key: string]: Edge },
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    syncing: false
  }));
}

export function isValidId(startVertexId: string) {
  return G.isString(startVertexId) || G.isNumber(startVertexId);
}

/*
// ***********
// Development
// ***********
// @ts-ignore
window.graph = graph;
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
