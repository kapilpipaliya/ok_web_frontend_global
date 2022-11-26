import {
 Id,
 Vertex
} from "../../../ok_web_components/src/components/input/Form";
import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile } from "solid-js/store";
import { getNewGraphId, graph, RevertTransaction, setGraph } from "./graph";
import { G, pipe } from "@mobily/ts-belt";

export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
 return { id, labels, properties, in_edges: {}, out_edges: {} };
}

export function addNewVertex(vertex: Vertex): [Id, RevertTransaction[]] {
 const vertexId = vertex.id ? vertex.id : getNewGraphId();
 setGraph("vertexes", vertexId, klona(vertex));
 vertex.labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) ? !vertexIds.includes(vertexId) ? [...vertexIds, vertexId] : vertexIds : [vertexId]));
 return [vertexId, [() => deleteVertex(vertexId)]];
}

export function replaceVertexProperties(vertexId: Id, properties: {}): [Id, RevertTransaction[]] {
 const originalProperties = klona(graph.vertexes[vertexId].properties);
 setGraph("vertexes", vertexId, "properties", reconcile(properties));
 return [vertexId, [() => replaceVertexProperties(vertexId, originalProperties)]];
}

export function deleteVertex(vertexId: Id): [Id, RevertTransaction[]] {
 const vertex = klona(graph.vertexes[vertexId]);
 batch(() => {
  graph.vertexes[vertexId].labels.forEach(label => setGraph("vertexLabelIdMap", label, vertexIds => G.isArray(vertexIds) && vertexIds.includes(vertexId) ? pipe(vertexIds.filter(vId => vId !== vertexId), fIds => fIds.length ? fIds : undefined) : vertexIds));
  setGraph("vertexes", vertexId, undefined);
 });
 return [vertexId, [() => addNewVertex(vertex)]];
}

export function findVertexIdsByLabel(label: string): Id[] {
 return graph.vertexLabelIdMap[label] || [];
}