import type { SetStoreFunction, Store } from "solid-js/store";

import { klona } from "klona";
import { batch } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { createAttrCompMetaVertex } from "~/features/page_designer/functions/drag_drop/createAttrCompMetaVertex";
import { createAttrMetaVertex } from "~/features/page_designer/functions/drag_drop/createAttrMetaVertex";
import { processChildrenAttrs } from "~/features/page_designer/functions/drag_drop/processChildrenAttrs";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";

import { uniqueNameKey } from "../../constants/constant";
import { getUniqueName } from "../form/generateFormMetaAttributes";
import { getChildrenAttrs } from "../layout/getChildrenAttrs";
import { PageDesignerLabels } from "../utils/PageDesignerLabels";
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
  toVertex?: Vertex,
  position: string = "center",
) {
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
  
  // Calculate the position value
  const posValue = calculateInitialPosition(graph, setGraph, toParentVertex, toVertex, position, toIndex);
  props = { ...props, pos: posValue, [uniqueNameKey]: uniqueName };
  
  if (fromVertex.L[0] === "Comp") {
    const compProps = getCompPropsObj(graph, fromVertex);
    props = { ...compProps, ...props, componentName: fromVertex.P.key };
    // if (fromVertex.P.key === "Text" && !props.text) {
    //   props = { ...props, text: "Sample Text" };
    // }
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

    if (["Component"].includes(fromVertex.L[0])) {
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
      if (compVertex) {
        setSelectionValue(
          txnId,
          rowVertex,
          graph,
          setGraph,
          attrCompMetaVertex,
          compVertex.id,
        );
      }
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

/**
 * Calculate the position value for component placement
 */
function calculateInitialPosition(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentVertex: Vertex,
  toVertex?: Vertex,
  position: string = "center",
  toIndex?: number
): number {
  // If toIndex is provided, use it directly
  if (toIndex !== undefined) {
    return toIndex;
  }
  
  // Calculate pos based on position relative to toVertex
  let calculatedPos = 1;
  
  if (position === "center" || !toVertex) {
    // If "center" or no toVertex, append at the end
    const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex);
    const lastPos = childrenAttrs.length > 0 
      ? Math.max(...childrenAttrs.map(child => child.P.pos || 0)) 
      : 0;
    calculatedPos = lastPos + 1;
  } else {
    // Calculate position based on relative position to toVertex
    const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex);
    let posCounter = 1;
    
    for (const child of childrenAttrs) {
      if (child.id === toVertex.id) {
        if (position === "before" || position === "left") {
          calculatedPos = posCounter - 0.5;
          break;
        } else if (position === "after" || position === "right") {
          calculatedPos = posCounter + 0.5;
          break;
        }
      }
      posCounter++;
    }
  }
  
  return calculatedPos;
}
