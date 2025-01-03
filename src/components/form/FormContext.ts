import type { createStore } from "solid-js/store";

import { Accessor, createContext, useContext } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { InitialPermissions } from "../page_attr_render/InitialPermissions";

export function getInitialFormStore(graph: GraphInterface) {
  const cleanUpConfigInitial = { rowMetaTxnIds: [] as number[] };
  return {
    ...InitialPermissions,
    cleanUpConfig: () => cleanUpConfigInitial,
    count: 1,
    discardPopup: false,
    error: undefined as string | undefined,
    formDataId: undefined as unknown as string,
    formId: undefined as string | undefined,
    formMetaId: undefined as unknown as string,
    formMetaData: null as IFormMetaData | null,
    id: (() => undefined) as Accessor<string | undefined>,
    isPreview: false,
    mounted: false,
    txnId: graph.newTxnId(),
  };
}

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;
export type FormStore = ReturnType<typeof createStore<FormStoreObject>>;

export const FormContext = createContext<FormStore>();

export function useFormContext() {
  return useContext(FormContext) || [];
}
