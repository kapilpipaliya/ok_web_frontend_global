import type { SetStoreFunction } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { IDToRuleMap } from "~/features/page_designer/functions/generateFormMetaAttributes";
import type { GraphInterface, Id } from "~/lib/graph/graph";

import { InitialPermissions } from "~/features/page_attr_render/InitialPermissions";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;

export function getInitialFormStore(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return {
    ...InitialPermissions,
    componentValue: null as Id | null,
    count: 1,
    discardPopup: false,
    error: undefined as string | undefined,
    formDataId: undefined as unknown as string,
    // formMetaData: null as IFormMetaData | null,
    formMetaId: undefined as unknown as string,
    hiddenNodes: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    id: undefined as string | undefined,
    isFetching: false,
    isPreview: false,
    mounted: false,
    multiHighlight: [] as Array<Id | number>,
    openedViews: [] as Id[],

    selectedId: -1 as Id | number,
    // check if at least one form in the layout tree when deleting a layout item, it display a dialog
    shouldContainAtLeastOneForm: false,
    txnId: generateNewTxnId(graph, setGraph),
    usedAttrsInNameKeys: [] as Array<Id | number>,
    usedAttrsInRules: {} as IDToRuleMap,
    usedAttrsInUniqueConstraints: [] as Array<Id | number>,
  };
}

export const FormContext = createContext<Id>();

export function useFormContext() {
  return useContext(FormContext);
}
