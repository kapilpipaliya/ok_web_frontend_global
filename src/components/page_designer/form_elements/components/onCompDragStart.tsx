import type { useGraph, Vertex } from "~/lib/graph/graph";

import type { useDesignerLayoutStore } from "../../context/LayoutContext";

export function onCompDragStart(
  e: DragEvent,
  graph: ReturnType<typeof useGraph>[0],
  childId: string,
  setLayoutStore: ReturnType<typeof useDesignerLayoutStore>[1],
  selectedComponents?: () => Set<Vertex>,
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void,
) {
  e.stopPropagation();
  setLayoutStore("draggedVertices", []);
  const draggedItems =
    selectedComponents && selectedComponents().size > 0
      ? Array.from(selectedComponents())
      : [graph.vertexes[childId]];
  setLayoutStore("draggedVertices", (prev) => [...prev, ...draggedItems]);
  if (setSelectedComponents) {
    setSelectedComponents(() => new Set<Vertex>());
  }
}
