import { createContext, useContext } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

export interface CSSStore {
  [state: string]: { [cssKey: string]: any };
}

export const CssEditorContext = createContext<
  [CSSStore, SetStoreFunction<CSSStore>]
>(createStore({}));

export function useCssEditor() {
  return useContext(CssEditorContext);
}
