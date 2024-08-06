import type { createStore } from "solid-js/store";

import { createContext, type JSX, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { InitialPermissions } from "./InitialPermissions";

export function getInitialPageRenderStore() {
  return {
    ...InitialPermissions,
    vertexes: [] as Vertex[],
  };
}

export type PageRenderObject = ReturnType<typeof getInitialPageRenderStore>;
export type PageRenderStore = ReturnType<typeof createStore<PageRenderObject>>;
export const PageRenderContext = createContext<PageRenderStore>();

export function usePageRenderContext() {
  return useContext(PageRenderContext) || [];
}
export const PageRenderContextProvider = (props: { children: JSX.Element; item: Vertex; store: PageRenderStore; }) => {
  const parentItems = usePageRenderContext();
  props.store[1]('vertexes', [...(parentItems[0]?.vertexes || []), props.item]);

  return (
    <PageRenderContext.Provider value={props.store}>
      {props.children}
    </PageRenderContext.Provider>
  );
};
