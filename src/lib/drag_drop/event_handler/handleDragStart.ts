import type { Setter } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";


export function handleDragStart(e: DragEvent, setDraggedVertex: Setter<Vertex[] | []>, layoutVertex: Vertex) {
  e.stopPropagation();
  // setDraggedVertex(layoutVertex);
  setDraggedVertex((prev) => [...prev, layoutVertex]);
}
