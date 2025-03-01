import type {SetStoreFunction} from "solid-js/store";

import {batch} from "solid-js";

import type {Edge, EdgeMap, GraphInterface, Id, Vertex, VertexMap} from "~/lib/graph/graph";

import {
  addNewEdge,
  deleteEdge,
  replaceEdgeEnd,
  replaceEdgeProperties,
  replaceEdgeStart
} from "~/lib/graph/mutate/core/edge";
import {UpdateOptions} from "~/lib/graph/mutate/core/setGraphData";
import {addNewVertex, deleteVertex, replaceVertexProperties} from "~/lib/graph/mutate/core/vertex";
import {getLastTxnIndex} from "~/lib/graph/transaction/value/getLastTxnIndex";

export function setGraphDataWithTransaction(
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  args: {
    deleted_edges?: string[];
    deleted_vertexes?: string[];
    edges: EdgeMap;
    timestamp?: number;
    vertexes: VertexMap;
    vertexLabelIdMap?: { [key: string]: Id[] };
  },
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  let error: boolean | string = false;
  let txnDetailIndex: number | undefined = undefined;

  batch(() => {
    for (const vertexId in args.vertexes) {
      const result = updateVertexWithTransaction(
        txnId,
        vertexId,
        args.vertexes[vertexId],
        graph,
        setGraph,
        options
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }

    for (const edgeId in args.edges) {
      const result = updateEdgeWithTransaction(
        txnId,
        edgeId,
        args.edges[edgeId],
        graph,
        setGraph,
        options
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }

    if (args.deleted_edges || args.deleted_vertexes) {
      const result = handleDeletionsWithTransaction(
        txnId,
        args.deleted_edges,
        args.deleted_vertexes,
        graph,
        setGraph,
        options,
      );
      if (result.error) {
        error = result.error;
      }
      if (result.txnDetailIndex !== undefined) {
        txnDetailIndex = result.txnDetailIndex;
      }
    }
  });

  return {error, txnDetailIndex};
}

export function updateEdgeWithTransaction(
  txnId: number,
  edgeId: string,
  edge: Edge,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  const {skipExisting = false} = options;

  const originalEdge = graph.edges[edgeId];

  // NOTE: this skipExisting may cause bug in rare cases here
  if (skipExisting && originalEdge) {
    return {error: false};
  }

  if (originalEdge) {
    if (JSON.stringify(originalEdge.P) !== JSON.stringify(edge.P)) {
      const result = replaceEdgeProperties(txnId, edgeId, graph, setGraph, originalEdge.P, options);
      if (result.error) {
        return result;
      }
    }
    if (edge.S !== originalEdge.S) {
      replaceEdgeStart(txnId, edgeId, graph, setGraph, edge.S, options);
    }
    if (edge.E !== originalEdge.E) {
      replaceEdgeEnd(txnId, edgeId, graph, setGraph, edge.E, options);
    }
  } else {
    return addNewEdge(txnId, edge, graph, setGraph, options);
  }

  return {
    error: false,
    txnDetailIndex: getLastTxnIndex(txnId, graph),
  };
}

export function updateVertexWithTransaction(
  txnId: number,
  vertexId: string,
  vertexData: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  const {skipExisting = false} = options;

  const originalVertex = graph.vertexes[vertexId];

  if (skipExisting && originalVertex) {
    return {error: false};
  }

  return originalVertex ? replaceVertexProperties(txnId, vertexId, graph, setGraph, originalVertex.P, options) : addNewVertex(txnId, vertexData, graph, setGraph, options);
}

function handleDeletionsWithTransaction(
  txnId: number,
  deletedEdges: string[] | undefined,
  deletedVertexes: string[] | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
): { error: boolean | string; txnDetailIndex?: number } {
  let error: boolean | string = false;
  let txnDetailIndex: number | undefined = undefined;

  for (const edgeId of deletedEdges || []) {
    const result = deleteEdge(txnId, edgeId, graph, setGraph, options);
    if (result.error) {
      error = result.error;
    }
    if (result.txnDetailIndex !== undefined) {
      txnDetailIndex = result.txnDetailIndex;
    }
  }

  for (const vertexId of deletedVertexes || []) {
    const result = deleteVertex(txnId, vertexId, graph, setGraph, options);
    if (result.error) {
      error = result.error;
    }
    if (result.txnDetailIndex !== undefined) {
      txnDetailIndex = result.txnDetailIndex;
    }
  }

  return {error, txnDetailIndex};
}