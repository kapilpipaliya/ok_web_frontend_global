import { createContext, useContext } from "solid-js";

// never use object as context, It's modified as Proxy letter, and then after it become proxy, it cant change and it keeps old data.
// use Record<string | symbol, any> instead
export const RepeaterVertexContext =
  createContext<Record<string | symbol, any>>();

export function useRepeaterVertexContext() {
  return useContext(RepeaterVertexContext);
}
