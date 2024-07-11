import { Popover } from "@kobalte/core/popover";
import { type JSX, createMemo, createSelector, Show,  } from "solid-js";

import { PageRenderVertexContext, usePageRenderVertexContext } from "~/components/page_attr_render/Context";
import { handleDragLeave } from "~/components/page_designer/event_handler/handleDragLeave";
import { handleDragOver } from "~/components/page_designer/event_handler/handleDragOver";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { useIsPreview } from "~/lib/contexts";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { AttrConfigPopOver } from "./AttrConfigPopOver";

export function PageAttrDnDWrapper(props: Readonly<{ children: JSX.Element; item: Vertex; }>) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useIsPreview();
  const isSelectedDragOverTargetId = createSelector(() => layoutStore.dragOverTargetId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();

  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);
  const children = createMemo(() => getChildrenAttrs(graph, setGraph, props.item));

  const getBorder = () => {
    if (!isPreview()) {
      if (isActiveTargetItem()) {
        switch (layoutStore.position) {
          case "center":
            return "box-shadow:inset|0|0|0|2px|rgb(0,125,0),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "before":
            return "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "after":
            return "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "left":
            return "box-shadow:inset|8px|0|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
          case "right":
            return "box-shadow:inset|-8px|0|0|-6px|rgb(0,0,255),inset|0|0|0|1px|rgba(0,0,0,0.1)>*";
        }
      }
      if (isSelectedLayoutId(props.item.id) || isSelectedDragOverTargetId(props.item.id)) {
        return "box-shadow:inset|0|0|0|2px|rgb(57,150,225)>*";
      }
      if (isSelectedHoverId(props.item.id)) {
        return "box-shadow:inset|0|0|0|2px|rgb(210,219,252)>*";
      }
    }
  };

  return (
    <PageRenderVertexContext.Provider value={[...usePageRenderVertexContext(), props.item]}>
      <button
        class={`${getBorder() || ""} contents`}
        onClick={(e) => {
          e.stopPropagation();
          onLayoutItemClick(setLayoutStore, props.item, graph, setGraph);
        }}
        onDragEnter={(e) => handleDragOverAndSetDropPosition(e, layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, layoutStore.formData.formData)}
        onDragLeave={() => handleDragLeave(setLayoutStore)}
        onDragOver={(e) => handleDragOver(e, layoutStore, setLayoutStore, props.item, isPreview(), () => [], children, graph, setGraph, layoutStore.formData.formData)}
        onDrop={async (e) => {
          await handleDrop(e, layoutStore, graph, showErrorToast, setGraph, layoutStore.formData.txnId, layoutStore.formData.formData);
          resetDragDropState(setLayoutStore);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', props.item.id);
        }}
        onmouseleave={(e) => {
          e.stopPropagation();
          setLayoutStore('hoverId', -1);
        }}
      >
        <Popover open={isSelectedLayoutId(props.item.id) || isSelectedHoverId(props.item.id)} placement={`${isSelectedLayoutId(props.item.id) ? "top-start" : "top-end"}`}>
          <Popover.Anchor>
          <Show keyed when={!layoutStore?.hiddenNodes.includes(props.item.id)}>
            {props.children}
          </Show>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content class="popover__content">
              <AttrConfigPopOver item={props.item}/>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </button>
    </PageRenderVertexContext.Provider>
  );
}
