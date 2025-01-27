import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";
import { batch } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { createAttrCompMetaVertex } from "~/components/page_designer/functions/drop/createAttrCompMetaVertex";
import { createAttrMetaVertex } from "~/components/page_designer/functions/drop/createAttrMetaVertex";
import { processChildrenAttrs } from "~/components/page_designer/functions/drop/processChildrenAttrs";
import { useToast } from "~/components/styled/Toast";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import { addNewRow } from "../../../../lib/graph/mutate/form/addNewRow";
import { uniqueNameKey } from "../../constants/constant";
import { getUniqueName } from "../generateFormMetaAttributes";
import { PageDesignerLabels } from "../PageDesignerLabels";
import { getComponentFromLayoutRow } from "./getComponentFromLayoutRow";
import { getCompPropsObj } from "./getCompPropsObj";

// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrop(
  formVertex: Vertex,
  txnId: number,
  fromVertex: Vertex,
  toParentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
  properties?: { [key: string]: number | string },
) {
  const { showErrorToast } = useToast();

  if (!fromVertex) {
    return -1;
  }

  const attrMetaVertex = createAttrMetaVertex(graph, setGraph);
  const attrCompMetaVertex = createAttrCompMetaVertex(graph, setGraph);

  if (PageDesignerLabels.includes(fromVertex.L[0])) {
    return (
      processChildrenAttrs(
        formVertex,
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

  const uniqueName = getUniqueName(
    txnId,
    graph,
    setGraph,
    formVertex,
    attrMetaVertex,
  );

  let rowResult: {
    edgeId?: string | undefined;
    error: boolean;
    vertexId?: string | undefined;
  };
  let props = properties ?? {};
  if (toIndex) {
    props = { ...props, pos: toIndex, [uniqueNameKey]: uniqueName };
  } else {
    props = { ...props, [uniqueNameKey]: uniqueName };
  }
  if (fromVertex.L[0] === "Comp") {
    const compProps = getCompPropsObj(graph, fromVertex);
    props = { ...compProps, ...props };
    if (fromVertex.P.key === "Text" && !props.text) {
      props = { ...props, text: "Sample Text" };
    }
    if (fromVertex.P.key === "Html" && !props.as) {
      props = { ...props, as: "div" };
    }
  } else if (fromVertex.L[0] === "Attr") {
    const p = klona(fromVertex.P);
    delete p.pos;
    delete p.key;
    props = { ...props, ...p };
  } else if (fromVertex.L[0] === "Component") {
    props = { ...props, componentName: "Component" };
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

    if (["Comp", "Component"].includes(fromVertex.L[0])) {
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
      const compVertex = getComponentFromLayoutRow(
        fromVertex.id,
        graph,
        setGraph,
      );
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        compVertex.id,
      );
      processChildrenAttrs(
        formVertex,
        fromVertex,
        rowVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
        attrCompMetaVertex,
      );
    }
  });

  return rowResult!.vertexId!;
}
