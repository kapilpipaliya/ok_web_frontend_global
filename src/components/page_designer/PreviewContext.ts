import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

export function getInitialPreviewStore() {
  return {
    isDesignMode: false as boolean | undefined,
    previewData: undefined as Vertex | undefined,
    previewMeta: undefined as Vertex | undefined,
  };
}

export type PreviewStoreObject = ReturnType<typeof getInitialPreviewStore>;
type PreviewStore = ReturnType<typeof createStore<PreviewStoreObject>>;
export const PreviewContext = createContext<PreviewStore>(createStore(getInitialPreviewStore()));

export function usePreviewContext() {
  return useContext(PreviewContext);
}
