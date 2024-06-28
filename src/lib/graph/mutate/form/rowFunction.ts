import {
  IdAttr,
  type GraphInterface,
  type Id, type Vertex
} from "~/lib/graph/graph";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId
} from "../../transaction";
import { addNewVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { batch, onCleanup } from "solid-js";
import { getChildVertex, getChildVertexes } from "../../get/sync/traverse";
import type { SetStoreFunction, Store } from "solid-js/store";
import { useToast } from "~/components/Toast";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { getToEdge } from "../../get/sync/traverse";
import { newEdge, addNewEdge } from "../edge";
import { klona } from "klona/json";
import { getCollAttrComp } from "../../get/sync/graph_functions";
import { getUniqueName } from "~/lib/drag_drop/getChildrenAttrs";


export function getSublistRowsForType(
  graph: Store<GraphInterface>,
  type: string,
  vertex: Vertex
) {
  return (getChildVertexes(graph, [`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos
  );
}

export function getSublistRows(
  graph: Store<GraphInterface>,
  meta: Vertex,
  vertex?: Vertex
) {
  if (!vertex) return [];
  // This should check for inward edges too
  const type = getToEdge(meta, vertex);
  return (getChildVertexes(graph, [`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos
  );
}

export function newRow(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  parentVertex: Vertex,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any; }
): { error: boolean; vertexId?: Id; edgeId?: Id; } {
  const { showErrorToast } = useToast();

  return batch(() => {
    const vertexNew = newVertex(
      getNewGraphId(),
      [label || edgeType!],
      properties
    );
    const insertVertex = addNewVertex(txnId, vertexNew, graph, setGraph);
    if (insertVertex.error) {
      showErrorToast(insertVertex.error.toString());
      return {
        error: true,
      };
    }

    const edgeNew = newEdge(
      getNewGraphId(),
      edgeType || label!,
      {},
      parentVertex.id,
      vertexNew.id
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
      error: false,
      vertexId: vertexNew.id,
      edgeId: edgeNew.id,
    };
  });
}

export function addNewRow(
  txnId: number,
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertex: Vertex,
  properties: { [key: string]: any; },
  isRealTime: boolean,
  Ws: ServerEventsDispatcher
) {
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  const type = getToEdge(meta, parentVertex);
  const label = meta.P.label;

  const newRowResult = newRow(
    graph,
    setGraph,
    txnId,
    parentVertex,
    label,
    type,
    properties
  );
  if (isRealTime) commitTxn(txnId, Ws, graph);
  return newRowResult;
}
export function cloneRowProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formVertex: Vertex,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex
) {
  const props = JSON.parse(JSON.stringify(fromVertex.P));
  delete props.pos;
  const uniqueName = getUniqueName(txnId, graph, setGraph, formVertex, {id: 0} as unknown as Vertex);
  mergeVertexProperties(txnId, toVertex.id, graph, setGraph, {...props, name: uniqueName});
  return;
}

export function getColumnProps(attrColumn: Vertex, graph: GraphInterface) {
  const P = klona(attrColumn.P);
  P.templateId = attrColumn.id;

  if (!P.component) {
    const component = getCollAttrComp(attrColumn, graph)?.P[IdAttr];
    if (component) P.component = component;
  }
  return P;
}

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  joinVertex: Vertex,
  meta: Vertex,
  tableColumnsTemplate: Vertex[]
) {
  const { showErrorToast } = useToast();

  const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], joinVertex);
  if (rowMetaAttrInst.error) {
    const rows = {} as { [key: Id]: Id; };
    const metaTxnId = getNewTxnId(graph, setGraph);
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
        P
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
          "MetaAttr",
          undefined,
          P
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
          rows,
          metaTxnId,
        }
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
        "MetaAttr"
      );
      if (AttrRowResult.error) {
        showErrorToast(AttrRowResult.error.toString());
      }
      const P = klona(attrColumn.P);
      P.templateId = attrColumn.id;

      if (!P.component) {
        const component = getCollAttrComp(attrColumn, graph)?.P[IdAttr];
        if (component) P.component = component;
      }
      mergeVertexProperties(
        metaTxnId,
        AttrRowResult.vertexId!,
        graph,
        setGraph,
        P
      );
      rows[attrColumn.id] = AttrRowResult.vertexId!;
    }
    mergeVertexProperties(
      metaTxnId,
      rowMetaAttrInst.vertex!.id,
      graph,
      setGraph,
      { rows }
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

