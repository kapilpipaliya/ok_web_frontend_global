import type { Vertex } from "~/lib/graph/graph";

export function isStaticOptions(meta: Vertex) {
  return typeof meta.P.options === "string" || meta.P.options instanceof Array || meta.P.saveValue;
}
