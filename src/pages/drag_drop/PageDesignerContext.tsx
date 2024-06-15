import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {
  HoverIdContext,
  SelectedCollContext,
  SelectedIdContext,
  DragOverTargetIdContext,
  HiddenNodesContext,
  DraggedVertexContext,
  SelectedComponentContext,
  IndicatorPositionContext,
  FormSettingsContext,
  ShowDrawerContext,
  FormSettings,
} from "~/lib/contexts";
import type { Id, Vertex } from "~/lib/graph/graph";

export default function PageDesignerContext(props: any) {
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
  const formSetting = createStore({
    labelPosition: "top", // Default position
    labelColor: "black", // Default label color
    inputBackground: "white",
    activeStep: 0,
  } as FormSettings);
  const draggedVertices = createSignal<Vertex[] | []>([]);
  return (
    <FormSettingsContext.Provider value={formSetting}>
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
    </FormSettingsContext.Provider>
  );
}
