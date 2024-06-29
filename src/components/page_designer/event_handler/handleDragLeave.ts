import type { SetStoreFunction } from "solid-js/store";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";


export function handleDragLeave(setLayoutStore: SetStoreFunction<PageLayoutObject>) {
  setLayoutStore({ activeItem: null, position: null });
  // Do not uncomment this, because drag is called before on drop
  // setDraggedVertex(null);
  // resetDragDropState();
}
