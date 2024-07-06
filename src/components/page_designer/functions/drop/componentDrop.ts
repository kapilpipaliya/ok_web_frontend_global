import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";
import { batch } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { createAttrCompMetaVertex } from "~/components/page_designer/functions/drop/createAttrCompMetaVertex";
import { createAttrMetaVertex } from "~/components/page_designer/functions/drop/createAttrMetaVertex";
import { processChildrenAttrs } from "~/components/page_designer/functions/drop/processChildrenAttrs";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import { addNewRow } from "../../../../lib/graph/mutate/form/rowFunction";
import { PageDesignerLabels } from "../constant";
import { getUniqueName } from "../getChildrenAttrs";
import { getCompPropsObj } from "./getCompPropsObj";
import { getComponentFromLayoutRow } from "./getComponentFromLayoutRow";

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
  properties?: { [key: string]: number | string },
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
  let props = properties ?? {};
  if (toIndex) {
    props = { ...props, name: uniqueName, pos: toIndex };
  } else {
    props = { ...props, name: uniqueName };
  }
  if (fromVertex.L[0] === "Comp") {
    props = { ...props, ...getCompPropsObj(graph, fromVertex) };
    if (fromVertex.P.name === "Text") {
      props = { ...props, text: "Sample Text" };
    }
  } else if (fromVertex.L[0] === "Attr") {
    const p = klona(fromVertex.P);
    delete p.pos;
    props = { ...props, ...p };
  }
  batch(() => {
    rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toParentVertex,
      props,
      false,
    );

    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (["Comp"].includes(fromVertex.L[0])) {
      // set Component to the row
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        fromVertex.id,
      );
    } else if (fromVertex.L[0] === "Attr") {
      const compVertex = getComponentFromLayoutRow(fromVertex.id, graph, setGraph);
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        compVertex.id,
      );
      processChildrenAttrs(
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

