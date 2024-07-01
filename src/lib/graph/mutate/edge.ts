import { pipe } from "@mobily/ts-belt";
import { klona } from "klona";
import { batch } from "solid-js";
import { type SetStoreFunction, type Store, reconcile } from "solid-js/store";

import type { Edge, GraphInterface, Id } from "~/lib/graph/graph";

import { transactionDetailAdd } from "../transaction";

export function newEdge(
  edgeId: Id,
  type: string,
  properties: {},
  startVertexId: Id,
  endVertexId: Id,
): Edge {
  !(startVertexId) &&
    console.error(
      `edge startId should not be empty`,
    );
  !(endVertexId) &&
    console.error(
      `edge endId should not be empty`,
    );
  return {
    E: endVertexId,
    P: properties,
    S: startVertexId,
    T: type,
    id: edgeId,
  };
}

export function addNewEdge(
  txnId: number,
  edge: Edge,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  if (!edge.id) {
    return { error: "Edge ID is not valid" };
  }
  if (graph.edges[edge.id]) {
    return { error: "Edge ID already exist while adding new edge" };
  }
  if (!graph.vertexes[edge.S]) {
    return {
      error: `Edge Start Vertex ${edge.S} not exist while adding new edge`,
    };
  }
  if (!graph.vertexes[edge.E]) {
    return { error: "Edge End Vertex not exist while adding new edge" };
  }
  if (
    Array.isArray(graph.vertexes[edge.S].OUT[edge.T]) &&
    graph.vertexes[edge.S].OUT[edge.T].includes(edge.id)
  ) {
    return {
      error: `Edge ID ${edge.id} already exist in out_edges of the Start vertex ${edge.S}`,
    };
  }
  if (
    Array.isArray(graph.vertexes[edge.E].IN[edge.T]) &&
    graph.vertexes[edge.E].IN[edge.T].includes(edge.id)
  ) {
    return {
      error: `Edge ID ${edge.id} already exist in in_edges of the End vertex ${edge.E}`,
    };
  }
  batch(() => {
    setGraph("edges", edge.id, klona(edge));
    setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges: any) =>
      Array.isArray(out_edges) ? [...out_edges, edge.id] : [edge.id],
    );
    setGraph("vertexes", edge.E, "IN", edge.T, (in_edges: any) =>
      Array.isArray(in_edges) ? [...in_edges, edge.id] : [edge.id],
    );
  });
  const data = klona(edge);
  transactionDetailAdd(txnId, {
    data,
    insertEdge: () => data,
    redo: () => addNewEdge(0, data, graph, setGraph),
    revert: () => deleteEdge(0, edge.id, graph, setGraph),
  }, graph);
  return {
    error: false,
    txnDetailIndex: txnId ? graph.transactions.get(txnId)?.steps.length - 1 : -1,
  };
}

