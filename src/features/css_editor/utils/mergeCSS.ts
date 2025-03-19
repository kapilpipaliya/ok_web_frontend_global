import { recursive } from "merge";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import type { CSSStore } from "../context/CssEditorContext";

import { cssStateToString } from "./cssStateToString";
import { parseAndApplyCssRules } from "./parseAndApplyCssRules";

// deprecated
export function mergeCSS(
  input1: CSSStore | string,
  input2: CSSStore | string,
  meta: Vertex,
  data: Vertex,
  graph: GraphInterface,
) {
  const css1 =
    typeof input1 === "string" ? parseAndApplyCssRules(input1) : input1;
  const css2 =
    typeof input2 === "string" ? parseAndApplyCssRules(input2) : input2;

  if (!css1) {
    return cssStateToString(css2, meta, data, graph);
  }
  if (!css2) {
    return "";
  }

  const mergedState = recursive(css1, css2) as CSSStore;

  return cssStateToString(mergedState, meta, data, graph);
}
