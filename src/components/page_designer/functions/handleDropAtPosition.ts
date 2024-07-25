import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { handleComponentDrag } from "~/components/page_designer/functions/handleComponentDrag";
import { handlePageDrag } from "~/components/page_designer/functions/handlePageDrag";
import { handleParentChange } from "~/components/page_designer/functions/handleParentChange";
import { sortChildren } from "~/components/page_designer/functions/sortChildren";
import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";
import { getParentVertex } from "~/lib/graph/get/sync/traverse";

import { PageDesignerLabels } from "./PageDesignerLabels";

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
    return await handleComponentDrag(
      graph,
      setGraph,
      txnId,
      fromVertex,
      toVertex,
      toParentVertex!,
      formData,
      position,
    );
  } else if (PageDesignerLabels.includes(fromVertex.L[0])) {
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
  } else if (
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
  } else {
    return await handleParentChange(
      graph,
      setGraph,
      txnId,
      fromVertex,
      fromParentVertex.vertex,
      toParentVertex!,
      position,
      toVertex,
    );
  }
}