export function replaceEdgeProperties(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: {},
): { error: boolean | string; txnDetailIndex?: number } {
  if (!graph.edges[edgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const originalProperties = klona(graph.edges[edgeId].P);
  setGraph("edges", edgeId, "P", reconcile(klona(properties)));
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => replaceEdgeProperties(0, edgeId, graph, setGraph, data.P),
    replaceEdge: () => data,
    revert: () =>
      replaceEdgeProperties(0, edgeId, graph, setGraph, originalProperties),
  }, graph);
  return {
    error: false,
    txnDetailIndex: txnId ? graph.transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// private
export function replaceEdgeStart(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  newStartVertexId: Id,
): { error: boolean | string; txnDetailIndex?: number } {
  if (!graph.edges[edgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = graph.edges[edgeId];
  const oldStartVertexId = edge.S;
  if (oldStartVertexId === newStartVertexId) {
    return { error: "" };
  }
  batch(() => {
    setGraph("edges", edgeId, "S", newStartVertexId);
    // @ts-ignore
    setGraph("vertexes", oldStartVertexId, "OUT", edge.T, (v) =>
      Array.isArray(v)
        ? pipe(
            v.filter((e) => e !== edgeId),
            (f) => (f.length ? f : undefined),
          )
        : v,
    );
    setGraph("vertexes", newStartVertexId, "OUT", edge.T, (v: any) =>
      Array.isArray(v) ? [...v, edgeId] : [edgeId],
    );
  });
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => replaceEdgeStart(0, edgeId, graph, setGraph, data.S),
    replaceEdgeStart: () => data,
    revert: () =>
      replaceEdgeStart(0, edgeId, graph, setGraph, oldStartVertexId),
  }, graph);
  return {
    error: false,
    txnDetailIndex: txnId ? graph.transactions.get(txnId)!.steps.length - 1 : -1,
  };
}
//private
export function replaceEdgeEnd(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  newEndVertexId: Id,
): { error: boolean | string; txnDetailIndex?: number } {
  if (!graph.edges[edgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = graph.edges[edgeId];
  const oldEndVertexId = edge.E;
  if (oldEndVertexId === newEndVertexId) {
    return { error: "" };
  }
  batch(() => {
    setGraph("edges", edgeId, "E", newEndVertexId);
    // @ts-ignore
    setGraph("vertexes", oldEndVertexId, "IN", edge.T, (v) =>
      Array.isArray(v)
        ? pipe(
            v.filter((e) => e !== edgeId),
            (f) => (f.length ? f : undefined),
          )
        : v,
    );
    setGraph("vertexes", newEndVertexId, "IN", edge.T, (v: any) =>
      Array.isArray(v) ? [...v, edgeId] : [edgeId],
    );
  });
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => replaceEdgeEnd(0, edgeId, graph, setGraph, data.E),
    replaceEdgeEnd: () => data,
    revert: () => replaceEdgeEnd(0, edgeId, graph, setGraph, oldEndVertexId),
  }, graph);
  return {
    error: false,
    txnDetailIndex: txnId ? graph.transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

export function deleteEdge(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  if (!graph.edges[edgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = klona(graph.edges[edgeId]);
  batch(() => {
    const type = edge.T;
    // @ts-ignore
    setGraph("vertexes", graph.edges[edgeId].S, "OUT", type, (ids) =>
      Array.isArray(ids) && ids.includes(edgeId)
        ? pipe(
            ids.filter((id_) => id_ !== edgeId),
            (newIds) => (newIds.length ? newIds : undefined),
          )
        : ids,
    );
    // @ts-ignore
    setGraph("vertexes", graph.edges[edgeId].E, "IN", type, (ids) =>
      Array.isArray(ids) && ids.includes(edgeId)
        ? pipe(
            ids.filter((id_) => id_ !== edgeId),
            (newIds) => (newIds.length ? newIds : undefined),
          )
        : ids,
    );
    // @ts-ignore
    setGraph("edges", edgeId, undefined);
  });

  transactionDetailAdd(txnId, {
    data: edge,
    deleteEdge: () => edge,
    redo: () => deleteEdge(0, edgeId, graph, setGraph),
    revert: () => addNewEdge(0, edge, graph, setGraph),
  }, graph);
  return {
    error: false,
    txnDetailIndex: txnId ? graph.transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

export function updateEdgeId(
  oldEdgeId: Id,
  newEdgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!graph.edges[oldEdgeId]) {
    return { error: "ID is not valid" };
  }
  if (graph.edges[newEdgeId]) {
    return { error: "new Edge ID is not valid" };
  }
  setGraph("edges", newEdgeId, {
    ...klona(graph.edges[oldEdgeId]),
    id: newEdgeId,
  });
  setGraph(
    "vertexes",
    graph.edges[oldEdgeId].S,
    "OUT",
    graph.edges[oldEdgeId].T,
    (ids: any) => [...ids.filter((id: any) => id !== oldEdgeId), newEdgeId],
  );
  setGraph(
    "vertexes",
    graph.edges[oldEdgeId].E,
    "IN",
    graph.edges[oldEdgeId].T,
    (ids: any) => [...ids.filter((id: any) => id !== oldEdgeId), newEdgeId],
  );
  // @ts-ignore
  setGraph("edges", oldEdgeId, undefined);
  return { error: "" };
}
