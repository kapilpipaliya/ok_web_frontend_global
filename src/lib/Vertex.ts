import { Id, Vertex } from "../components/input/Form";
import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile } from "solid-js/store";
import { graph, setGraph, transactionDetailAdd, transactions } from "./graph";
import { G, pipe } from "@mobily/ts-belt";

// return a new Vertex
export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
 return { id, labels, properties, in_edges: {}, out_edges: {} };
}

// add a new vertex to the graph
export function addNewVertex(txnId: number, vertex: Vertex): {error: string | boolean, txnDetailIndex?: number} {
 if (graph.vertexes[vertex.id]) {
  return {error: "Vertex ID Already exist"};
 }
 const existedVertexes = vertex.labels.filter(label => G.isArray(graph.vertexLabelIdMap[label]) && graph.vertexLabelIdMap[label].includes(vertex.id))
 if(existedVertexes.length) {
  return {error: 'vertex ID already exist while adding new vertex'}
 }
 setGraph("vertexes", vertex.id, klona(vertex));
 vertex.labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id]));
 transactionDetailAdd(txnId, {insert: () => klona(vertex), revert: () => deleteVertex(0, vertex.id)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1};
}

// replace a vertex properties
export function replaceVertexProperties(txnId: number, vertexId: Id, properties: {}): {error: string | boolean, txnDetailIndex?: number} {
 if(!graph.vertexes[vertexId]) {
  return {error: "Vertex ID is not valid"};
 }
 const originalProperties = klona(graph.vertexes[vertexId].properties);
 setGraph("vertexes", vertexId, "properties", reconcile(klona(properties)));
 transactionDetailAdd(txnId, {replace: () =>klona(graph.vertexes[vertexId]), revert: () => replaceVertexProperties(0, vertexId, originalProperties)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1};
}

export function mergeVertexProperties(txnId: number, vertexId: Id, properties: {}): {error: string | boolean, txnDetailIndex?: number} {
 const vertex = graph.vertexes[vertexId];
 if(!vertex) {
  return {error:   `Vertex ID is not valid ${vertexId}`};
 }
 const originalProperties = {} as {[key: string]: any};
 for (const property in properties) {
  originalProperties[property] = vertex.properties[property]
 }
 setGraph("vertexes", vertexId, "properties", properties);
 transactionDetailAdd(txnId, {merge: () => Object.assign({}, vertex, { properties }), revert: () => mergeVertexProperties(0, vertexId, originalProperties)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1};
}

// delete a vertex
export function deleteVertex(txnId: number, vertexId: Id): {error: string | boolean, txnDetailIndex?: number} {
 if(!graph.vertexes[vertexId]) {
  return {error: "Vertex ID is not valid"};
 }
 const vertex = klona(graph.vertexes[vertexId]);
 batch(() => {
  // @ts-ignore
  graph.vertexes[vertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) && vertexIds.includes(vertexId) ? pipe(vertexIds.filter(vId => vId !== vertexId), fIds => fIds.length ? fIds : undefined) : vertexIds));
  // @ts-ignore
  setGraph("vertexes", vertexId, undefined);
 });
 transactionDetailAdd(txnId, {deleteVertex: () => klona(vertex), revert: () => addNewVertex(0, vertex)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1};
}
// update vertex id when we receive new id from api response
export function updateVertexId(oldVertexId: Id, newVertexId: Id) {
 if(!graph.vertexes[oldVertexId]) {
  return {error: "Vertex ID is not valid"};
 }
 if(graph.vertexes[newVertexId]) {
  return {error: "new Vertex ID is not valid"};
 }
 setGraph('vertexes', newVertexId, graph.vertexes[oldVertexId]);
 setGraph('vertexes', newVertexId, 'id', newVertexId);
 // @ts-ignore
 setGraph('vertexes', oldVertexId, undefined);
 // TODO: replace id exactly at same position
 graph.vertexes[newVertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, ids => ids.filter(id => id !== oldVertexId)))
 graph.vertexes[newVertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId]));
 // v->E--in->V-out-->E->v
 Object.entries(graph.vertexes[newVertexId].out_edges).forEach(([edgeType, edgeIds]) => {
  setGraph('edges', edgeIds, 'start', newVertexId )
 })
 Object.entries(graph.vertexes[newVertexId].in_edges).forEach(([edgeType, edgeIds]) => {
  setGraph('edges', edgeIds, 'end', newVertexId )
 })
 return {error: ""};
}
// helper function to find all the vertex ids of the label
export function findVertexIdsByLabel(label: string): Id[] {
 return graph.vertexLabelIdMap[label] || [];
}
export function findVertexByLabelAndUniqueId(label: string, attribute: string, value: any) {
 return graph.vertexLabelIdMap[label].map(v => graph.vertexes[v]).find(v => value === v.properties[attribute])
}
