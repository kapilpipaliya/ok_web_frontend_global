import type { createStore } from "solid-js/store";

import { createContext, type JSX, useContext } from "solid-js";

import type { FunctionArgumentType } from "../../../components/form/type/FieldSchemaType";

export type RenderObject = ReturnType<typeof getInitialPageRenderStore>;

export type RenderStore = ReturnType<typeof createStore<RenderObject>>;

export function getInitialPageRenderStore() {
  return {
    context: {} as FunctionArgumentType,
    isViewMode: undefined as boolean | undefined,
    mounted: false,
    onChange: (() => {}) as (value: any) => void,
    parentOnChange: (() => {}) as (value: any) => void,
    parentOnMerge: (() => {}) as (value: any) => void,
    projections: [] as string[],
    readOnly: undefined as boolean | undefined,
  };
}

export const RenderContext = createContext<RenderStore[]>();

export function useRenderContext() {
  return useContext(RenderContext) || [];
}

// Save each parent field in the context
export const RenderContextProvider = (props: {
  children: JSX.Element;
  store: RenderStore;
}) => {
  const parentItems = useRenderContext();

  return (
    <RenderContext.Provider value={[...parentItems, props.store]}>
      {props.children}
    </RenderContext.Provider>
  );
};
