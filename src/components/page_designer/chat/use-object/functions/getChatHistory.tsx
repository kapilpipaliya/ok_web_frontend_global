import { SetStoreFunction } from "solid-js/store";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { evalExpression } from "~/lib/expression_eval";
import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { DBMessage } from "../types";

export function getChatHistory(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, formStoreVertex: () => Vertex<FormStoreObject> | undefined) {
  const formDataVertex = formStoreVertex()?.P.formDataId ? graph.vertexes[formStoreVertex()!.P.formDataId!] : undefined;
  if (!formDataVertex) return [];

  const chatHistory = evalExpression("->ChatHistory", { graph, setGraph, vertexes: [formDataVertex] }) as Vertex[] || [];
  return chatHistory.sort((a, b) => ((a.P?.timestamp || 0) - (b.P?.timestamp || 0))) as Vertex<DBMessage>[];
}
