import { createSignal } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import {componentDrag} from "~/lib/drag-drop/componentDrag";
import {getChildrenAttrs} from "~/lib/drag-drop/getChildrenAttrs";
import {setParentValue} from "~/lib/graph/mutate/setParentValue";
import { handleComponentDrag } from "~/lib/drag-drop/handleComponentDrag";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";

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
  formData: any,
  toVertexId: Id,
) {
  const toVertex = graph.vertexes[toVertexId];
  const toParentVertex = getParentVertex(["Attr"], toVertex, graph).vertex;
 
  
  handleComponentDrag(graph, setGraph, txnId, fromVertex, toVertex, toParentVertex!, formData, '999999');

  // function sortChildren() {
  //   let pos = 1;
  //   const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
  //   for (const child of childrenAttrs) {
  //     if (child.id === fromVertex?.id) {
  //       continue;
  //     }
  //     // const childIndex = child.P.pos;
  //     // if (childIndex === undefined) {
  //     //  alert ('childIndex Pos should not be undefined.');
  //     // }
  //     if (child.id !== toVertexId) {
  //       mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
  //       pos++;
  //     }
  //   }
  // }

  // const rowId = componentDrag(
  //   txnId,
  //   fromVertex,
  //   toParentVertex,
  //   graph,
  //   setGraph,
  // );
  // if (rowId === -1) return;

  // fromVertex = graph.vertexes[rowId];
  // setParentValue(
  //   graph,
  //   setGraph,
  //   txnId,
  //   fromVertex,
  //   { P: { props: { type: "Attr" } } } as unknown as Vertex,
  //   toVertexId,
  // );
  // mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
  //   pos: 9999999,
  // });

  // sortChildren();
}
