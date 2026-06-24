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
): void {
  for (const [hash, indices] of ruleIndices.entries()) {
    ruleIndices.set(
      hash,
      indices.map((idx) => (idx > deletedIndex ? idx - 1 : idx)),
    );
  }
}

function ensureGlobalSheet(state: ComponentCssState): CSSStyleSheet | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (!state.styleSheet) {
    state.styleSheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets,
      state.styleSheet,
    ];
  }
  return state.styleSheet;
}

export function insertRulesForHash(
  state: ComponentCssState,
  hash: string,
  css: string,
): void {
  if (state.insertedHashes.has(hash)) {
    return;
  }

  const sheet = ensureGlobalSheet(state);
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

  state.ruleIndices.set(hash, indices);
  state.insertedHashes.add(hash);
}

export function removeRulesForHash(
  state: ComponentCssState,
  hash: string,
): void {
  const sheet = state.styleSheet;
  if (!(sheet && state.insertedHashes.has(hash))) {
    return;
  }

  const indices = [...(state.ruleIndices.get(hash) ?? [])].sort(
    (a, b) => b - a,
  );

  state.ruleIndices.delete(hash);
  state.insertedHashes.delete(hash);

  for (const index of indices) {
    try {
      sheet.deleteRule(index);
      shiftAllIndicesAfterDelete(state.ruleIndices, index);
    } catch (error) {
      console.error("deleteRule failed:", error, index);
    }
  }
}

export function syncAllRegistryRulesToSheet(state: ComponentCssState): void {
  for (const hash of [...state.registry.keys()].sort()) {
    const css = state.registry.get(hash);
    if (!css?.trim()) {
      continue;
    }
    insertRulesForHash(state, hash, css);
  }
}
