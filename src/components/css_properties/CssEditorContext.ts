import { createContext, createSignal, useContext } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

import type { GenericField } from "./constants/FieldType";

export interface CSSStore {
  [state: string]: { [key: string]: { [key: string]: any } | string };
}

export const CssEditorContext = createContext<
  [CSSStore, SetStoreFunction<CSSStore>]
>(createStore({}));

export const CssDefaultEditorContext = createContext<
  [CSSStore, SetStoreFunction<CSSStore>]
>(createStore({}));

export function useCssEditor() {
  return useContext(CssEditorContext);
}

export function useCssDefaultEditor() {
  return useContext(CssDefaultEditorContext);
}

export function useCssState() {
  return useContext(CssStateContext);
}

export const CssStateContext = createContext(createSignal(""));

export const ComponentMetaContext = createContext<GenericField>();

export const useComponentMeta = () => useContext(ComponentMetaContext)!;