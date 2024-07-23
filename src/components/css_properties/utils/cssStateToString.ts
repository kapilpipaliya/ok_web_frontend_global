import { isObject } from "~/lib/utils";

import type { CSSStore } from "../CssEditorContext";

import { generateBoxShadow } from "./generateBoxShadow";

function arrayToString(name: string, arr: any[]): string {
  return arr.map(item => {
    if (isObject(item)) {
      if (name === "box-shadow") {
        return generateBoxShadow(arr)
      }
      return Object.entries(item)
        .map(([key, value]) => `${key}:${value.toString().replaceAll(" ", "|")}`)
        .join(" ");
    }
    return item.toString().replaceAll(" ", "|");
  }).join(" ");
}

export function cssStateToString(cssState: CSSStore) {
  if (!cssState) return "";

  return Object.entries(cssState)
    .map(([state, value]) => {
      if (!value || state === undefined) return;
      if (isObject(value)) {
        return Object.entries(value)
          .map(([key, val]) => {
            const selector = state && state !== "undefined" ? `${state}` : ""
            if (Array.isArray(val)) {
              const stateValue = arrayToString(key,val);
              return `${key}:${stateValue}${selector}`;
            }
            const stateValue = val.toString().replaceAll(" ", "|");
            return `${key}:${stateValue}${selector}`;
          })
          .join("\n");
      }
    })
    .filter(Boolean) // To remove any undefined entries
    .join("\n");
}
