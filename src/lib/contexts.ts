import { createContext, createSignal, useContext } from "solid-js";

import type { Id, Vertex } from "~/lib/graph/graph";

export const LoadingContext = createContext(createSignal(false));
export const IsPreviewContext = createContext(createSignal(false));

export interface IFormContext {
  changedIds: { edgeIds: Id[]; vertexIds: Id[] };
  cleanUpConfig: () => { [key: string]: any };
  formData: Vertex;
  formMeta: Vertex;
  groupByTabsAndGroup: {
    [tab: string]: {
      [group: string]: Vertex[];
    };
  };
  metaTxnId: number;
  tabs: string[];
  txnId: number;
  validationGroup?: {};
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any });

export const useLoading = () => useContext(LoadingContext);
export const useIsPreview = () => useContext(IsPreviewContext);
export const useFormContext = () => useContext(FormContext);
export const usePageContext = () => useContext(PageContext);
