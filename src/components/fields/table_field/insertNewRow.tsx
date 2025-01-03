import type { SetStoreFunction, Store } from "solid-js/store";

import { getOwner, runWithOwner } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { saveUndoPoint } from "~/lib/graph/transaction/saveUndoPoint";

export function insertNewRow(
  txnId: number,
  meta: Vertex,
  data: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any } = {},
) {
  if (!data) {
    alert("cant add new row");
    return;
  }
  const outerOwner = getOwner();
  const result = runWithOwner(outerOwner, () =>
    addNewRow(
      txnId || 0,
      meta,
      graph,
      setGraph,
      data,
      properties,
      isRealTime ?? false,
    ),
  );
  if (!result?.error) {
    saveUndoPoint(txnId, graph, setGraph);
  }

  return result;
}
