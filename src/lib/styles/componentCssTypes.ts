export type ComponentCssState = {
  registry: Map<string, string>;
  refCounts: Map<string, number>;
  insertedHashes: Set<string>;
  ruleIndices: Map<string, number[]>;
  globalStylesActive: boolean;
  styleSheet?: CSSStyleSheet;
};

export function createInitialCssState(): ComponentCssState {
  return {
    registry: new Map(),
    refCounts: new Map(),
    insertedHashes: new Set(),
    ruleIndices: new Map(),
    globalStylesActive: false,
  };
}
