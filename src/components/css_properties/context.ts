import { createContext } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

export const CssEditorContext = createContext<
  [
    { [p: string]: any },
    SetStoreFunction<{
      [p: string]: any;
    }>,
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
export const sizeTypes = ["px", "%", "em", "rem", "vh", "vw"];
export const timesTypes = ["s", "ms"];
