import { createContext, createSignal } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";

export interface CSSStore {
  [state: string]: { [key: string]: string; };
}

export const CssEditorContext = createContext<[CSSStore, SetStoreFunction<CSSStore>]>(createStore({}));
export const CssDefaultEditorContext = createContext<[CSSStore, SetStoreFunction<CSSStore>]>(createStore({}));

export const CssStateContext = createContext(createSignal(''));

