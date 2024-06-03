import { createSignal } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import { setParentValue } from "~/components/dynamic/fields/input/SelectInputField";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import {componentDrag} from "~/lib/drag-drop/componentDrag";
import {getChildrenAttrs} from "~/lib/drag-drop/getChildrenAttrs";

export function useExpansion(defaultValue = true) {
  const [expanded, setExpanded] = createSignal(defaultValue);
  const toggleExpansion = () => setExpanded(!expanded());
  return [expanded, toggleExpansion];
}

export function onClickAddComponent(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertexId: Id,
) {
  const toParentVertex = graph.vertexes[toVertexId];

  function sortChildren() {
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
      if (child.id !== toVertexId) {
        mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
        pos++;
      }
    }
  }

  const rowId = componentDrag(
    txnId,
    fromVertex,
    toParentVertex,
    graph,
    setGraph,
  );
  if (rowId === -1) return;

  fromVertex = graph.vertexes[rowId];
  setParentValue(
    graph,
    setGraph,
    txnId,
    fromVertex,
    { P: { props: { type: "Attr" } } } as unknown as Vertex,
    toVertexId,
  );
  mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
    pos: 9999999,
  });

  sortChildren();
}
