import { SetStoreFunction } from "solid-js/store";
import { evalExpression } from "~/lib/expression_eval";
import { Vertex, GraphInterface } from "~/lib/graph/graph";



export function getComponentDefaultValues(component: Vertex, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  if (!component) {
    return {};
  }
  const variants = evalExpression("->$0Variant", { graph, setGraph, vertexes: [component] }) as Vertex[] || [];
  const defaultValues = {} as { [key: string]: any; };
  for (const variant of variants) {
    if (variant.P.key) {
      if (variant.P.defValue !== undefined) {
        defaultValues[variant.P.key] = variant.P.defValue;
      }
    }
  }
  return defaultValues;
}
