import { createStore, reconcile } from "solid-js/store";
import { G } from "@mobily/ts-belt";
import { klona } from "klona";
import { get, set } from "idb-keyval";
import { Edge, Id, Vertex } from "ok_web_components/src/components/input/Form";

// this is the In-Memory Graph Store, entire application will be based on this to work offline.
export const [graph, setGraph] = createStore({
  id: 0,
  vertexes: {} as { [key: string]: Vertex },
  edges: {} as { [key: string]: Edge },
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  syncing: false
});
export type RevertTransaction = () => void;
export const transactions = new Map<string, RevertTransaction[]>();

export function getNewGraphId(): Id {
  setGraph('id', graph.id + 1)
  return `${graph.id}`;
}

export function resetDatabase() {
  setGraph(reconcile({
    id: 0,
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
