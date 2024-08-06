import type { SetStoreFunction } from "solid-js/store";
import { submitDataCall } from "./lib/api/service/data/submitDataCall";
import type { GraphInterface } from "./lib/graph/graph";
import { mergeVertexProperties } from "./lib/graph/mutate/vertex";
import { commitTxn } from "./lib/graph/transaction/commitTxn";

export function saveUserSetting(properties: { [key: string]: any; }, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  const newTxn = graph.newTxnId;
  mergeVertexProperties(newTxn, graph.userSettingId, graph, setGraph, properties);
  const data = commitTxn(newTxn, graph);
  if (!data) {
    return;
  }
  submitDataCall({ ...data }, graph, setGraph, newTxn);
}
