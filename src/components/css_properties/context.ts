import { createContext, createSignal, useContext } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";

export interface CSSStore {
  [state: string]: { [key: string]: string; };
}

export const CssEditorContext = createContext<[CSSStore, SetStoreFunction<CSSStore>]>(createStore({}));
export const CssDefaultEditorContext = createContext<[CSSStore, SetStoreFunction<CSSStore>]>(createStore({}));

export function useCssEditor() {
  return useContext(CssEditorContext);
}

export function useCssDefaultEditor() {
  return useContext(CssDefaultEditorContext);
}

export function useCssState() {
  return useContext(CssStateContext);
}


export const CssStateContext = createContext(createSignal(''));

