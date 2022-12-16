import { klona } from "klona";
import { batch } from "solid-js";
import { reconcile } from "solid-js/store";
import { G, pipe } from "@mobily/ts-belt";
import {
 getNewGraphId,
 graph,
 isValidId,
 RevertTransaction,
 setGraph
} from "./graph";
import { Edge, Id } from "../../../ok_web_components/src/components/input/Form";

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

export function addNewEdge(edge: Edge): [Id, RevertTransaction[]] {
 const edgeId = edge.id ? edge.id : getNewGraphId();
 batch(() => {
  setGraph("edges", edgeId, klona(edge));
  setGraph("vertexes", edge.start, "out_edges", edge.type, out_edges => G.isArray(out_edges) ? !out_edges.includes(edgeId) ? [...out_edges, edgeId] : out_edges : [edgeId]);
  setGraph("vertexes", edge.end, "in_edges", edge.type, in_edges => G.isArray(in_edges) ? !in_edges.includes(edgeId) ? [...in_edges, edgeId] : in_edges : [edgeId]);
 });
 return [edgeId, [() => deleteEdge(edgeId)]];
}

export function replaceEdgeProperties(edgeId: Id, properties: {}): [Id, RevertTransaction[]] {
 const originalProperties = klona(graph.edges[edgeId].properties);
 setGraph("edges", edgeId, "properties", reconcile(properties));
 return [edgeId, [() => replaceEdgeProperties(edgeId, originalProperties)]];
}

const replaceEdgeStart = (type: string, edgeId: Id, oldStartVertexId: Id, newStartVertexId: Id): RevertTransaction => {
 batch(() => {
  setGraph("vertexes", oldStartVertexId, "out_edges", type, (v) => G.isArray(v) ? pipe(v.filter(e => e !== edgeId), f => f.length ? f : undefined) : v);
  setGraph("vertexes", newStartVertexId, "out_edges", type, (v) => G.isArray(v) ? [...v, edgeId] : [edgeId]);
 });
 return () => replaceEdgeStart(type, edgeId, newStartVertexId, oldStartVertexId);
};
const replaceEdgeEnd = (type: string, edgeId: Id, oldEndVertexId: Id, newEndVertexId: Id): RevertTransaction => {
 batch(() => {
  setGraph("vertexes", oldEndVertexId, "in_edges", type, (v) => G.isArray(v) ? pipe(v.filter(e => e !== edgeId), f => f.length ? f : undefined) : v);
  setGraph("vertexes", newEndVertexId, "in_edges", type, (v) => G.isArray(v) ? [...v, edgeId] : [edgeId]);
 });
 return () => replaceEdgeEnd(type, edgeId, newEndVertexId, oldEndVertexId);
};

export function updateEdgeStartAndEnd(edgeId: Id, start: Id, end: Id): [Id, RevertTransaction[]] {
 const revertTransactions = [];
 batch(() => {
  const edge = graph.edges[edgeId];
  const oldStartId = edge.start;
  const oldEndId = edge.end;
  const isStartChanged = start && oldStartId !== start;
  const isEndChanged = end && oldEndId !== end;
  const type = graph.edges[edgeId].type;
  isStartChanged && revertTransactions.push(replaceEdgeStart(type, edgeId, oldStartId, start));
  isEndChanged && revertTransactions.push(replaceEdgeEnd(type, edgeId, oldEndId, end));
  if (isStartChanged || isEndChanged) {
   setGraph("edges", edgeId, { start, end });
   revertTransactions.push(() => setGraph("edges", edgeId, {
    start: oldStartId,
    end: oldEndId
   }));
  }
 });
 return [edgeId, revertTransactions];
}

export function deleteEdge(edgeId: Id): [Id, RevertTransaction[]] {
 const edge = klona(graph.edges[edgeId]);
 batch(() => {
  const type = graph.edges[edgeId].type;
  setGraph("vertexes", graph.edges[edgeId].start, "out_edges", type, (ids) => G.isArray(ids) && ids.includes(edgeId) ? pipe(ids.filter(id_ => id_ !== edgeId), newIds => newIds.length ? newIds : undefined) : ids);
  setGraph("vertexes", graph.edges[edgeId].end, "in_edges", type, (ids) => G.isArray(ids) && ids.includes(edgeId) ? pipe(ids.filter(id_ => id_ !== edgeId), newIds => newIds.length ? newIds : undefined) : ids);
  setGraph("edges", edgeId, undefined);
 });
 return [edgeId, [() => addNewEdge(edge)]];
}

export function getOutEdgeIdsOfType(id: Id | string, edgeLabel: string): Id[] {
 return graph.vertexes[id].out_edges[edgeLabel] || [];
}
