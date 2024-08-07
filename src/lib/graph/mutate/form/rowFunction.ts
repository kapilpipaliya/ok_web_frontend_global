import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona/json";
import { batch, onCleanup } from "solid-js";

import { useToast } from "~/components/Toast";
import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";

import { getChildVertex } from "../../get/sync/getChildVertex";
import { getCompFallbackToString } from "../../get/sync/getCompFallbackToString";
import { getInEdge } from "../../get/sync/getInEdge";
import { getSelectionOptions } from "../../get/sync/getSelectionOptions";
import { getToEdge } from "../../get/sync/getToEdge";
import { commitTxn } from "../../transaction/commitTxn";
import { addNewEdge, newEdge } from "../edge";

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
  const { showErrorToast } = useToast();

  return batch(() => {
    const vertexNew = newVertex(
      graph.newVertexId,
      [label || edgeType!],
      properties,
    );
    const insertVertex = addNewVertex(txnId, vertexNew, graph, setGraph);
    if (insertVertex.error) {
      showErrorToast(insertVertex.error.toString());
      return {
        error: true,
      };
    }

    const edgeNew = newEdge(
      graph.newVertexId,
      edgeType || label!,
      {},
      inward ? vertexNew.id : parentVertex.id,
      inward ? parentVertex.id : vertexNew.id,
    );
    const insertEdgeResult = addNewEdge(txnId, edgeNew, graph, setGraph);
    if (insertEdgeResult.error) {
      showErrorToast(insertEdgeResult.error.toString());
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
  });
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
  if (isRealTime) {
    txnId = graph.newTxnId;
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

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  joinVertex: Vertex,
  meta: Vertex,
  tableColumnsTemplate: Vertex[],
) {
  const { showErrorToast } = useToast();

  const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], joinVertex);
  if (rowMetaAttrInst.error) {
    const rows = {} as { [key: Id]: Id };
    const metaTxnId = graph.newTxnId;
    const P = klona(meta.P);
    P.templateId = meta.id;
    batch(() => {
      const metaInstanceResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        joinVertex,
        "AttrInst",
        undefined,
        P,
      );
      if (metaInstanceResult.error) {
        showErrorToast("Error creating a row for attribute instance");
      }

      for (const attrColumn of tableColumnsTemplate) {
        const P = getColumnProps(attrColumn, graph);

        const AttrRowResult = newRow(
          graph,
          setGraph,
          metaTxnId,
          graph.vertexes[metaInstanceResult.vertexId!],
          "Attr",
          undefined,
          P,
        );
        if (AttrRowResult.error) {
          showErrorToast(AttrRowResult.error.toString());
        }

        rows[attrColumn.id] = AttrRowResult.vertexId!;
      }

      mergeVertexProperties(
        metaTxnId,
        metaInstanceResult.vertexId!,
        graph,
        setGraph,
        {
          metaTxnId,
          rows,
        },
      );
    });
    onCleanup(() => {
      // remove all AttrInst vertex.
      // TODO: This is breaking when new row is added, its interesting to fix this.
      // console.log('called', metaTxnId)
      // revertTransaction(metaTxnId, graph);
    });
    return metaTxnId;
  }
  const rows = klona(rowMetaAttrInst.vertex?.P.rows);
  const metaTxnId = rowMetaAttrInst.vertex?.P.metaTxnId;
  batch(() => {
    for (const attrColumn of tableColumnsTemplate) {
      if (rows[attrColumn.id]) {
        continue;
      }
      const AttrRowResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        graph.vertexes[rowMetaAttrInst.vertex!.id],
        "Attr",
      );
      if (AttrRowResult.error) {
        showErrorToast(AttrRowResult.error.toString());
      }
      const P = klona(attrColumn.P);
      P.templateId = attrColumn.id;

      if (!P.componentName) {
        const componentName = getCompFallbackToString(attrColumn, graph)?.P[
          IdAttr
        ];
        if (componentName) {
          P.componentName = componentName;
        }
      }
      mergeVertexProperties(
        metaTxnId,
        AttrRowResult.vertexId!,
        graph,
        setGraph,
        P,
      );
      rows[attrColumn.id] = AttrRowResult.vertexId!;
    }
    mergeVertexProperties(
      metaTxnId,
      rowMetaAttrInst.vertex!.id,
      graph,
      setGraph,
      { rows },
    );
  });
  onCleanup(() => {
    // remove all AttrInst vertex.
    // TODO: This is breaking when new row is added, its interesting to fix this.
    // console.log('called', metaTxnId)
    // revertTransaction(metaTxnId, graph);
  });
  return metaTxnId;
}
