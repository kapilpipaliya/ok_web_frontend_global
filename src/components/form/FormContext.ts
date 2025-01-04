import type { createStore, SetStoreFunction } from "solid-js/store";

import { Accessor, createContext, useContext } from "solid-js";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { InitialPermissions } from "../page_attr_render/InitialPermissions";
import {generateNewTxnId} from "~/lib/graph/transaction/generateNewTxnId";

export function getInitialFormStore(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  const cleanUpConfigInitial = { rowMetaTxnIds: [] as number[] };
  return {
    ...InitialPermissions,
    // TODO: Fix this
    cleanUpConfig: () => cleanUpConfigInitial,
    count: 1,
    discardPopup: false,
    error: undefined as string | undefined,
    formDataId: undefined as unknown as string,
    formMetaId: undefined as unknown as string,
    formMetaData: null as IFormMetaData | null,
    id: undefined as string | undefined,
    isPreview: false,
    mounted: false,
    txnId: generateNewTxnId(graph, setGraph),
  };
}

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;

export const FormContext = createContext<Id>();

export function useFormContext() {
  return useContext(FormContext);
}
