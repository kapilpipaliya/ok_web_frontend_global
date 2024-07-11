import type { SetStoreFunction, Store } from "solid-js/store";

import { getOwner, runWithOwner } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { addNewRow } from "~/lib/graph/mutate/form/rowFunction";

export function insertNewRow(
  txnId: number,
  meta: Vertex,
  data: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any } = {},
) {
  const { showErrorToast } = useToast();
  if (!data) {
    showErrorToast("Table data is not set");
    return;
  }
  const outerOwner = getOwner();
  return runWithOwner(outerOwner, () =>
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
}
