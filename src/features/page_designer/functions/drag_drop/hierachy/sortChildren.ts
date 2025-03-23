import type { SetStoreFunction, Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { getChildrenAttrs } from "../../layout/getChildrenAttrs";

export function sortChildren(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: undefined | Vertex,
  toParentVertex: Vertex,
  toVertex: undefined | Vertex,
  position: string,
) {
  let pos = 1;
  const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
  for (const child of childrenAttrs) {
    if (child.id === fromVertex?.id && position !== "center") {
      continue;
    }
    // const childIndex = child.P.pos;
    // if (childIndex === undefined) {
    //  alert ('childIndex Pos should not be undefined.');
    // }
    if (child.id === toVertex?.id) {
      if (!fromVertex) {
        continue;
      }
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
