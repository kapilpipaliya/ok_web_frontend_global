import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

export function nameExpr(
  v: Vertex,
  componentName: string,
  _graph: GraphInterface,
) {
  let displayName = componentName;
  if (componentName === "Html") {
    displayName = v.P.as || "Fragment";
  }
  return `${displayName ? ` ${displayName}` : ""}${v.P.attrLabel ? ` (${v.P.attrLabel})` : ""}`;
}
