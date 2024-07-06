import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { createAttrCompMetaVertex } from "~/lib/drag_drop/drop/createAttrCompMetaVertex";
import { createAttrMetaVertex } from "~/lib/drag_drop/drop/createAttrMetaVertex";
import { handleAttrVertex } from "~/lib/drag_drop/drop/handleAttrVertex";
import { handleCompVertex } from "~/lib/drag_drop/drop/handleCompVertex";
import { processChildrenAttrs } from "~/lib/drag_drop/drop/processChildrenAttrs";

import { addNewRow } from "../../graph/mutate/form/rowFunction";
import { PageDesignerLabels } from "../constant";
import { getUniqueName } from "../getChildrenAttrs";

// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrop(
  pageDesignerVertex: Vertex,
  txnId: number,
  fromVertex: Vertex,
  toParentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
  properties?: { [key: string]: string },
) {
  const { showErrorToast } = useToast();

  if (!fromVertex) return -1;

  const attrMetaVertex = createAttrMetaVertex(graph);
  const attrCompMetaVertex = createAttrCompMetaVertex(graph);

  if (PageDesignerLabels.includes(fromVertex.L[0])) {
    return (
      processChildrenAttrs(
        pageDesignerVertex,
        fromVertex,
        toParentVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
        attrCompMetaVertex,
      )[0] ?? -1
    );
  }

  const uniqueName = getUniqueName(txnId, graph, setGraph, pageDesignerVertex, attrMetaVertex);

  let rowResult: { edgeId?: string | undefined; error: boolean; vertexId?: string | undefined }
  batch(() => {
    rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toParentVertex,
      toIndex ? { ...properties, name: uniqueName, pos: toIndex } : { ...properties, name: uniqueName },
      false,
    );

    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (["Comp"].includes(fromVertex.L[0])) {
      handleCompVertex(
        fromVertex,
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        showErrorToast,
      );
    } else if (fromVertex.L[0] === "Attr") {
      handleAttrVertex(
        pageDesignerVertex,
        fromVertex,
        rowVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
        attrCompMetaVertex,
      );
    }
  })

  return rowResult!.vertexId!;
}

