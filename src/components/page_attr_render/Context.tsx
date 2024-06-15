import { createContext } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";

export const PageRenderVertexContext = createContext([] as Vertex[]);
export const RepeaterVertexContext = createContext([] as Vertex[]);