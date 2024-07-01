import type { SetStoreFunction, } from "solid-js/store";

import { batch, } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";

export function resetDragDropState(setLayoutStore: SetStoreFunction<PageLayoutObject>) {
  batch(() => {
    setLayoutStore({
      activeItem: null,
      dragOverTargetId: -1,
      draggedVertices: [],
      position: null,
    });
  });
}
