import type { CSSStore } from "../context";


export const parseAndApplyCssRules = (valueString: string) => {
  const cssRules = { '': {} } as CSSStore;

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

  return cssRules;
};
