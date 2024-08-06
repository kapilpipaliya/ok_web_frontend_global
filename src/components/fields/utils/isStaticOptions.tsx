import type { Vertex } from "~/lib/graph/graph";

export function isStaticOptions(meta: Vertex) {
  return typeof meta.P.options === "string" || Array.isArray(meta.P.options) || meta.P.saveValue;
}
