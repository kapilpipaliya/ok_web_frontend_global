import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona/json";
import { batch, onCleanup } from "solid-js";

import type { GraphInterface, Id, Vertex } from "../../graph";

import { cloneVertexWithEdges } from "../../get/sync/cloneVertexWithEdges";
import { getChildVertex } from "../../get/sync/getChildVertex";
import { addNewEdge, newEdge } from "../edge";
import { mergeVertexProperties } from "../vertex";
import { getColumnProps, newRow } from "./addNewRow";

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  joinVertex: Vertex,
  tableMeta: Vertex,
  tableColumnsTemplate: Vertex[],
) {
  const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], joinVertex);
  // when we delete the row, revertTransaction will not work, so used new metaTxnId.
  //const metaTxnId = rowMetaAttrInst.error ? graph.newTxnId : rowMetaAttrInst.vertex?.P.metaTxnId;
  const metaTxnId = graph.newTxnId();
  const rows = rowMetaAttrInst.error
    ? {}
    : klona(rowMetaAttrInst.vertex?.P.rows);

  if (rowMetaAttrInst.error) {
    createNewMetaInstance(
      graph,
      setGraph,
      metaTxnId,
      joinVertex,
      tableMeta,
      tableColumnsTemplate,
      rows,
    );
  } else {
    updateExistingMetaInstance(
      graph,
      setGraph,
      metaTxnId,
      rowMetaAttrInst.vertex!,
      tableColumnsTemplate,
      rows,
    );
  }

  onCleanup(() => {
    // remove all AttrInst vertex.
    // TODO: This is breaking when new row is added, its interesting to fix this.
    // console.log('called', metaTxnId)
    // revertTransaction(metaTxnId, graph);
  });

  return metaTxnId;
}

export function createNewMetaInstance(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  joinVertex: Vertex,
  tableMeta: Vertex,
  tableColumnsTemplate: Vertex[],
  rows: { [key: Id]: Id },
) {
  const P = { ...klona(tableMeta.P), templateId: tableMeta.id };

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
      console.error("Error creating a row for attribute instance");
      return;
    }

    createAttributeRows(
      graph,
      setGraph,
      metaTxnId,
      metaInstanceResult.vertexId!,
      tableColumnsTemplate,
      rows,
    );

    mergeVertexProperties(
      metaTxnId,
      metaInstanceResult.vertexId!,
      graph,
      setGraph,
      { metaTxnId, rows },
    );
  });
}

export function updateExistingMetaInstance(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  metaInstance: Vertex,
  tableColumnsTemplate: Vertex[],
  rows: { [key: Id]: Id },
) {
  batch(() => {
    createAttributeRows(
      graph,
      setGraph,
      metaTxnId,
      metaInstance.id,
      tableColumnsTemplate,
      rows,
    );
    mergeVertexProperties(metaTxnId, metaInstance.id, graph, setGraph, {
      rows,
    });
  });
}
function createAttributeRows(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  parentId: Id,
  tableColumnsTemplate: Vertex[],
  rows: { [key: Id]: Id },
) {
  for (const attrColumn of tableColumnsTemplate) {
    if (rows[attrColumn.id]) {
      continue;
    }

    // now this P is not needed, just use {}
    const P = getColumnProps(attrColumn, graph);

    // instead of addRow, use cloneVertexWithEdges and add the edge manually
    const attrRowClone = cloneVertexWithEdges(
      metaTxnId,
      attrColumn,
      P,
      graph,
      setGraph,
    );
    const edgeNew = newEdge(
      graph.newVertexId(),
      "Attr",
      {},
      parentId,
      attrRowClone.id,
    );
    const insertEdgeResult = addNewEdge(metaTxnId, edgeNew, graph, setGraph);
    if (insertEdgeResult.error) {
      console.error(insertEdgeResult.error.toString());
      return;
    }

    rows[attrColumn.id] = attrRowClone.id;

    // now not needed because we are using cloneVertexWithEdges, so it use children attributes same.
    // Recursively clone child Attrs
    /* const childAttrs = evalExpression('->Attr', {
      graph,
      setGraph,
      vertexes: [attrColumn],
    }) || [];

    if (childAttrs.length > 0) {
      createAttributeRows(
        graph,
        setGraph,
        metaTxnId,
        attrRowClone.id,
        childAttrs,
        rows
      );
    }*/
  }
}
