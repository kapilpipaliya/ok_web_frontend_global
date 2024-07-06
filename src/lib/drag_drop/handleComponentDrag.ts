import type { SetStoreFunction } from "solid-js/store";

import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { sortChildren } from "~/lib/drag_drop/sortChildren";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { mergeVertexProperties } from "../graph/mutate/vertex";
import { saveUndoPoint } from "./saveUndoPoint";

export  function handleComponentDrag(
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
     handleComponentDropAndSort(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toVertex,
      toParentVertex,
      formData,
      position
    );
  } else {
     handleComponentDropAndSort(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toVertex,
      toParentVertex,
      formData,
      position
    );
  }
  saveUndoPoint(txnId, graph);
}

 function handleLabelComponentDrop(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex,
  formData: Vertex,
  position: string
) {
  const labelVertex = findVertexByLabelAndUniqueId(
    graph,
    "Comp",
    IdAttr,
    "Label",
  );
  const layoutRowId =  handleComponentDropAndSort(
    graph,
    setGraph,
    txnId,
    labelVertex!,
    toVertex,
    toParentVertex,
    formData,
    position,
    {
      label: fromVertex.P.label || fromVertex.P.name
    }
  );
  if (layoutRowId === -1) return;

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
}

 function handleComponentDropAndSort(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
  toParentVertex: Vertex,
  formData: Vertex,
  position: string,
  properties?: { [key: string]: string },
) {
  const layoutRowId = componentDrop(
    formData,
    txnId,
    fromVertex,
    toParentVertex || formData,
    graph,
    setGraph,
    undefined,
    properties,
  );
  if (layoutRowId === -1) return layoutRowId;

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
  return layoutRowId;
}

