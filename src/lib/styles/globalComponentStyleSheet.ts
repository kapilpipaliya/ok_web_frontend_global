import type { SetStoreFunction } from "solid-js/store";

import type { ComponentCssState } from "~/lib/styles/componentCssTypes";

/** Parse scoped CSS text into rule strings via the browser CSSOM parser. */
export function parseCssTextToRules(cssText: string): string[] {
  const temp = new CSSStyleSheet();
  try {
    temp.replaceSync(cssText);
  } catch (error) {
    console.error("Invalid component CSS:", error, cssText);
    return [];
  }
  return Array.from(temp.cssRules, (rule) => rule.cssText);
}

function shiftAllIndicesAfterDelete(
  ruleIndices: Map<string, number[]>,
  deletedIndex: number,
): Map<string, number[]> {
  const next = new Map(ruleIndices);
  for (const [hash, indices] of next.entries()) {
    next.set(
      hash,
      indices.map((idx) => (idx > deletedIndex ? idx - 1 : idx)),
    );
  }
  return next;
}

function ensureGlobalSheet(
  state: ComponentCssState,
  setState: SetStoreFunction<ComponentCssState>,
): CSSStyleSheet | null {
  if (typeof document === "undefined") {
    return null;
  }

  let sheet = state.styleSheet;
  if (!sheet) {
    sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    setState("styleSheet", sheet);
  }
  return sheet;
}

export function insertRulesForHash(
  state: ComponentCssState,
  setState: SetStoreFunction<ComponentCssState>,
  hash: string,
  css: string,
): void {
  if (state.insertedHashes.has(hash)) {
    return;
  }

  const sheet = ensureGlobalSheet(state, setState);
  if (!sheet) {
    return;
  }

  const indices: number[] = [];
  for (const rule of parseCssTextToRules(css)) {
    try {
      const index = sheet.cssRules.length;
      sheet.insertRule(rule, index);
      indices.push(index);
    } catch (error) {
      console.error("insertRule failed:", error, rule);
    }
  }

  const nextRuleIndices = new Map(state.ruleIndices);
  nextRuleIndices.set(hash, indices);
  const nextInserted = new Set(state.insertedHashes);
  nextInserted.add(hash);
  setState({
    ruleIndices: nextRuleIndices,
    insertedHashes: nextInserted,
  });
}

export function removeRulesForHash(
  state: ComponentCssState,
  setState: SetStoreFunction<ComponentCssState>,
  hash: string,
): void {
  const sheet = state.styleSheet;
  if (!sheet || !state.insertedHashes.has(hash)) {
    return;
  }

  const indices = [...(state.ruleIndices.get(hash) ?? [])].sort((a, b) => b - a);

  let ruleIndices = new Map(state.ruleIndices);
  ruleIndices.delete(hash);

  const nextInserted = new Set(state.insertedHashes);
  nextInserted.delete(hash);

  for (const index of indices) {
    try {
      sheet.deleteRule(index);
      ruleIndices = shiftAllIndicesAfterDelete(ruleIndices, index);
    } catch (error) {
      console.error("deleteRule failed:", error, index);
    }
  }

  setState({
    insertedHashes: nextInserted,
    ruleIndices,
  });
}

export function syncAllRegistryRulesToSheet(
  getState: () => ComponentCssState,
  setState: SetStoreFunction<ComponentCssState>,
): void {
  for (const hash of [...getState().registry.keys()].sort()) {
    const css = getState().registry.get(hash);
    if (!css?.trim()) {
      continue;
    }
    insertRulesForHash(getState(), setState, hash, css);
  }
}