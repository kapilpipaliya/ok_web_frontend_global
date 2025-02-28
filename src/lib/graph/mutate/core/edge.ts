import { klona } from "klona";
import { batch, untrack } from "solid-js";
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";

import type { Edge, GraphInterface, Id } from "~/lib/graph/graph";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import { getLastTxnIndex } from "../../transaction/value/getLastTxnIndex";
import { transactionDetailAdd } from "../../transaction/core/transactionDetailAdd";

// TODO: is error is handle in all functions?
export function addNewEdge(
  txnId: number,
  edge: Edge,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edge.id] || edge.id;
    const actualStartVertexId =
      getVertexOldIdToNewIdMap(graph)[edge.S] || edge.S;
    const actualEndVertexId = getVertexOldIdToNewIdMap(graph)[edge.E] || edge.E;

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
      setGraph("edges", actualEdgeId, updateEdgeIdsToNew(edge, graph));
      setGraph(
        "vertexes",
        actualStartVertexId,
        "OUT",
        edge.T,
        (out_edges: any) =>
          Array.isArray(out_edges)
            ? [...out_edges, actualEdgeId]
            : [actualEdgeId],
      );
      setGraph("vertexes", actualEndVertexId, "IN", edge.T, (in_edges: any) =>
        Array.isArray(in_edges) ? [...in_edges, actualEdgeId] : [actualEdgeId],
      );
    });
    const data = updateEdgeIdsToNew(edge, graph);
    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualEdgeId,
        insertEdge: "insertEdgeFn",
        originalData: klona(edge),
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { addNewEdge: { edge, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

export function deleteEdge(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    batch(() => {
      const type = edge.T;
      setGraph("vertexes", graph.edges[actualEdgeId].S, "OUT", type, (ids) => {
        const filteredIds = Array.isArray(ids)
          ? ids.filter((id_) => id_ !== actualEdgeId)
          : ids;
        return filteredIds.length ? filteredIds : undefined;
      });
      setGraph("vertexes", graph.edges[actualEdgeId].E, "IN", type, (ids) => {
        const filteredIds = Array.isArray(ids)
          ? ids.filter((id_) => id_ !== actualEdgeId)
          : ids;
        return filteredIds.length ? filteredIds : undefined;
      });
      setGraph("edges", actualEdgeId, undefined);
    });

    const data = klona(edge);

    transactionDetailAdd(
      txnId,
      {
        data,
        deleteEdge: "deleteEdgeFn",
        id: actualEdgeId,
        originalData: klona(edge),
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { deleteEdge: { edgeId, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

export function newEdge(
  edgeId: Id,
  type: string,
  properties: { [key: string]: any },
  startVertexId: Id,
  endVertexId: Id,
): Edge {
  !startVertexId && console.error("edge startId should not be empty");
  !endVertexId && console.error("edge endId should not be empty");
  return {
    E: endVertexId,
    id: edgeId,
    P: properties,
    S: startVertexId,
    T: type,
  };
}

// private
export function replaceEdgeEnd(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  newEndVertexId: Id,
  options?: { skipPostMessage?: string },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;
    const actualNewEndVertexId =
      getVertexOldIdToNewIdMap(graph)[newEndVertexId] || newEndVertexId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    const oldEndVertexId = edge.E;
    if (oldEndVertexId === actualNewEndVertexId) {
      return { error: "" };
    }
    batch(() => {
      setGraph("edges", actualEdgeId, "E", actualNewEndVertexId);
      setGraph("vertexes", oldEndVertexId, "IN", edge.T, (v) => {
        const filteredV = Array.isArray(v)
          ? v.filter((e) => e !== actualEdgeId)
          : v;
        return filteredV.length ? filteredV : undefined;
      });
      setGraph("vertexes", actualNewEndVertexId, "IN", edge.T, (v: any) =>
        Array.isArray(v) ? [...v, actualEdgeId] : [actualEdgeId],
      );
    });
    const data = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualEdgeId,
        originalData: klona(edge),
        replaceEdgeEnd: "replaceEdgeEndFn",
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceEdgeEnd: { edgeId, newEndVertexId, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

export function replaceEdgeProperties(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any },
  options?: { skipPostMessage?: string },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const originalProperties = klona(graph.edges[actualEdgeId].P);
    setGraph("edges", actualEdgeId, "P", reconcile(klona(properties)));
    const data = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualEdgeId,
        originalData: originalProperties,
        replaceEdge: "replaceEdgeFn",
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceEdgeProperties: { edgeId, properties, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

// private
export function replaceEdgeStart(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  newStartVertexId: Id,
  options?: { skipPostMessage?: string },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;
    const actualNewStartVertexId =
      getVertexOldIdToNewIdMap(graph)[newStartVertexId] || newStartVertexId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    const oldStartVertexId = edge.S;
    if (oldStartVertexId === actualNewStartVertexId) {
      return { error: "" };
    }
    batch(() => {
      setGraph("edges", actualEdgeId, "S", actualNewStartVertexId);
      setGraph("vertexes", oldStartVertexId, "OUT", edge.T, (v) => {
        const filteredV = Array.isArray(v)
          ? v.filter((e) => e !== actualEdgeId)
          : v;
        return filteredV.length ? filteredV : undefined;
      });
      setGraph("vertexes", actualNewStartVertexId, "OUT", edge.T, (v: any) =>
        Array.isArray(v) ? [...v, actualEdgeId] : [actualEdgeId],
      );
    });
    const data = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualEdgeId,
        originalData: klona(edge),
        replaceEdgeStart: "replaceEdgeStartFn",
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceEdgeStart: { edgeId, newStartVertexId, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

export function updateEdgeId(
  oldEdgeId: Id,
  newEdgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
) {
  return untrack(() => {
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
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateEdgeId: { newEdgeId, oldEdgeId } },
    );
    return { error: "" };
  });
}

// make sure to use klona to avoid cant mutate edge issues
export function updateEdgeIdsToNew(edge: Edge, graph: Store<GraphInterface>) {
  return untrack(() => {
    const edge2 = klona(edge);
    edge2.id = getEdgeOldIdToNewIdMap(graph)[edge.id] || edge.id;
    edge2.S = getVertexOldIdToNewIdMap(graph)[edge.S] || edge.S;
    edge2.E = getVertexOldIdToNewIdMap(graph)[edge.E] || edge.E;
    return edge2;
  });
}
