import { createContext, createSignal } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";

export const CssEditorContext = createContext<
  [
    { [state: string]: { [key: string]: string } }, SetStoreFunction<{
      [p: string]: any;
    }>
  ]
>(createStore({}));
export const CssDefaultEditorContext = createContext<
  [
    { [p: string]: any },
    SetStoreFunction<{
      [p: string]: any;
    }>,
  ]
>(createStore({}));
export const CssStateContext = createContext(createSignal(''));
export const sizeTypes = ["px", "%", "em", "rem", "vh", "vw"];
export const timesTypes = ["s", "ms"];
