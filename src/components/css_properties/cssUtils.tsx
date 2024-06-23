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
    if (!value) {
      /*
      position:absolute  inset:0px background-image: linear-gradient(to top, var(--tw-gradient-stops)) background-image:linear-gradient(rgba(255,255,255,1),rgba(255,255,255,0))

      property background-image has no value
      property linear-gradient(to has no value
      property top, has no value
      property var(--tw-gradient-stops)) has no value
*/
      console.log(`property '${property}' has no value`);
      continue;
    };
    cssRules[state][property] = value.replaceAll("|", " ");;
  }
  
  return cssRules
};

export function cssStateToString(cssState: CSSStore) {
  if(!cssState) return "";
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

export function mergeCSS(input1: string | CSSStore, input2: string | CSSStore ) {
  const css1 = typeof input1 === 'string' ? parseAndApplyCssRules(input1) : input1;
  const css2 = typeof input2 === 'string' ? parseAndApplyCssRules(input2) : input2;

  if (!css1) {
    return cssStateToString(css2);
  }
  if (!css2) {
    return "";
  }

  
  const mergedState = recursive(
    css1,
    css2,
  ) as CSSStore;
  
  return cssStateToString(mergedState);
}

