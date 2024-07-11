import { recursive } from "merge";

import type { CSSStore } from "../context";

import { cssStateToString } from "./cssStateToString";
import { parseAndApplyCssRules } from "./parseAndApplyCssRules";

export function mergeCSS(input1: CSSStore | string, input2: CSSStore | string) {
  const css1 =
    typeof input1 === "string" ? parseAndApplyCssRules(input1) : input1;
  const css2 =
    typeof input2 === "string" ? parseAndApplyCssRules(input2) : input2;

  if (!css1) {
    return cssStateToString(css2);
  }
  if (!css2) {
    return "";
  }

  const mergedState = recursive(css1, css2) as CSSStore;

  return cssStateToString(mergedState);
}
