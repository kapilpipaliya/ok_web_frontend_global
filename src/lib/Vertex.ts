import {
 Id,
 Vertex
} from "../../../ok_web_components/src/components/input/Form";
import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile } from "solid-js/store";
import {
 graph,
 setGraph, transactionDetailAdd,
 transactions
} from "./graph";
import { G, pipe } from "@mobily/ts-belt";

export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
 return { id, labels, properties, in_edges: {}, out_edges: {} };
}

export function addNewVertex(txnId: number, vertex: Vertex): {error: string | boolean, txnDetailIndex?: number} {
 if(!vertex.id) {
  return {error: "ID is not valid"};
 }
 const existedVertexes = vertex.labels.filter(label => G.isArray(graph.vertexLabelIdMap[label]) && graph.vertexLabelIdMap[label].includes(vertex.id))
 if(existedVertexes.length) {
  return {error: 'vertex ID already exist while adding new vertex'}
 }
 setGraph("vertexes", vertex.id, klona(vertex));
 vertex.labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id]));
 transactionDetailAdd(txnId, {insert: () => klona(vertex), revert: () => deleteVertex(0, vertex.id)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).steps.length - 1 : -1};
}

export function replaceVertexProperties(txnId: number, vertexId: Id, properties: {}): {error: string | boolean, txnDetailIndex?: number} {
 if(!graph.vertexes[vertexId]) {
  return {error: "Vertex ID is not valid"};
 }
 const originalProperties = klona(graph.vertexes[vertexId].properties);
 setGraph("vertexes", vertexId, "properties", reconcile(klona(properties)));
 transactionDetailAdd(txnId, {replace: () =>klona(graph.vertexes[vertexId]), revert: () => replaceVertexProperties(0, vertexId, originalProperties)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).steps.length - 1 : -1};
}

export function deleteVertex(txnId: number, vertexId: Id): {error: string | boolean, txnDetailIndex?: number} {
 if(!graph.vertexes[vertexId]) {
  return {error: "ID is not valid"};
 }
 const vertex = klona(graph.vertexes[vertexId]);
 batch(() => {
  graph.vertexes[vertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) && vertexIds.includes(vertexId) ? pipe(vertexIds.filter(vId => vId !== vertexId), fIds => fIds.length ? fIds : undefined) : vertexIds));
  setGraph("vertexes", vertexId, undefined);
 });
 transactionDetailAdd(txnId, {deleteVertex: () => klona(vertex), revert: () => addNewVertex(0, vertex)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).steps.length - 1 : -1};
}
export function updateVertexId(oldVertexId: Id, newVertexId: Id) {
 if(!graph.vertexes[oldVertexId]) {
  return {error: "ID is not valid"};
 }
 if(graph.vertexes[newVertexId]) {
  return {error: "new ID is not valid"};
 }
 if(graph.edges[newVertexId]) {
  return {error: "new ID is not valid as Its used in Edge"};
 }
 setGraph('vertexes', newVertexId, {...klona(graph.vertexes[oldVertexId]), id: newVertexId});
 setGraph('vertexes', oldVertexId, undefined);
 graph.vertexes[newVertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, ids => ids.filter(id => id !== oldVertexId)))
 graph.vertexes[newVertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId]));
 // v->E--in->V-out-->E->v
 Object.entries(graph.vertexes[newVertexId].out_edges).forEach(([edgeType, edgeIds]) => {
  setGraph('edges', edgeIds, 'start', newVertexId )
 })
 Object.entries(graph.vertexes[newVertexId].in_edges).forEach(([edgeType, edgeIds]) => {
  setGraph('edges', edgeIds, 'end', newVertexId )
 })
}

export function findVertexIdsByLabel(label: string): Id[] {
 return graph.vertexLabelIdMap[label] || [];
}
