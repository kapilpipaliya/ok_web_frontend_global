import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona/json";
import { batch, untrack } from "solid-js";

import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";

import { getCompFallbackToString } from "../../get/sync/getCompFallbackToString";
import { getInEdge } from "../../get/sync/getInEdge";
import { getSelectionOptions } from "../../get/sync/getSelectionOptions";
import { getToEdge } from "../../get/sync/getToEdge";
import { commitTxn } from "../../transaction/commitTxn";
import { addNewEdge, newEdge } from "../edge";
import { generateNewVertexId } from "../../transaction/generateNewVertexId";
import { generateNewTxnId } from "../../transaction/generateNewTxnId";

export function getSublistRowsForType(
  graph: Store<GraphInterface>,
  type: string,
  vertex: Vertex,
) {
  return (
    getSelectionOptions(graph, () => 0, `->${type}`, [vertex]).vertexes || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}

export function getSublistRows(
  graph: Store<GraphInterface>,
  meta: Vertex,
  vertex?: Vertex,
) {
  if (!vertex) {
    return [];
  }
  // This should check for inward edges too
  const type = getToEdge(meta, vertex);
  return (
    getSelectionOptions(graph, () => 0, `->${type}`, [vertex]).vertexes || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}

export function newRow(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  parentVertex: Vertex,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any },
  inward?: boolean,
): { edgeId?: Id; error: boolean; vertexId?: Id } {
  return untrack(() => batch(() => {
    const vertexNew = newVertex(
      generateNewVertexId(graph, setGraph),
      [label || edgeType!],
      properties,
    );
    const insertVertex = addNewVertex(txnId, vertexNew, graph, setGraph);
    if (insertVertex.error) {
      console.error(insertVertex.error.toString());
      return {
        error: true,
      };
    }

    const edgeNew = newEdge(
      generateNewVertexId(graph, setGraph),
      edgeType || label!,
      {},
      inward ? vertexNew.id : parentVertex.id,
      inward ? parentVertex.id : vertexNew.id,
    );
    const insertEdgeResult = addNewEdge(txnId, edgeNew, graph, setGraph);
    if (insertEdgeResult.error) {
      console.error(insertEdgeResult.error.toString());
      return {
        error: true,
        vertexId: vertexNew.id,
      };
    }
    return {
      edgeId: edgeNew.id,
      error: false,
      vertexId: vertexNew.id,
    };
  }));
}

export function addNewRow(
  txnId: number,
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertex: Vertex,
  properties: { [key: string]: any },
  isRealTime: boolean,
) {
  return untrack(() => {
    if (isRealTime) {
      txnId = generateNewTxnId(graph, setGraph);
    }
    const type = meta.P.inward
      ? getInEdge(meta, parentVertex)
      : getToEdge(meta, parentVertex);
    const label = meta.P.label;

    const newRowResult = newRow(
      graph,
      setGraph,
      txnId,
      parentVertex,
      label,
      type,
      properties,
      meta.P.inward,
    );
    if (isRealTime) {
      commitTxn(txnId, graph);
    }
    return newRowResult;
  });
}

export function getColumnProps(attrColumn: Vertex, graph: GraphInterface) {
  const P = klona(attrColumn.P);
  P.templateId = attrColumn.id;

  if (!P.componentName) {
    const componentName = getCompFallbackToString(attrColumn, graph)?.P[IdAttr];
    if (componentName) {
      P.componentName = componentName;
    }
  }
  return P;
}
