import type { CSSStore } from "../CssEditorContext";

export const parseAndApplyCssRules = (valueString: string) => {
  const cssRules = { "": {} } as CSSStore;

  for (const rule of valueString.split(/[\s\n]+/)) {
    const [property, value, state = ""] = rule.split(":");
    if (!property) { continue; }

    if (!cssRules[state]) {
      cssRules[state] = {};
    }
    if (!value) {
      continue;
    }
    cssRules[state][property] = value.replaceAll("|", " ");
  }

  return cssRules;
};
