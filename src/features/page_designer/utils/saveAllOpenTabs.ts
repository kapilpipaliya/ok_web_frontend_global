import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Navigator } from "@solidjs/router";
import type { StoreSetter as SetStoreFunction } from "solid-js";

import { saveAndCaptureForm } from "~/features/page_designer/utils/saveAndCapture";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";

import type { PageLayoutObject } from "../context/LayoutContext";
import { getUnsavedTabs } from "./getUnsavedTabs";

interface SaveAllOpenTabsOptions {
  graph: GraphInterface;
  layoutStore: PageLayoutObject;
  navigate: Navigator;
  setGraph: SetStoreFunction<GraphInterface>;
  showErrorToast: (message: string) => void;
  showLoadingToast: (options: {
    loadMessage: string;
    onSuccess: (value: any) => void;
    promise: Promise<any>;
    successMessage: string;
  }) => void;
  showWarningToast: (message: string) => void;
}

export async function saveAllOpenTabs(
  options: SaveAllOpenTabsOptions,
): Promise<boolean> {
  const {
    graph,
    layoutStore,
    navigate,
    setGraph,
    showErrorToast,
    showLoadingToast,
    showWarningToast,
  } = options;

  const unsavedTabs = getUnsavedTabs(graph, layoutStore);
  let allSaved = true;

  for (const tab of unsavedTabs) {
    const isMainForm = layoutStore.mainFormId === tab.formId;
    const saved = await saveAndCaptureForm(
      () => graph.vertexes[tab.formId] as Vertex<FormStoreObject>,
      graph,
      setGraph,
      showErrorToast,
      showLoadingToast,
      showWarningToast,
      navigate,
      isMainForm,
    );

    if (!saved) {
      allSaved = false;
    }
  }

  return allSaved && getUnsavedTabs(graph, layoutStore).length === 0;
}
