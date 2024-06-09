import { GraphInterface, IdAttr, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction } from "solid-js/store";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { componentDrag } from "~/lib/drag_drop/componentDrag";
import { sortChildren } from "~/lib/drag_drop/sortChildren";

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
    const layoutRowId = componentDrag(
      txnId,
      labelVertex!,
      toParentVertex || formData,
      graph,
      setGraph,
    );
    if (layoutRowId === -1) return;

    // add component inside the label
    const layoutRowId2 = componentDrag(
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
    const layoutRowId = componentDrag(
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
