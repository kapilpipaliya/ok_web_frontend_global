import type { createStore } from "solid-js/store";

import { type Accessor, createContext, type JSX, useContext } from "solid-js";

import type { GenericField } from "./constants/FieldSchemaType";

export function getInitialPageRenderStore() {
  return {
    meta: [] as Accessor<GenericField>[],
  };
}

export type RenderObject = ReturnType<typeof getInitialPageRenderStore>;
export type RenderStore = ReturnType<typeof createStore<RenderObject>>;
export const RenderContext = createContext<RenderStore>();

export function useRenderContext() {
  return useContext(RenderContext) || [];
}

// Save each parent field in the context
export const RenderContextProvider = (props: {
  children: JSX.Element;
  meta: Accessor<GenericField>;
  store: RenderStore;
}) => {
  const [parentItems] = useRenderContext();
  props.store[1]("meta", [...(parentItems?.meta || []), props.meta]);

  return (
    <RenderContext.Provider value={props.store}>
      {props.children}
    </RenderContext.Provider>
  );
};
