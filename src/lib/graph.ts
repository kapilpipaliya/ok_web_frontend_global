import { createStore, reconcile } from "solid-js/store";
import { batch, createComputed } from "solid-js";
import { get, set } from "idb-keyval";
import { klona } from "klona";
import { Id, Vertex, Edge } from 'ok_web_components/src/components/input/Form';
export function getNewGraphId(): Id {
  setGraph('id', graph.id + 1)
  return `${graph.id}`;
}

// this is the In-Memory Graph Store, entire application will be based on this to work offline.
export const [graph, setGraph] = createStore({
  id: 0,
  vertexes: {} as { [key: string]: Vertex },
  edges: {} as { [key: string]: Edge },
  vertexLabelIdMap: {} as { [key: string]: Id[] },
  syncing: false
});

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

export function resetDatabase() {
  setGraph(reconcile({
    id: 0,
    vertexes: {} as { [key: string]: Vertex },
    edges: {} as { [key: string]: Edge },
    vertexLabelIdMap: {} as { [key: string]: Id[] },
    syncing: false
  }));
}
/* Overwrite:
 vertex: { properties: {} },
 edges:  { start: Id, end: Id, properties: {} }
 */
export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
  return {
    id,
    labels,
    properties,
    in_edges: {},
    out_edges: {}
  };
}

export function newEdge(id: Id, label: string, properties: {}, start: Id, end: Id): Edge {
  [start, end].forEach(id=>{
    if(typeof id !== "string" && typeof id !== "number"){
      alert(`edge Id should be string or number, but received ${id}`);
    }
  })
  return {
    id,
    label,
    properties,
    start,
    end
  };
}

export function addNewVertex(vertex: Vertex) {
  setGraph("vertexes", vertex.id, vertex);
  vertex.labels.forEach(label => {
    setGraph("vertexLabelIdMap", label, ids => {
      if (!ids) {
        return [vertex.id];
      } else if (!ids.includes(vertex.id)) {
        return [...ids, vertex.id];
      } else {
        return ids;
      }
    });
  });
  return [vertex.id, () => deleteVertex(vertex.id)]
}

export function replaceVertexProperties(id: Id, properties: {}) {
  const originalProperties = klona(graph.vertexes[id].properties);
  setGraph("vertexes", id, "properties", reconcile(properties));
  return [id, () => replaceVertexProperties(id, originalProperties)]
}

export function replaceEdgeProperties(id: Id, properties: {}) {
  const originalProperties = klona(graph.edges[id].properties);
  setGraph("edges", id, "properties", reconcile(properties));
  return [id, () => replaceEdgeProperties(id, originalProperties)]
}

const replaceEdgeStart = (type: string, id: Id, oldStartId: Id, newStartId: Id) => {
  // remove from old start vertex's out_edges
  setGraph("vertexes", oldStartId, "out_edges",type, (v)=>v.filter(e=>e!==id));
  // add to new start vertex's out_edges
  setGraph("vertexes", newStartId, "out_edges", type, (v)=> v ? [...v, id] : [id]);
  return () => replaceEdgeStart(type, id, newStartId, oldStartId);
}
const replaceEdgeEnd = (type: string, id: Id, oldEndId: Id, newEndId: Id) => {
  // remove from old end vertex's in_edges
  setGraph("vertexes", oldEndId, "in_edges",type, (v)=>v.filter(e=>e!==id));
  // add to new end vertex's in_edges
  setGraph("vertexes", newEndId, "in_edges", type, (v)=> v ? [...v, id] : [id]);
  return () => replaceEdgeEnd(type, id, newEndId, oldEndId);
}
export function updateEdgeStartAndEnd(id: Id, start: Id, end: Id) {
  const revertTransactions = [];
  batch(() => {
    const edge = graph.edges[id];
    const oldStartId = edge.start;
    const oldEndId = edge.end;
    const isStartChanged = start && oldStartId !== start
    const isEndChanged = end && oldEndId !== end
    const type = graph.edges[id].label;
    if(isStartChanged){
      revertTransactions.push(replaceEdgeStart(type, id, oldStartId, start));
    }
    if(isEndChanged){
      revertTransactions.push(replaceEdgeStart(type, id, oldEndId, end));
    }
    if(isStartChanged || isEndChanged){
      setGraph('edges', id, {start, end});
      revertTransactions.push(() => setGraph('edges', id, {start: oldStartId, end: oldEndId}))
    }
  })
  return [id, revertTransactions];
}

export function deleteVertex(id: Id) {
  const vertex = klona(graph.vertexes[id]);
  batch(() => {
    graph.vertexes[id].labels.forEach(label => {
      setGraph("vertexLabelIdMap", label, ids => {
        if (ids.includes(id)) {
          return ids.filter(id_ => id_ !== id);
        } else {
          return ids;
        }
      });
    });
    setGraph("vertexes", id, undefined);
  });
  return [id, () => addNewVertex(vertex)];
}

export function deleteEdge(edgeId: Id) {
  const edge = klona(graph.edges[edgeId]);
  batch(() => {
    const type = graph.edges[edgeId].label;
    setGraph("vertexes", graph.edges[edgeId].start, "out_edges",type, (ids) => {
      if (ids && ids.includes(edgeId)) {
        return ids.filter(id_ => id_ !== edgeId);
      } else {
        return ids;
      }
    });

    setGraph("vertexes", graph.edges[edgeId].end, "in_edges", type,(ids) => {
      if (ids && ids.includes(edgeId)) {
        return ids.filter(id_ => id_ !== edgeId);
      } else {
        return ids;
      }
    });
    setGraph("edges", edgeId, undefined);
  });
  return [edgeId, () => addNewEdge(edge)];
}

export function addNewEdge(edge: Edge) {
  batch(() => {
    setGraph("edges", edge.id, edge);
    setGraph("vertexes", edge.start, "out_edges", edge.label, out_edges => {
      if(!out_edges){
        return [edge.id];
      } else if (!out_edges.includes(edge.id)) {
        return [...out_edges, edge.id];
      } else {
        return out_edges;
      }
    });
    setGraph("vertexes", edge.end, "in_edges",edge.label,  in_edges => {
      if(!in_edges){
        return [edge.id];
      } else if (!in_edges.includes(edge.id)) {
        return [...in_edges, edge.id];
      } else {
        return in_edges;
      }
    });
  });
  return [edge.id, () => deleteEdge(edge.id)];
}

export function findVertexIdsByLabel(label: string): Id[] {
  return graph.vertexLabelIdMap[label] || [];
}

export function getOutEdgeOfTypeIds(id: Id | string, edgeLabel: string): Id[] {
  return graph.vertexes[id].out_edges[edgeLabel] || [];
}

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