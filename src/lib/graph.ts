import { createStore, reconcile } from "solid-js/store";
import { batch, createComputed } from "solid-js";
import { get, set } from "idb-keyval";
import { klona } from "klona";

// ********
// Types
// ********

interface Vertex {
  id: Id;
  labels: string[];
  properties: {},
  in_edges: Id[],
  out_edges: Id[]
}

interface Edge {
  id: Id;
  properties: {},
  label: string;
  start: Id;
  end: Id;
}

export enum Vertexs {
  // Base
  ServerAttributeType = "ServerAttributeType", // all type of the server
  FormAttributeType = "FormAttributeType", // all input components for the servertype
  Attribute = "Attribute",
  Collection = "Collection",
  FormLayout = "FormLayout",
  TableLayout = "TableLayout",
  CardLayout = "CardLayout",
  // Auth
  User = "User",
  Role = "Role",
  Permission = "Permission",
}

export enum Edges {
  ServerToFormAttributeType = "ServerToFormAttributeType"
}

// ********

// Id is used as string because its used as object keys.
export type Id = string;

let id = 0;

export function getNewGraphId(): Id {
  return `${++id}`;
}

// this is the In-Memory Graph Store, entire application will be based on this to work offline.
export const [graph, setGraph] = createStore({
  vertexes: {} as { [key: string]: Vertex },
  edges: {} as { [key: string]: Edge },
  vertexLabelIdMap: {} as { [key: string]: Id[] }
});

// ***********
// Development
// ***********
restoreFromIndexDB();
createComputed(() => {
  backupToIndexDB();
});
// ***********

export function resetDatabase() {
  setGraph(reconcile({
    vertexes: {} as { [key: string]: Vertex },
    edges: {} as { [key: string]: Edge },
    vertexLabelIdMap: {} as { [key: string]: Id[] }
  }));
}

export function newVertex(id: Id, labels: string[], properties: {}): Vertex {
  return {
    id,
    labels,
    properties,
    in_edges: [],
    out_edges: []
  };
}

export function newEdge(id: Id, label: string, properties: {}, start: Id, end: Id): Edge {
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
}

export function replaceVertexProperties(id: Id, properties: {}) {
  setGraph("vertexes", id, "properties", reconcile(properties));
}

export function replaceEdgeProperties(id: Id, properties: {}) {
  setGraph("edges", id, "properties", reconcile(properties));
}

export function deleteVertex(id: Id) {
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
  return true;
}

export function deleteEdge(id: Id) {
  batch(() => {
    setGraph("vertexes", graph.edges[id].start, "out_edges", (ids) => {
      if (ids.includes(id)) {
        return ids.filter(id_ => id_ !== id);
      } else {
        return ids;
      }
    });

    setGraph("vertexes", graph.edges[id].end, "in_edges", (ids) => {
      if (ids.includes(id)) {
        return ids.filter(id_ => id_ !== id);
      } else {
        return ids;
      }
    });
    setGraph("edges", id, undefined);
  });
};


export function addNewEdge(edge: Edge) {
  batch(() => {
    setGraph("edges", edge.id, edge);
    setGraph("vertexes", edge.start, "out_edges", out_edges => {
      if (!out_edges.includes(edge.id)) {
        return [...out_edges, edge.id];
      } else {
        return out_edges;
      }
    });
    setGraph("vertexes", edge.end, "in_edges", in_edges => {
      if (!in_edges.includes(edge.id)) {
        return [...in_edges, edge.id];
      } else {
        return in_edges;
      }
    });
  });
}

export function findVertexIdsByLabel(label: string) {
  return graph.vertexLabelIdMap[label] || [];
}

export function getOutEdgeOfTypeIds(id: Id | string, edgeLabel: string): Id[] {
  return graph.vertexes[id].out_edges.filter(edge => graph.edges[edge].label == edgeLabel);
}

/** depricated */
export function getOutEdgeOfType(id: Id | string, edgeLabel: string): Edge[] {
  return graph.vertexes[id].out_edges.filter(edge => graph.edges[edge].label == edgeLabel).map(edge => graph.edges[edge]);
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