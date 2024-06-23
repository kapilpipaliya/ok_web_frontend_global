import type {GraphInterface, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {useToast} from "~/components/Toast";
import {addNewRow} from "../../graph/mutate/form/rowFunction";
import {PageDesignerLabels} from "../constant";
import {createAttrCompMetaVertex} from "~/lib/drag_drop/component_drop/createAttrCompMetaVertex";
import {createAttrMetaVertex} from "~/lib/drag_drop/component_drop/createAttrMetaVertex";
import {processChildren} from "~/lib/drag_drop/component_drop/processChildren";
import {handleAttrVertex} from "~/lib/drag_drop/component_drop/handleAttrVertex";
import {handleCompOrCollVertex} from "~/lib/drag_drop/component_drop/handleCompOrCollVertex";
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
) {
  const { showErrorToast } = useToast();

  if (!fromVertex) return -1;

  const attrMetaVertex = createAttrMetaVertex();
  const attrCompMetaVertex = createAttrCompMetaVertex();

  if(PageDesignerLabels.includes(fromVertex.L[0])) {
    return (
      processChildren(
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
  const rowResult = addNewRow(
    txnId,
    attrMetaVertex,
    graph,
    setGraph,
    toParentVertex,
    toIndex ? { pos: toIndex, name: uniqueName } : {name: uniqueName},
    false,
    {} as any
  );
  
  const rowVertex = graph.vertexes[rowResult.vertexId!];

  if (["Comp", "Coll"].includes(fromVertex.L[0])) {
    handleCompOrCollVertex(
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

  return rowResult.vertexId!;
}

