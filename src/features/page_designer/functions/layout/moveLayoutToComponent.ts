import type { SetStoreFunction } from "solid-js/store";

import { createAttrMetaVertex } from "~/features/page_designer/functions/drag_drop/attributes/createAttrMetaVertex";
import { handleParentChange } from "~/features/page_designer/functions/drag_drop/hierachy/handleParentChange";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { getUniqueName } from "~/features/page_designer/functions/form/getUniqueName";
import { evalExpression } from "~/lib/expression_eval";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";

export function moveLayoutToComponent(
  layoutVertex: Vertex,
  componentVertex: Vertex,
  componentKey: string,
  componentTxnId: number,
  pageTxnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formData: Vertex,
): string | -1 {
  const pageParentVertex = evalExpression("<-Attr", {
    graph,
    vertexes: [layoutVertex],
  })?.[0];

  if (!pageParentVertex) {
    return -1;
  }

  const displayOrder = layoutVertex.P.displayOrder;
  const attrMetaVertex = createAttrMetaVertex(graph, setGraph);

  handleParentChange(
    graph,
    setGraph,
    componentTxnId,
    layoutVertex,
    pageParentVertex,
    componentVertex,
    "center",
    componentVertex,
  );

  const uniqueName = getUniqueName(
    pageTxnId,
    graph,
    setGraph,
    formData,
    attrMetaVertex,
  );

  const rowResult = addNewRow(
    pageTxnId,
    attrMetaVertex,
    graph,
    setGraph,
    pageParentVertex,
    {
      displayOrder,
      [uniqueNameKey]: uniqueName,
      componentName: componentKey,
    },
    false,
  );

  if (rowResult.error || !rowResult.vertexId) {
    return -1;
  }

  saveUndoPoint(componentTxnId, graph, setGraph);
  saveUndoPoint(pageTxnId, graph, setGraph);

  return rowResult.vertexId;
}
