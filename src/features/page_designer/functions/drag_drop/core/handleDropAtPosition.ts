import type { SetStoreFunction, Store } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { handlePageDrag } from "~/features/page_designer/functions/drag_drop/core/handlePageDrag";
import { validateDragOver } from "~/features/page_designer/functions/drag_drop/core/validateDragOver";
import { handleParentChange } from "~/features/page_designer/functions/drag_drop/hierachy/handleParentChange";
import { sortChildren } from "~/features/page_designer/functions/drag_drop/hierachy/sortChildren";
import { evalExpression } from "~/lib/expression_eval";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import { componentDrop } from "./componentDrop";

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
  const toParentVertex =
    position === "center"
      ? toVertex
      : evalExpression("<-Attr", {
          graph,
          vertexes: [toVertex],
        })?.[0];

  if (fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Component") {
    const layoutRowId = componentDrop(
      formData,
      txnId,
      fromVertex,
      toParentVertex || formData,
      graph,
      setGraph,
      undefined,
      undefined,
      toVertex,
      position,
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

    saveUndoPoint(txnId, graph, setGraph);

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
  const fromParentVertex = evalExpression("<-Attr", {
    graph,
    vertexes: [fromVertex],
  })?.[0];
  if (
    position !== "center" &&
    fromParentVertex?.vertex?.id === toParentVertex?.id
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
    saveUndoPoint(txnId, graph, setGraph);
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
    saveUndoPoint(txnId, graph, setGraph);
    return;
  }
}
