import { klona } from "klona";
import { batch } from "solid-js";
import { reconcile, SetStoreFunction, Store } from "solid-js/store";
import { pipe } from "@mobily/ts-belt";
import {
 Id,
 isValidId,
 Relationship,
 transactionDetailAdd,
 transactions
} from "~/cypher_api/lib/graph";
import { GraphInterface } from "~/lib/graph/graph";

export function newEdge(
  edgeId: Id,
  type: string,
  properties: {},
  startVertexId: Id,
  endVertexId: Id,
): Relationship {
  !isValidId(startVertexId) &&
    console.error(
      `edge startId should be string, but received ${startVertexId}`,
    );
  !isValidId(endVertexId) &&
    console.error(
      `edge endId and endId should be string, but received ${endVertexId}`,
    );
  return {
    id: edgeId,
    T: type,
    P: properties,
    S: startVertexId,
    E: endVertexId,
  };
}

export function addNewEdgeUnSafe(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  edge: Relationship,
) {
  batch(() => {
    setGraph("edges", edge.id, edge);
    setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges) =>
      Array.isArray(out_edges) ? [...out_edges, edge.id] : [edge.id],
    );
    setGraph("vertexes", edge.E, "IN", edge.T, (in_edges) =>
      Array.isArray(in_edges) ? [...in_edges, edge.id] : [edge.id],
    );
  });
}

export function addNewEdge(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  edge: Relationship,
): { error: string | boolean; txnDetailIndex?: number } {
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
    setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges) =>
      Array.isArray(out_edges) ? [...out_edges, edge.id] : [edge.id],
    );
    setGraph("vertexes", edge.E, "IN", edge.T, (in_edges) =>
      Array.isArray(in_edges) ? [...in_edges, edge.id] : [edge.id],
    );
  });
  const data = klona(edge);
  transactionDetailAdd(txnId, {
    data,
    insertEdge: () => data,
    revert: () => deleteEdge(0, edge.id),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

export function replaceEdgeProperties(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  edgeId: Id,
  properties: {},
): { error: string | boolean; txnDetailIndex?: number } {
  if (!graph.edges[edgeId]) {
    return { error: "Edge ID is not valid" };
  }
  const originalProperties = klona(graph.edges[edgeId].P);
  setGraph("edges", edgeId, "P", reconcile(klona(properties)));
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    replaceEdge: () => data,
    revert: () =>
      replaceEdgeProperties(graph, setGraph, 0, edgeId, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// private
export const replaceEdgeStart = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  edgeId: Id,
  newStartVertexId: Id,
): { error: string | boolean; txnDetailIndex?: number } => {
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
    setGraph("vertexes", newStartVertexId, "OUT", edge.T, (v) =>
      Array.isArray(v) ? [...v, edgeId] : [edgeId],
    );
  });
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    replaceEdgeStart: () => data,
    revert: () =>
      replaceEdgeStart(graph, setGraph, 0, edgeId, oldStartVertexId),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
};
//private
export const replaceEdgeEnd = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  edgeId: Id,
  newEndVertexId: Id,
): { error: string | boolean; txnDetailIndex?: number } => {
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
    setGraph("vertexes", newEndVertexId, "IN", edge.T, (v) =>
      Array.isArray(v) ? [...v, edgeId] : [edgeId],
    );
  });
  const data = klona(graph.edges[edgeId]);
  transactionDetailAdd(txnId, {
    data,
    replaceEdgeEnd: () => data,
    revert: () => replaceEdgeEnd(graph, setGraph, 0, edgeId, oldEndVertexId),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
};

export function deleteEdge(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  edgeId: Id,
): { error: string | boolean; txnDetailIndex?: number } {
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
    revert: () => addNewEdge(graph, setGraph, 0, edge),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

export function updateEdgeId(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  oldEdgeId: Id,
  newEdgeId: Id,
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
    (ids) => [...ids.filter((id) => id !== oldEdgeId), newEdgeId],
  );
  setGraph(
    "vertexes",
    graph.edges[oldEdgeId].E,
    "IN",
    graph.edges[oldEdgeId].T,
    (ids) => [...ids.filter((id) => id !== oldEdgeId), newEdgeId],
  );
  // @ts-ignore
  setGraph("edges", oldEdgeId, undefined);
  return { error: "" };
}
