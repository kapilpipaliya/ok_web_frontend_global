import { createSignal } from "solid-js";
import {
  HoverIdContext,
  SelectedCollContext,
  SelectedIdContext,
  DragOverTargetIdContext,
  HiddenNodesContext,
  DraggedVertexContext,
  SelectedComponentContext,
  IndicatorPositionContext,
  ShowDrawerContext,
} from "~/lib/contexts";
import type { Id, Vertex } from "~/lib/graph/graph";

export  function PageDesignerContext(props: any) {
  const hoverId = createSignal<Id | number>(-1);
  const selectedColl = createSignal<{ vertexId: Id | number }>({
    vertexId: -1,
  });
  const selectedId = createSignal<Id | number>(-1);
  const dragOverTargetId = createSignal<Id | number>(-1);
  const hiddenNodes = createSignal<Id[]>([]);
  const showDrawerContext = createSignal(false);
  const selectedComponent = createSignal<{ vertexId: Id | number }>({
    vertexId: -1,
  });
  const indicatorPosition = createSignal<{
    activeItem: Id | null;
    position: "before" | "after" | "center" | "left" | "right" | null;
  }>({ activeItem: null, position: null });
  const draggedVertices = createSignal<Vertex[] | []>([]);
  return (

      <HoverIdContext.Provider value={hoverId}>
        <SelectedCollContext.Provider value={selectedColl}>
          <SelectedIdContext.Provider value={selectedId}>
            <DragOverTargetIdContext.Provider value={dragOverTargetId}>
              <ShowDrawerContext.Provider value={showDrawerContext}>
                <HiddenNodesContext.Provider value={hiddenNodes}>
                  <DraggedVertexContext.Provider value={draggedVertices}>
                    <SelectedComponentContext.Provider
                      value={selectedComponent}
                    >
                      <IndicatorPositionContext.Provider
                        value={indicatorPosition}
                      >
                        {props.children}
                      </IndicatorPositionContext.Provider>
                    </SelectedComponentContext.Provider>
                  </DraggedVertexContext.Provider>
                </HiddenNodesContext.Provider>
              </ShowDrawerContext.Provider>
            </DragOverTargetIdContext.Provider>
          </SelectedIdContext.Provider>
        </SelectedCollContext.Provider>
      </HoverIdContext.Provider>
  );
}

// export default to make it client only
export default PageDesignerContext;