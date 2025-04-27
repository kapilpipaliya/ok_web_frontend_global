import type { SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";

// unused function
export function getText(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  contextData: Vertex[],
) {
  try {
    return (
      (evalExpression(projection, {
        graph,
        setGraph,
        vertexes: contextData,
      }) as string) || projection
    );
  } catch (error) {
    console.error("Error in getText:", error);
    return "";
  }
}

// unused function
export function getUrl(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  contextData: Vertex[],
) {
  try {
    const url = evalExpression(projection, {
      graph,
      setGraph,
      vertexes: contextData,
    }) as string | undefined;
    return typeof url === "string" && url.startsWith("/") ? url : undefined;
  } catch (error) {
    console.error("Error in getUrl:", error);
    return undefined;
  }
}
