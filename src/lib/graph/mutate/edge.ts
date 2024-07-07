import { pipe } from "@mobily/ts-belt";
import { klona } from "klona";
import { batch } from "solid-js";
import { type SetStoreFunction, type Store, reconcile } from "solid-js/store";

import type { Edge, GraphInterface, Id } from "~/lib/graph/graph";

import { edgeOldIdToNewIdMap, vertexOldIdToNewIdMap } from "../transaction/TransactionType";
import { transactionDetailAdd } from "../transaction/transactionDetailAdd";

export function newEdge(
  edgeId: Id,
  type: string,
  properties: { [key: string]: any },
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
function updateEdge(edge: Edge) {
  const edge2 = klona(edge);
  edge2.id = edgeOldIdToNewIdMap.get(edge.id) || edge.id;
  edge2.S = vertexOldIdToNewIdMap.get(edge.S) || edge.S;
  edge2.E = vertexOldIdToNewIdMap.get(edge.E) || edge.E;
  return edge2;
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
  const actualEdgeId = edgeOldIdToNewIdMap.get(edge.id) || edge.id;
  const actualStartVertexId = vertexOldIdToNewIdMap.get(edge.S) || edge.S;
  const actualEndVertexId = vertexOldIdToNewIdMap.get(edge.E) || edge.E;

  if (!actualEdgeId) {
    return { error: "Edge ID is not valid" };
  }
  if (graph.edges[actualEdgeId]) {
    return { error: "Edge ID already exist while adding new edge" };
  }
  if (!graph.vertexes[actualStartVertexId]) {
    return {
      error: `Edge Start Vertex ${actualStartVertexId} not exist while adding new edge`,
    };
  }
  if (!graph.vertexes[actualEndVertexId]) {
    return { error: "Edge End Vertex not exist while adding new edge" };
  }
  if (
    Array.isArray(graph.vertexes[actualStartVertexId].OUT[edge.T]) &&
    graph.vertexes[actualStartVertexId].OUT[edge.T].includes(actualEdgeId)
  ) {
    return {
      error: `Edge ID ${actualEdgeId} already exist in out_edges of the Start vertex ${actualStartVertexId}`,
    };
  }
  if (
    Array.isArray(graph.vertexes[actualEndVertexId].IN[edge.T]) &&
    graph.vertexes[actualEndVertexId].IN[edge.T].includes(actualEdgeId)
  ) {
    return {
      error: `Edge ID ${actualEdgeId} already exist in in_edges of the End vertex ${actualEndVertexId}`,
    };
  }
  batch(() => {
    setGraph("edges", actualEdgeId, updateEdge(edge));
    setGraph("vertexes", actualStartVertexId, "OUT", edge.T, (out_edges: any) =>
      Array.isArray(out_edges) ? [...out_edges, actualEdgeId] : [actualEdgeId],
    );
    setGraph("vertexes", actualEndVertexId, "IN", edge.T, (in_edges: any) =>
      Array.isArray(in_edges) ? [...in_edges, actualEdgeId] : [actualEdgeId],
    );
  });
  const data = updateEdge(edge);
  transactionDetailAdd(txnId, {
    data,
    insertEdge: () => updateEdge(data),
    redo: () => addNewEdge(0, updateEdge(data), graph, setGraph),
    revert: () => deleteEdge(0, actualEdgeId, graph, setGraph),
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
  properties: { [key: string]: any },
): { error: boolean | string; txnDetailIndex?: number } {
  const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;

  if (!graph.edges[actualEdgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const originalProperties = klona(graph.edges[actualEdgeId].P);
  setGraph("edges", actualEdgeId, "P", reconcile(klona(properties)));
  const data = updateEdge(graph.edges[actualEdgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => {
      const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
      return replaceEdgeProperties(0, actualEdgeId2, graph, setGraph, data.P);
    },
    replaceEdge: () => updateEdge(data),
    revert: () =>
      {
        const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
        return replaceEdgeProperties(0, actualEdgeId2, graph, setGraph, originalProperties);
      },
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
  const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;
  const actualNewStartVertexId = vertexOldIdToNewIdMap.get(newStartVertexId) || newStartVertexId;

  if (!graph.edges[actualEdgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = updateEdge(graph.edges[actualEdgeId]);
  const oldStartVertexId = edge.S;
  if (oldStartVertexId === actualNewStartVertexId) {
    return { error: "" };
  }
  batch(() => {
    setGraph("edges", actualEdgeId, "S", actualNewStartVertexId);
    // @ts-expect-error
    setGraph("vertexes", oldStartVertexId, "OUT", edge.T, (v) =>
      Array.isArray(v)
        ? pipe(
            v.filter((e) => e !== actualEdgeId),
            (f) => (f.length ? f : undefined),
          )
        : v,
    );
    setGraph("vertexes", actualNewStartVertexId, "OUT", edge.T, (v: any) =>
      Array.isArray(v) ? [...v, actualEdgeId] : [actualEdgeId],
    );
  });
  const data = updateEdge(graph.edges[actualEdgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => {
      const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
      return replaceEdgeStart(0, actualEdgeId2, graph, setGraph, data.S);
    },
    replaceEdgeStart: () => updateEdge(data),
    revert: () =>
      {
        const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
        return replaceEdgeStart(0, actualEdgeId2, graph, setGraph, oldStartVertexId);
      },
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
  const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;
  const actualNewEndVertexId = vertexOldIdToNewIdMap.get(newEndVertexId) || newEndVertexId;

  if (!graph.edges[actualEdgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = updateEdge(graph.edges[actualEdgeId]);
  const oldEndVertexId = edge.E;
  if (oldEndVertexId === actualNewEndVertexId) {
    return { error: "" };
  }
  batch(() => {
    setGraph("edges", actualEdgeId, "E", actualNewEndVertexId);
    // @ts-expect-error
    setGraph("vertexes", oldEndVertexId, "IN", edge.T, (v) =>
      Array.isArray(v)
        ? pipe(
            v.filter((e) => e !== actualEdgeId),
            (f) => (f.length ? f : undefined),
          )
        : v,
    );
    setGraph("vertexes", actualNewEndVertexId, "IN", edge.T, (v: any) =>
      Array.isArray(v) ? [...v, actualEdgeId] : [actualEdgeId],
    );
  });
  const data = updateEdge(graph.edges[actualEdgeId]);
  transactionDetailAdd(txnId, {
    data,
    redo: () => {
      const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
      return replaceEdgeEnd(0, actualEdgeId2, graph, setGraph, data.E);
    },
    replaceEdgeEnd: () => updateEdge(data),
    revert: () => {
      const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
      return replaceEdgeEnd(0, actualEdgeId2, graph, setGraph, oldEndVertexId);
    },
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
  const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;

  if (!graph.edges[actualEdgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const edge = updateEdge(graph.edges[actualEdgeId]);
  batch(() => {
    const type = edge.T;
    // @ts-expect-error
    setGraph("vertexes", graph.edges[actualEdgeId].S, "OUT", type, (ids) =>
      Array.isArray(ids) && ids.includes(actualEdgeId)
        ? pipe(
            ids.filter((id_) => id_ !== actualEdgeId),
            (newIds) => (newIds.length ? newIds : undefined),
          )
        : ids,
    );
    // @ts-expect-error
    setGraph("vertexes", graph.edges[actualEdgeId].E, "IN", type, (ids) =>
      Array.isArray(ids) && ids.includes(actualEdgeId)
        ? pipe(
            ids.filter((id_) => id_ !== actualEdgeId),
            (newIds) => (newIds.length ? newIds : undefined),
          )
        : ids,
    );
    // @ts-expect-error
    setGraph("edges", actualEdgeId, undefined);
  });

  transactionDetailAdd(txnId, {
    data: edge,
    deleteEdge: () => updateEdge(edge),
    redo: () => {
      const actualEdgeId2 = edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
      return deleteEdge(0, actualEdgeId2, graph, setGraph);
    },
    revert: () => addNewEdge(0, updateEdge(edge), graph, setGraph),
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
