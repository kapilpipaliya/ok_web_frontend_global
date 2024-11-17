import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "../graph/graph";

import { submitDataCall } from "./service/data/submitDataCall";
import { mergeVertexProperties } from "../graph/mutate/vertex";
import { commitTxn } from "../graph/transaction/commitTxn";

export function saveUserSetting(
  properties: { [key: string]: any },
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const newTxn = graph.newTxnId;
  mergeVertexProperties(
    newTxn,
    graph.userSettingId,
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
