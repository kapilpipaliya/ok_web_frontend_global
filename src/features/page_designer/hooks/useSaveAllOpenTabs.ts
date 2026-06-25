import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal } from "solid-js";

import { useToast } from "~/components/styled/modal/Toast";
import { useGraph } from "~/lib/graph/context/UseGraph";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { getUnsavedTabs } from "../utils/getUnsavedTabs";
import { saveAllOpenTabs } from "../utils/saveAllOpenTabs";

export function useSaveAllOpenTabs() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [isSaving, setIsSaving] = createSignal(false);

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const unsavedTabs = createMemo(() => getUnsavedTabs(graph, layoutStore()));
  const hasUnsavedTabs = createMemo(() => unsavedTabs().length > 0);

  const saveAll = async () => {
    setIsSaving(true);
    try {
      return await saveAllOpenTabs({
        graph,
        layoutStore: layoutStore(),
        navigate,
        setGraph,
        showErrorToast,
        showLoadingToast,
        showWarningToast,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    hasUnsavedTabs,
    isSaving,
    layoutStore,
    saveAll,
    unsavedTabs,
  };
}
