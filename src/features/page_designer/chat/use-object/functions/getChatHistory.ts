import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";

import type { DBMessage } from "../types";

export function getChatHistory(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formStoreVertex: () => undefined | Vertex<FormStoreObject>,
) {
  const formDataVertex = formStoreVertex()?.P.formDataId
    ? graph.vertexes[formStoreVertex()!.P.formDataId!]
    : undefined;
  if (!formDataVertex) {
    return [];
  }

  const chatHistory =
    (evalExpression("->ChatHistory", {
      graph,
      setGraph,
      vertexes: [formDataVertex],
    }) as Vertex[]) || [];
  return chatHistory.sort(
    (a, b) => (a.P?.timestamp || 0) - (b.P?.timestamp || 0),
  ) as Vertex<DBMessage>[];
}
