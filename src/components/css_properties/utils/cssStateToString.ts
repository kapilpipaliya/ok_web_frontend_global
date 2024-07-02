import { isObject } from "~/lib/utils";

import { CSSStore } from "../context";


export function cssStateToString(cssState: CSSStore) {
  // validate string generated with: https://www.npmjs.com/package/@master/css-validator?activeTab=readme
  if (!cssState) return "";
  return Object.entries(cssState)
    .map(([state, value]) => {
      if (!value || state === undefined) return;
      const stateValue = value.toString().replaceAll(" ", "|");
      if (!isObject(value)) return `${state}:${stateValue}`;
      return Object.entries(value).map(([key, value]) => {
        const stateValue = value.toString().replaceAll(" ", "|");
        return `${key}:${stateValue}${state && state !== 'undefined' ? `:${state}` : ""}`;
      }).join("\n");
    })
    .join("\n");
}
