import type { createStore, SetStoreFunction } from "solid-js/store";

import { Accessor, createContext, useContext } from "solid-js";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { InitialPermissions } from "../../page_attr_render/InitialPermissions";
import {generateNewTxnId} from "~/lib/graph/transaction/generateNewTxnId";
import { IDToRuleMap } from "~/components/page_designer/functions/generateFormMetaAttributes";

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
    activeItem: null as Id | null | number,
    draggedVertexIds: [] as Id[],
    hiddenNodes: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    multiHighlight: [] as Array<Id | number>,
    // this propes may required on preview too
    position: null as "after" | "before" | "center" | "left" | "right" | null,
    selectedComponent: -1 as Id | number,
    selectedId: -1 as Id | number,

    // check if at least one form in the layout tree when deleting a layout item, it display a dialog
    shouldContainAtLeastOneForm: false,
    usedAttrsInNameKeys: [] as Array<Id | number>,
    usedAttrsInRules: {} as IDToRuleMap,
    usedAttrsInUniqueConstraints: [] as Array<Id | number>,
    view: "Desktop",
  };
}

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;

export const FormContext = createContext<Id>();

export function useFormContext() {
  return useContext(FormContext);
}
