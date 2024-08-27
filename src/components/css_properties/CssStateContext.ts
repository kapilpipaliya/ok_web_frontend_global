import { createContext, createSignal, useContext } from "solid-js";

export const CssStateContext = createContext(createSignal(""));

export function useCssState() {
  return useContext(CssStateContext);
}