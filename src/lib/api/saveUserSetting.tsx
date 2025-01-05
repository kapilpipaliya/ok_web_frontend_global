import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "../graph/graph";

import { mergeVertexProperties } from "../graph/mutate/vertex";
import { commitTxn } from "../graph/transaction/commitTxn";
import { submitDataCall } from "./service/data/submitDataCall";
import { generateNewTxnId } from "../graph/transaction/generateNewTxnId";
import { getGlobalStore } from "../graph/get/sync/getGlobalStore";

export function saveUserSetting(
  properties: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const newTxn = generateNewTxnId(graph, setGraph);
  mergeVertexProperties(
    newTxn,
    getGlobalStore(graph).P.userSettingId,
    graph,
    setGraph,
    properties,
  );
  const data = commitTxn(newTxn, graph);
  if (!data) {
    return;
  }
  submitDataCall({ ...data }, graph, setGraph, newTxn);
}
