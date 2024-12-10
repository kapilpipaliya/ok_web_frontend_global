import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { handlePageDrag } from "~/components/page_designer/functions/handlePageDrag";
import { handleParentChange } from "~/components/page_designer/functions/handleParentChange";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";
import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";
import { getParentVertex } from "~/lib/graph/get/sync/getParentVertex";
import { saveUndoPoint } from "~/lib/graph/transaction/saveUndoPoint";

import { PageDesignerLabels } from "./PageDesignerLabels";
import { componentDrop } from "./drop/componentDrop";

export async function handleDropAtPosition(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  formData: any,
  fromVertex: Vertex,
  toVertex: Vertex,
  position: string,
) {
  if (
    !validateDragOver(
      graph,
      setGraph,
      fromVertex,
      toVertex.id,
      formData,
      position,
    )
  ) {
    return;
  }
  const fromParentVertex = getParentVertex(["Attr"], fromVertex, graph);
  const toParentVertex =
    position === "center"
      ? toVertex
      : getParentVertex(["Attr"], toVertex, graph).vertex;

  if (fromVertex.L[0] === "Comp") {
    const layoutRowId = componentDrop (
      formData,
      txnId,
      fromVertex,
      toParentVertex || formData,
      graph,
      setGraph,
      undefined,
      undefined,
    );
    if (layoutRowId === -1) {
      return layoutRowId;
    }
  
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

    saveUndoPoint(txnId, graph);

    return layoutRowId;
  }
  if (PageDesignerLabels.includes(fromVertex.L[0])) {
    return await handlePageDrag(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toVertex,
      toParentVertex,
      formData,
      position,
    );
  }
  if (
    position !== "center" &&
    fromParentVertex.vertex?.id === toParentVertex?.id
  ) {
    sortChildren(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toParentVertex!,
      toVertex,
      position,
    );
    saveUndoPoint(txnId, graph);
  } else {
    await handleParentChange(
      graph,
      setGraph,
      txnId,
      fromVertex,
      fromParentVertex.vertex,
      toParentVertex!,
      position,
      toVertex,
    );
    saveUndoPoint(txnId, graph);
    return;
  }
}
