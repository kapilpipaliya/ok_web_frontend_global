import { GraphInterface, Id, IdAttr, Vertex } from "~/lib/graph/graph";
import { getNewGraphId, getNewTxnId } from "../transaction";
import { klona } from "klona/json";
import { mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { batch, onCleanup, untrack, useContext } from "solid-js";
import {
 addNewRow,
 getChildVertex,
 getChildVertexes,
 newRow
} from "~/lib/graph/get/sync/graph_fns";
import { removeUndefinedProperties } from "~/lib/functions";
import {
 setSelectionValue
} from "~/components/dynamic/fields/static/SelectionUtils";
import { SetStoreFunction, Store } from "solid-js/store";
import {
 componentProps,
 getCollAttrComp
} from "~/lib/graph/get/sync/graph_functions";
import { useToast } from "~/components/custom/Toast";
import { NewTxnIdContext } from "~/lib/contexts";

export function cloneRowProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
) {
  const propRows =
    getChildVertexes(graph, ["$0Prop"], [fromVertex]).vertexes || [];

  const attrPropMetaVertex = newVertex(getNewGraphId(), [], {
    name: "Prop",
  });
  const attrNameVertex = newVertex(getNewGraphId(), [], {
    name: "Name",
    component: "SelectBox",
  });

  for (const propRow of propRows) {
    const nameVertex = getChildVertex(graph, ["$0Name"], propRow);
    if (nameVertex.vertex) {
      const rowResult = addNewRow(
        txnId,
        attrPropMetaVertex,
        graph,
        setGraph,
        toVertex,
        klona(propRow.P),
        false,
        {} as any,
      );
      const rowVertex = graph.vertexes[rowResult.vertexId!];
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrNameVertex,
        nameVertex.vertex.id,
      );
    }
  }
}

// add meta from vertex value:
export function addMeta(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex,
) {
  if (metaVertex.P.meta) {
    const metaData = componentProps(graph, setGraph, metaVertex, data);
    const metaDataVal = removeUndefinedProperties(metaData, false, 10);
    untrack(() => {
      const newMetaData = Object.assign(
        {},
        // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
        graph.vertexes[metaVertex.P.templateId]?.P?.props || {},
        metaDataVal,
      );
      mergeVertexProperties(
        useContext(NewTxnIdContext),
        metaVertex.id,
        graph,
        setGraph,
        {
          props: newMetaData,
        },
      );
    });
  }
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
    const metaTxnId = getNewTxnId(graph, setGraph);
    batch(() => {
      const metaInstanceResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        joinVertex,
        "AttrInst",
      );
      if (metaInstanceResult.error) {
        showErrorToast("Error creating a row for attribute instance");
      }
      mergeVertexProperties(
        metaTxnId,
        metaInstanceResult.vertexId!,
        graph,
        setGraph,
        {
          templateId: meta.id,
        },
      );

      for (const attrColumn of tableColumnsTemplate) {
        const AttrRowResult = newRow(
          graph,
          setGraph,
          metaTxnId,
          graph.vertexes[metaInstanceResult.vertexId!],
          "MetaAttr",
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
          P,
        );
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
        },
      );
    });
    onCleanup(() => {
      // remove all AttrInst vertex.
      // TODO: This is breaking when new row is added, its interesting to fix this.
      // console.log('called', metaTxnId)
      // revertTransaction(metaTxnId);
    });
    return metaTxnId;
  } else {
    const rows = klona(rowMetaAttrInst.vertex!.P.rows);
    const metaTxnId = rowMetaAttrInst.vertex!.P.metaTxnId;
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
          "MetaAttr",
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
      // revertTransaction(metaTxnId);
    });
    return metaTxnId;
  }
}
