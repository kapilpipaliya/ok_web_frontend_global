import { klona } from "klona";
import { batch, untrack } from "solid-js";
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";

import type { Edge, GraphInterface, Id } from "~/lib/graph/graph";

import { getLastTxnIndex } from "../transaction/getLastTxnIndex";
import { transactionDetailAdd } from "../transaction/transactionDetailAdd";
import {
  edgeOldIdToNewIdMap,
  vertexOldIdToNewIdMap,
} from "../transaction/TransactionType";
import { channel } from "~/components/page_designer/layout/channel";

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

function updateEdge(edge: Edge) {
  return untrack(() => {
    const edge2 = klona(edge);
    edge2.id = edgeOldIdToNewIdMap.get(edge.id) || edge.id;
    edge2.S = vertexOldIdToNewIdMap.get(edge.S) || edge.S;
    edge2.E = vertexOldIdToNewIdMap.get(edge.E) || edge.E;
    return edge2;
  });
}

export function addNewEdge(
  txnId: number,
  edge: Edge,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: boolean }
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
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
    const data = updateEdge(edge);
    transactionDetailAdd(
      txnId,
      {
        data,
        insertEdge: () => updateEdge(data),
        redo: () => addNewEdge(0, updateEdge(data), graph, setGraph),
        revert: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return deleteEdge(0, actualEdgeId2, graph, setGraph);
        },
      },
      graph,
      setGraph,
    );
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({addNewEdge: {txnId, edge}}));
    }
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
  options?: { skipPostMessage?: boolean }
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const originalProperties = klona(graph.edges[actualEdgeId].P);
    setGraph("edges", actualEdgeId, "P", reconcile(klona(properties)));
    const data = updateEdge(graph.edges[actualEdgeId]);
    transactionDetailAdd(
      txnId,
      {
        data,
        redo: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeProperties(0, actualEdgeId2, graph, setGraph, data.P);
        },
        replaceEdge: () => updateEdge(data),
        revert: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeProperties(
            0,
            actualEdgeId2,
            graph,
            setGraph,
            originalProperties,
          );
        },
      },
      graph,
      setGraph,
    );
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({replaceEdgeProperties: {txnId, edgeId, properties}}));
    }
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
  options?: { skipPostMessage?: boolean }
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;
    const actualNewStartVertexId =
      vertexOldIdToNewIdMap.get(newStartVertexId) || newStartVertexId;

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
    const data = updateEdge(graph.edges[actualEdgeId]);
    transactionDetailAdd(
      txnId,
      {
        data,
        redo: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeStart(0, actualEdgeId2, graph, setGraph, data.S);
        },
        replaceEdgeStart: () => updateEdge(data),
        revert: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeStart(
            0,
            actualEdgeId2,
            graph,
            setGraph,
            oldStartVertexId,
          );
        },
      },
      graph,
      setGraph,
    );
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({replaceEdgeStart: {txnId, edgeId, newStartVertexId}}));
    }
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

// private
export function replaceEdgeEnd(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  newEndVertexId: Id,
  options?: { skipPostMessage?: boolean }
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;
    const actualNewEndVertexId =
      vertexOldIdToNewIdMap.get(newEndVertexId) || newEndVertexId;

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
    const data = updateEdge(graph.edges[actualEdgeId]);
    transactionDetailAdd(
      txnId,
      {
        data,
        redo: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeEnd(0, actualEdgeId2, graph, setGraph, data.E);
        },
        replaceEdgeEnd: () => updateEdge(data),
        revert: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return replaceEdgeEnd(
            0,
            actualEdgeId2,
            graph,
            setGraph,
            oldEndVertexId,
          );
        },
      },
      graph,
      setGraph,
    );
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({replaceEdgeEnd: {txnId, edgeId, newEndVertexId}}));
    }
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
  options?: { skipPostMessage?: boolean }
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = edgeOldIdToNewIdMap.get(edgeId) || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdge(graph.edges[actualEdgeId]);
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
        deleteEdge: () => updateEdge(data),
        redo: () => {
          const actualEdgeId2 =
            edgeOldIdToNewIdMap.get(actualEdgeId) || actualEdgeId;
          return deleteEdge(0, actualEdgeId2, graph, setGraph);
        },
        revert: () => addNewEdge(0, updateEdge(data), graph, setGraph),
      },
      graph,
      setGraph,
    );
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({deleteEdge: {txnId, edgeId}}));
    }
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
  options?: { skipPostMessage?: boolean }
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
    if (!options?.skipPostMessage) {
      channel.postMessage(JSON.stringify({updateEdgeId: {oldEdgeId, newEdgeId}}));
    }
    return { error: "" };
  });
}
