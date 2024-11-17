import type { createStore } from "solid-js/store";

import { createContext, type JSX, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { InitialPermissions } from "../InitialPermissions";
import { FunctionArgumentType } from "../../form/FieldSchemaType";

export function getInitialPageRenderStore() {
  return {
    // ...InitialPermissions,
    context: {} as FunctionArgumentType,
  };
}

export type PageRenderObject = ReturnType<typeof getInitialPageRenderStore>;
export type PageRenderStore = ReturnType<typeof createStore<PageRenderObject>>;
export const PageRenderContext = createContext<PageRenderStore[]>();

export function usePageRenderContext() {
  // this can be undefined too
  return useContext(PageRenderContext) || [];
}
export const PageRenderContextProvider = (props: {
  children: JSX.Element;
  store: PageRenderStore;
}) => {
  const parentItems = usePageRenderContext();

  return (
    <PageRenderContext.Provider value={[...parentItems, props.store]}>
      {props.children}
    </PageRenderContext.Provider>
  );
};
