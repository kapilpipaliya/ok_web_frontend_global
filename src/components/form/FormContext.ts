import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { InitialPermissions } from "../page_attr_render/InitialPermissions";

export function getInitialFormStore(graph: GraphInterface) {
  return {
    ...InitialPermissions,
    cleanUpConfig: () => ({ rowMetaTxnIds: [] as number[] }),
    count: 1,
    discardPopup: false,
    error: undefined as string | undefined,
    formData: undefined as unknown as Vertex,
    formId: undefined as string | undefined,
    formMeta: undefined as unknown as Vertex,
    formMetaData: null as IFormMetaData | null,
    isPreview: false,
    mounted: false,
    txnId: graph.newTxnId,
  };
}

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;
export type FormStore = ReturnType<typeof createStore<FormStoreObject>>;

export const FormContext = createContext<FormStore>();

export function useFormContext() {
  return useContext(FormContext) || [];
}