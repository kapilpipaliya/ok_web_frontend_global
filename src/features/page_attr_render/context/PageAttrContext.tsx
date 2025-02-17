import { createContext, useContext } from "solid-js";

export const RepeaterVertexContext = createContext(
  {} as Record<string | symbol, any>,
);
export function useRepeaterVertexContext() {
  return useContext(RepeaterVertexContext);
}
