import { klona } from "klona";
import { batch } from "solid-js";
import { reconcile } from "solid-js/store";
import { G, pipe } from "@mobily/ts-belt";
import {
 getNewGraphId,
 graph,
 isValidId,
 setGraph, transactionDetailAdd, transactions
} from "./graph";
import { Edge, Id } from "../../../ok_web_components/src/components/input/Form";
import { deleteVertex } from "./Vertex";

export function newEdge(edgeId: Id, type: string, properties: {}, startVertexId: Id, endVertexId: Id): Edge {
 !isValidId(startVertexId) && console.error(`edge startId should be string, but received ${startVertexId}`);
 !isValidId(endVertexId) && console.error(`edge endId and endId should be string, but received ${endVertexId}`);
 return {
  id: edgeId,
  type,
  properties,
  start: startVertexId,
  end: endVertexId
 };
}

export function addNewEdge(txnId: number, edge: Edge): {error: string | boolean, txnDetailIndex?: number}  {
 if(!edge.id) {
  return {error: "Edge ID is not valid"};
 }
 if(graph.edges[edge.id]) {
  return {error: 'Edge ID already exist while adding new edge'}
 }
 if(G.isArray(graph.vertexes[edge.start].out_edges[edge.type]) && graph.vertexes[edge.start].out_edges[edge.type].includes(edge.start)) {
  return {error: 'Edge ID already exist in out_edges of the vertex'}
 }
 if(G.isArray(graph.vertexes[edge.end].in_edges[edge.type]) && graph.vertexes[edge.end].in_edges[edge.type].includes(edge.end)) {
  return {error: 'Edge ID already exist in in_edges of the vertex'}
 }
 batch(() => {
  setGraph("edges", edge.id, klona(edge));
  setGraph("vertexes", edge.start, "out_edges", edge.type, out_edges => G.isArray(out_edges) ? [...out_edges, edge.id] : [edge.id]);
  setGraph("vertexes", edge.end, "in_edges", edge.type, in_edges => G.isArray(in_edges) ? [...in_edges, edge.id] : [edge.id]);
 });

 transactionDetailAdd(txnId, {insertEdge: () => klona(edge), revert: () => deleteEdge(0, edge.id)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).length - 1 : -1};
}

export function replaceEdgeProperties(txnId: number, edgeId: Id, properties: {}): {error: string | boolean, txnDetailIndex?: number}  {
 if(!graph.edges[edgeId]) {
  return {error: "Edge ID is not valid"};
 }
 const originalProperties = klona(graph.edges[edgeId].properties);
 setGraph("edges", edgeId, "properties", reconcile(klona(properties)));
 transactionDetailAdd(txnId, {replaceEdge: () =>klona(graph.vertexes[edgeId]), revert: () => replaceEdgeProperties(0, edgeId, originalProperties)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).length - 1 : -1};
}

const replaceEdgeStart = (txnId: number, type: string, edgeId: Id, newStartVertexId: Id): {error: string | boolean, txnDetailIndex?: number} => {
 if(!graph.edges[edgeId]) {
  return {error: "Edge ID is not valid"};
 }
 const edge = graph.edges[edgeId];
 const oldStartVertexId = edge.start;
 batch(() => {
  setGraph("edges", edgeId, 'start', newStartVertexId);
  setGraph("vertexes", oldStartVertexId, "out_edges", type, (v) => G.isArray(v) ? pipe(v.filter(e => e !== edgeId), f => f.length ? f : undefined) : v);
  setGraph("vertexes", newStartVertexId, "out_edges", type, (v) => G.isArray(v) ? [...v, edgeId] : [edgeId]);
 });
 transactionDetailAdd(txnId, {replaceEdgeStart: () => [edgeId, newStartVertexId], revert: () => replaceEdgeStart(0, type, edgeId, oldStartVertexId)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).length - 1 : -1};
};
const replaceEdgeEnd = (txnId: number, type: string, edgeId: Id, newEndVertexId: Id): {error: string | boolean, txnDetailIndex?: number} => {
 if(!graph.edges[edgeId]) {
  return {error: "Edge ID is not valid"};
 }
 const edge = graph.edges[edgeId];
 const oldEndVertexId = edge.end;
 batch(() => {
  setGraph("edges", edgeId, 'end', newEndVertexId);
  setGraph("vertexes", oldEndVertexId, "in_edges", type, (v) => G.isArray(v) ? pipe(v.filter(e => e !== edgeId), f => f.length ? f : undefined) : v);
  setGraph("vertexes", newEndVertexId, "in_edges", type, (v) => G.isArray(v) ? [...v, edgeId] : [edgeId]);
 });
 transactionDetailAdd(txnId, {replaceEdgeEnd: () => [edgeId, newEndVertexId], revert: () => replaceEdgeEnd(0, type, edgeId, oldEndVertexId)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).length - 1 : -1};
};

export function updateEdgeStartAndEnd(txnId: number, edgeId: Id, start: Id, end: Id): {error: string | boolean, txnDetailIndex?: number| number[]}  {
 const txnIndexes = [];
 batch(() => {
  const edge = graph.edges[edgeId];
  const oldStartId = edge.start;
  const oldEndId = edge.end;
  const isStartChanged = start && oldStartId !== start;
  const isEndChanged = end && oldEndId !== end;
  const type = graph.edges[edgeId].type;
  if (isStartChanged) {
   const result = replaceEdgeStart(txnId, type, edgeId, start);
   if(result.error) {
    return result;
   } else {
    txnIndexes.push(result.txnDetailIndex);
   }
  }
  if (isEndChanged) {
   const result = replaceEdgeEnd(txnId, type, edgeId, end);
   if(result.error) {
    return result;
   } else {
    txnIndexes.push(result.txnDetailIndex);
   }
  }
 });
 return {error: false, txnDetailIndex: txnId ? txnIndexes : -1};
}

export function deleteEdge(txnId: number, edgeId: Id): {error: string | boolean, txnDetailIndex?: number}  {
 if(!graph.edges[edgeId]) {
  return {error: "Edge ID is not valid"};
 }
 const edge = klona(graph.edges[edgeId]);
 batch(() => {
  const type = graph.edges[edgeId].type;
  setGraph("vertexes", graph.edges[edgeId].start, "out_edges", type, (ids) => G.isArray(ids) && ids.includes(edgeId) ? pipe(ids.filter(id_ => id_ !== edgeId), newIds => newIds.length ? newIds : undefined) : ids);
  setGraph("vertexes", graph.edges[edgeId].end, "in_edges", type, (ids) => G.isArray(ids) && ids.includes(edgeId) ? pipe(ids.filter(id_ => id_ !== edgeId), newIds => newIds.length ? newIds : undefined) : ids);
  setGraph("edges", edgeId, undefined);
 });
 transactionDetailAdd(txnId, {deleteEdge: () => edge, revert: () => addNewEdge(0, edge)});
 return {error: false, txnDetailIndex: txnId ? transactions.get(txnId).length - 1 : -1};
}

export function getOutEdgeIdsOfType(id: Id | string, edgeLabel: string): Id[] {
 return graph.vertexes[id].out_edges[edgeLabel] || [];
}
