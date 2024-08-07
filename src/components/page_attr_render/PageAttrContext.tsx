import { createContext, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

export const RepeaterVertexContext = createContext([] as Vertex[]);
export function useRepeaterVertexContext() {
  return useContext(RepeaterVertexContext);
}
