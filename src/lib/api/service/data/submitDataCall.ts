import type { SetStoreFunction, Store } from "solid-js/store";

import type { MutationArgs } from "~/cypher/types/MutationArgs";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { updateSubmittedIndex } from "~/lib/graph/transaction/core/updateSubmittedIndex";

// Submit generic data to the server
export async function submitDataCall(
  data: MutationArgs,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
) {
  const result = await postAPI(API.submitDataUrl, data);
  // @ts-expect-error ignore
  onMutatDataGet(graph, setGraph, result);
  updateSubmittedIndex(txnId, graph, setGraph);
  return result;
}
