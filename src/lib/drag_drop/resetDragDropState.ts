import { batch, Setter } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";
import { IIndicatorPosition } from "../contexts";


export function resetDragDropState(setDraggedVertex: Setter<Vertex[] | []>, setIndicatorPosition: Setter<IIndicatorPosition>, setDragOverTargetId: Setter<string | number>) {
  batch(() => {
    setDraggedVertex([]);
    setIndicatorPosition({ activeItem: null, position: null });
    setDragOverTargetId(-1);
  });
}
