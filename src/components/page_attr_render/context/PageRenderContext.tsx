import type { createStore } from "solid-js/store";

import { createContext, type JSX, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { InitialPermissions } from "../InitialPermissions";
import { FunctionArgumentType } from "../../form/FieldSchemaType";

export function getInitialPageRenderStore() {
  return {
    // ...InitialPermissions,
    context: {} as FunctionArgumentType,
    data: [] as Vertex[],
    vertexes: [] as Vertex[],
  };
}

export type PageRenderObject = ReturnType<typeof getInitialPageRenderStore>;
export type PageRenderStore = ReturnType<typeof createStore<PageRenderObject>>;
export const PageRenderContext = createContext<PageRenderStore>();

export function usePageRenderContext() {
  // this can be undefined too
  return useContext(PageRenderContext) || [];
}
export const PageRenderContextProvider = (props: {
  children: JSX.Element;
  data: Vertex;
  meta: Vertex;
  store: PageRenderStore;
}) => {
  const parentItems = usePageRenderContext();
  props.store[1]("vertexes", [...(parentItems[0]?.vertexes || []), props.meta]);
  if (props.data) {
    props.store[1]("data", [...(parentItems[0]?.data || []), props.data]);
  }

  return (
    <PageRenderContext.Provider value={props.store}>
      {props.children}
    </PageRenderContext.Provider>
  );
};
