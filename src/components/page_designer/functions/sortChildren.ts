import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function sortChildren(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toParentVertex: Vertex,
  toVertex: Vertex,
  position: string,
) {
  let pos = 1;
  const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
  for (const child of childrenAttrs) {
    if (child.id === fromVertex?.id) {
      continue;
    }
    // const childIndex = child.P.pos;
    // if (childIndex === undefined) {
    //  alert ('childIndex Pos should not be undefined.');
    // }
    if (child.id === toVertex.id) {
      // childIndex === toIndex, childIndex may be undefined.
      if (position === "before" || position === "left") {
        if (fromVertex?.P.pos !== pos) {
          mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
            pos,
          });
        }
        pos++;
        if (child.P.pos !== pos) {
          mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
        }
        pos++;
      } else if (position === "after" || position === "right") {
        if (child.P.pos !== pos) {
          mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
        }
        pos++;
        if (fromVertex?.P.pos !== pos) {
          mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
            pos,
          });
        }
        pos++;
      }
    } else {
      if (child.P.pos !== pos) {
        mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
      }
      pos++;
    }
  }
}
