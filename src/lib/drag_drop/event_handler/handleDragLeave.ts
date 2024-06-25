import type { Setter } from "solid-js";
import type { IIndicatorPosition } from "../../contexts";


export function handleDragLeave(setIndicatorPosition: Setter<IIndicatorPosition>) {
  // e.stopPropagation();
  setIndicatorPosition({ activeItem: null, position: null });
  // console.log('leave',layoutVertex.id)
  // Do not uncomment this, because drag is called before on drop
  // setDraggedVertex(null);
  // resetDragDropState();
}
