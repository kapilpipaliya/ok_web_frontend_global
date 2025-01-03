import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { onMutatDataGet } from "~/lib/graph/mutate/onMutatDataGet";

import { updateSubmittedIndex } from "../../../graph/transaction/updateSubmittedIndex";

// Submit generic data to the server
export async function submitDataCall(
  data: any,
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
