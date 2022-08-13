import { createStore, reconcile } from "solid-js/store";
import { batch } from "solid-js";

let id = 0;
export const getNewGraphId = () => {
  return ++id;
};

export const [graph, setGraph] = createStore({
  vertexes: {} as { [key: string]: Vertex },
  edges: {} as { [key: string]: Edge },
  vertexLabelIdMap: {} as { [key: string]: number[] }
});

interface Vertex {
  id: number;
  labels: string[];
  properties: {},
  in_edges: number[],
  out_edges: number[]
}

interface Edge {
  id: number;
  properties: {},
  label: string;
  start: string;
  end: string;
}

export const newVertex = (id: number, labels: string[], properties: {}): Vertex => {
  return {
    id,
    labels,
    properties,
    in_edges: [],
    out_edges: []
  };
};
export const newEdge = (id: number): Edge => {
  return {
    id,
    label: "",
    properties: {},
    start: "",
    end: ""
  };
};

export const addNewVertex = (vertex: Vertex) => {
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
};

export const replaceVertexProperties = (id: number, properties: {}) => {
  setGraph("vertexes", id, "properties", reconcile(properties));
};

export const deleteVertex = (id: number) => {
  batch(() => {
    graph.vertexes[id].labels.forEach(label => {
      setGraph("vertexLabelIdMap", label, ids => {
        if (!ids.includes(id)) {
          return ids.filter(id_ => id_ !== id);
        } else {
          return ids;
        }
      });
    });
    setGraph("vertexes", id, undefined);
  });
};


export const addNewEdge = (edge: Edge) => {
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
};

export const findVertexIdsByLabel = (label: string) => {
  return graph.vertexLabelIdMap[label];
};