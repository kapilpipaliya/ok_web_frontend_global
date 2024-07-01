import type { SetStoreFunction } from "solid-js/store";

import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { sortChildren } from "~/lib/drag_drop/sortChildren";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { mergeVertexProperties } from "../graph/mutate/vertex";

export async function handleComponentDrag(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex,
  formData: Vertex,
  position: string,
) {
  // when component is input add label
  const labelParentVertex = getParentVertex(
    ["CompCategory$0"],
    fromVertex,
    graph,
  );

  const isParentIsLabel = toParentVertex.P.label === "Label";
  if (
    !isParentIsLabel &&
    fromVertex.P.name !== "Form" &&
    fromVertex.P.name !== "Label" &&
    (labelParentVertex?.vertex?.P.name === "Form" ||
      labelParentVertex?.vertex?.P.name === "Join")
  ) {
    // add label at
    const labelVertex = findVertexByLabelAndUniqueId(
      graph,
      "Comp",
      IdAttr,
      "Label",
    );
    const layoutRowId = componentDrop(
      formData,
      txnId,
      labelVertex!,
      toParentVertex || formData,
      graph,
      setGraph,
    );
    if (layoutRowId === -1) return;

    mergeVertexProperties(txnId, layoutRowId, graph, setGraph, {
      label: fromVertex.P.label ||  fromVertex.P.name
    })

    // add component inside the label
    const layoutRowId2 = componentDrop(
      formData,
      txnId,
      fromVertex,
      graph.vertexes[layoutRowId] || formData,
      graph,
      setGraph,
    );
    if (layoutRowId2 === -1) return;

    fromVertex = graph.vertexes[layoutRowId];

    sortChildren(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toParentVertex!,
      toVertex,
      position,
    );
  } else {
    const layoutRowId = componentDrop(
      formData,
      txnId,
      fromVertex,
      toParentVertex || formData,
      graph,
      setGraph,
    );
    if (layoutRowId === -1) return;

    fromVertex = graph.vertexes[layoutRowId];

    sortChildren(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toParentVertex!,
      toVertex,
      position,
    );
  }
}
