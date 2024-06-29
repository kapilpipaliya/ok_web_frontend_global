import { batch, } from "solid-js";
import type { SetStoreFunction, } from "solid-js/store";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";

export function resetDragDropState(setLayoutStore: SetStoreFunction<PageLayoutObject>) {
  batch(() => {
    setLayoutStore({
      draggedVertices: [],
      position: null,
      activeItem: null,
      dragOverTargetId: -1,
    });
  });
}
