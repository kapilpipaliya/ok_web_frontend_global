import { Popover } from "@kobalte/core/popover";
import { type JSX, Show, createMemo, createSelector } from "solid-js";

import {
  PageRenderVertexContext,
  usePageRenderVertexContext,
} from "~/components/page_attr_render/Context";
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

export function PageAttrDnDWrapper(
  props: Readonly<{ children: JSX.Element; item: Vertex }>,
) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useIsPreview();
  const isSelectedDragOverTargetId = createSelector(
    () => layoutStore.dragOverTargetId,
  );
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();

  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.item),
  );

  const getBorder = () => {
    const createBoxShadow = (offsetX: number|string, offsetY: number|string, blur: number|string, spread: number|string, color: string) =>
      {
        // we need inset shadow for the border
        const shadowPart = `${offsetX}|${offsetY}|${blur}|${spread}|${color}`
        return `box-shadow:inset|${shadowPart}>*`;
      };
  
    let boxShadow = "";
  
    if (!isPreview()) {
      if (isActiveTargetItem()) {
        switch (layoutStore.position) {
          case "center":
            boxShadow = createBoxShadow(0, 0, 0, "2px", "rgb(0,125,0)");
            break;
          case "before":
            boxShadow = createBoxShadow(0, "8px", 0, "-6px", "rgb(0,0,255)");
            break;
          case "after":
            boxShadow = createBoxShadow(0, "-8px", 0, "-6px", "rgb(0,0,255)");
            break;
          case "left":
            boxShadow = createBoxShadow("8px", 0, 0, "-6px", "rgb(0,0,255)");
            break;
          case "right":
            boxShadow = createBoxShadow("-8px", 0, 0, "-6px", "rgb(0,0,255)");
            break;
        }
      } else if (
        isSelectedLayoutId(props.item.id) ||
        isSelectedDragOverTargetId(props.item.id)
      ) {
        boxShadow = createBoxShadow(0, 0, 0, "2px", "rgb(57,150,225)");
      } else if (isSelectedHoverId(props.item.id)) {
        boxShadow = createBoxShadow(0, 0, 0, "2px", "rgb(210,219,252)");
      }
    }
  
    return boxShadow;
  };
  

  return (
    <PageRenderVertexContext.Provider
      value={[...usePageRenderVertexContext(), props.item]}
    >
      <div // NOSONAR 
        class={`${getBorder() ?? ""} contents`}
        onClick={(e) => {
          e.stopPropagation();
          onLayoutItemClick(setLayoutStore, props.item, graph, setGraph);
        }}
        onDragEnter={(e) =>
          handleDragOverAndSetDropPosition(
            e,
            layoutStore,
            setLayoutStore,
            props.item,
            isPreview(),
            () => [],
            children,
            graph,
            setGraph,
            layoutStore.formData.formData,
          )
        }
        onDragLeave={() => handleDragLeave(setLayoutStore)}
        onDragOver={(e) =>
          handleDragOver(
            e,
            layoutStore,
            setLayoutStore,
            props.item,
            isPreview(),
            () => [],
            children,
            graph,
            setGraph,
            layoutStore.formData.formData,
          )
        }
        onDrop={async (e) => {
          await handleDrop(
            e,
            layoutStore,
            graph,
            showErrorToast,
            setGraph,
            layoutStore.formData.txnId,
            layoutStore.formData.formData,
          );
          resetDragDropState(setLayoutStore);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          setLayoutStore("hoverId", props.item.id);
        }}
        onmouseleave={(e) => {
          e.stopPropagation();
          setLayoutStore("hoverId", -1);
        }}
      >
        <Popover
          open={
            isSelectedLayoutId(props.item.id) ||
            isSelectedHoverId(props.item.id) ||
            layoutStore.multiHighlight.includes(props.item.id)
          }
          placement={`${isSelectedLayoutId(props.item.id) ? "top-start" : "top-end"}`}
        >
          <Popover.Anchor>
            <Show
              keyed
              when={!layoutStore?.hiddenNodes.includes(props.item.id)}
            >
              {props.children}
            </Show>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content class="popover__content">
              <AttrConfigPopOver item={props.item} />
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </div>
    </PageRenderVertexContext.Provider>
  );
}
