import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona/json";
import { batch, onCleanup } from "solid-js";

import type { GraphInterface, Id, Vertex } from "../../graph";

import { cloneVertexWithEdges } from "../../get/sync/cloneVertexWithEdges";
import { generateNewTxnId } from "../../transaction/generateNewTxnId";
import { generateNewVertexId } from "../../transaction/generateNewVertexId";
import { revertTransaction } from "../../transaction/revertTransaction";
import { addNewEdge, newEdge } from "../edge";
import { mergeVertexProperties } from "../vertex";
import { newRow } from "./addNewRow";

export function createNewMetaInstance(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  joinVertex: Vertex,
  tableMetaInstance: Vertex,
  tableColumnsTemplate: Vertex[],
  rows: { [key: Id]: Id },
) {
  return batch(() => {
    const metaInstanceResult = newRow(
      graph,
      setGraph,
      metaTxnId,
      tableMetaInstance,
      "AttrInst",
      undefined,
      { templateId: tableMetaInstance.id },
    );
    if (metaInstanceResult.error) {
      console.error("Error creating a row for attribute instance");
      return;
    }

    mergeVertexProperties(
      0,
      tableMetaInstance.id,
      graph,
      setGraph,
      { rows: { ...(rows ?? {}), [joinVertex.id]: metaInstanceResult.vertexId! } },
      { cloneProperties: false },
    );

    const columns = {};
    createAttributeRows(
      graph,
      setGraph,
      metaTxnId,
      metaInstanceResult.vertexId!,
      tableColumnsTemplate,
      columns,
    );

    mergeVertexProperties(
      metaTxnId,
      metaInstanceResult.vertexId!,
      graph,
      setGraph,
      { columns, metaTxnId },
    );
    return metaInstanceResult.vertexId
  });
}

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  tableMetaInstance: Vertex,
  tableColumnsTemplate: Vertex[],
  joinVertex: Vertex,
) {
  // const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], tableMeta);

  const metaTxnId = generateNewTxnId(graph, setGraph);
  const rows = klona(tableMetaInstance?.P.rows || {});

  if ((rows[joinVertex.id] && graph.vertexes[rows[joinVertex.id]])) {
    updateExistingMetaInstance(
      graph,
      setGraph,
      metaTxnId,
      graph.vertexes[rows[joinVertex.id]],
      tableColumnsTemplate,
      rows,
    );
  } else {
    createNewMetaInstance(
      graph,
      setGraph,
      metaTxnId,
      joinVertex,
      tableMetaInstance,
      tableColumnsTemplate,
      rows,
    );
  }

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return metaTxnId;
}

export function updateExistingMetaInstance(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  metaInstance: Vertex,
  tableColumnsTemplate: Vertex[],
  columns: { [key: Id]: Id },
) {
  batch(() => {
    createAttributeRows(
      graph,
      setGraph,
      metaTxnId,
      metaInstance.id,
      tableColumnsTemplate,
      columns,
    );
    mergeVertexProperties(metaTxnId, metaInstance.id, graph, setGraph, {
      columns,
    });
  });
}
function createAttributeRows(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaTxnId: number,
  parentId: Id,
  tableColumnsTemplate: Vertex[],
  columns: { [key: Id]: Id },
) {
  for (const attrColumn of tableColumnsTemplate) {
    if (columns[attrColumn.id]) {
      continue;
    }

    const P = klona(attrColumn.P);
    P.templateId = attrColumn.id;

    // instead of addRow, use cloneVertexWithEdges and add the edge manually
    const attrRowClone = cloneVertexWithEdges(
      metaTxnId,
      attrColumn,
      P,
      graph,
      setGraph,
    );
    const edgeNew = newEdge(
      generateNewVertexId(graph, setGraph),
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

    columns[attrColumn.id] = attrRowClone.id;

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
