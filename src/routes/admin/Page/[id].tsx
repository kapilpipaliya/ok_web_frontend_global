import {
  DraggedVertexContext,
  HiddenNodesContext,
  HoverIdContext,
  IndicatorPositionContext,
  SelectedCollContext,
  SelectedComponentContext,
  SelectedIdContext,
  TargetIdContext,
} from "~/lib/contexts";
import { createSignal } from "solid-js";
import { Id, Vertex } from "~/lib/graph/graph";
import LayoutDragAndDrop from "~/pages/drag-drop/Layout/Layout-DragAndDrop";

export default function Page() {
  const hoverId = createSignal<number>(-1);
  const selectedColl = createSignal<{ vertexId: number }>({ vertexId: -1 });
  const selectedId = createSignal<Id>(-1);
  const targetId = createSignal<Id>(-1);
  const hiddenNodes = createSignal<Id[]>([]);
  const draggedVertex = createSignal<Vertex | null>(null);
  const selectedComponent = createSignal<{ vertexId: number }>({
    vertexId: -1,
  });
  const indicatorPosition = createSignal<{
    activeItem: Id | null;
    position: "before" | "after" | "center" | null;
  }>({ activeItem: null, position: null });

  return (
    
        <HoverIdContext.Provider value={hoverId}>
          <SelectedCollContext.Provider value={selectedColl}>
            <SelectedIdContext.Provider value={selectedId}>
              <TargetIdContext.Provider value={targetId}>
                <HiddenNodesContext.Provider value={hiddenNodes}>
                  <DraggedVertexContext.Provider value={draggedVertex}>
                    <SelectedComponentContext.Provider
                      value={selectedComponent}
                    >
                      <IndicatorPositionContext.Provider
                        value={indicatorPosition}
                      >
                        <LayoutDragAndDrop />
                      </IndicatorPositionContext.Provider>
                    </SelectedComponentContext.Provider>
                  </DraggedVertexContext.Provider>
                </HiddenNodesContext.Provider>
              </TargetIdContext.Provider>
            </SelectedIdContext.Provider>
          </SelectedCollContext.Provider>
        </HoverIdContext.Provider>
      
  );
}
