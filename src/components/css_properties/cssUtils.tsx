import { recursive } from "merge";
import { isObject } from "~/lib/utils";

export interface CSSStore {
  [state: string]: { [key: string]: string }
}

export const parseAndApplyCssRules = (valueString: string) => {
  const cssRules = {} as CSSStore;

  for (const rule of valueString.split(/[\s\n]+/)) {
    const [property, value, state = ''] = rule.split(":");
    if (!property) continue;

    if (!cssRules[state]) {
      cssRules[state] = {};
    }
    cssRules[state][property] = value;
  }

  return cssRules
};

export function cssStateToString(cssState: CSSStore) {
  return Object.entries(cssState)
    .map(([state, value]) => {
      if (!value || state===undefined) return;
      const stateValue = value.toString().replaceAll(" ", "|");
      if (!isObject(value)) return `${state}:${stateValue}`;
      return Object.entries(value).map(([key, value]) => {
        const stateValue = value.toString().replaceAll(" ", "|");
        return `${key}:${stateValue}${state && state !== 'undefined' ? `:${state}` : ""}`;
      }).join("\n");
    })
    .join("\n");
}

export function mergeCSS(input1: string, input2: string) {
  console.log(input1, input2);
  
  if (!input1) {
    return input2;
  }
  if (!input2) {
    return input1;
  }

  
  const mergedState = recursive(
    parseAndApplyCssRules(input1),
    parseAndApplyCssRules(input2),
  ) as CSSStore;
  
  return cssStateToString(mergedState);
}

