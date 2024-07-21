import { autoUpdate } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import { type JSX, Show, children, createMemo, createSelector, createSignal, onMount, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { ZIndex } from "~/components/ZIndex";
import { generateBoxShadow } from "~/components/css_properties/utils/generateBoxShadow";
import { ensureArray } from "~/components/fields/ensureArray";
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
import { getDnDBoxShadowArgs } from "../../page_designer/functions/getDnDBoxShadowArgs";
import { AttrConfigPopOver } from "./AttrConfigPopOver";

export function PageAttrDnDWrapper(
  props: Readonly<{ children: JSX.Element; item: Vertex }>
) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useIsPreview();
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();

  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);
  const childrenAttrs = createMemo(() => getChildrenAttrs(graph, setGraph, props.item));
  const resolvedChildren = children(() => props.children)

  const getBorder = () => {
    let boxShadow = "";

    if (!isPreview()) {
      if (isActiveTargetItem()) {
        const boxShadowProps = getDnDBoxShadowArgs(layoutStore.position, "green-60");
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])}`;
      }

      if (isSelectedLayoutId(props.item.id)) {
        boxShadow += " b:1px|solid|blue-60";
      } else if (isSelectedHoverId(props.item.id)) {
        boxShadow += " b:1px|solid|blue-80";
      }
    }

    return boxShadow;
  };

  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const position = useFloating(reference, floating, {
    placement: isSelectedLayoutId(props.item.id) ? "top-start" : "top-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });


  const ShowBorder = () => {
    const [maxWidth, setMaxWidth] = createSignal(0);
    const [maxHeight, setMaxHeight] = createSignal(0);
    const [minTop, setMinTop] = createSignal(0);
    const [minLeft, setMinLeft] = createSignal(0);
  
    const measureElements = () => {
      const rectangles = ensureArray(resolvedChildren())
        .filter(element => element)
        .map(element => element.getBoundingClientRect());
  
      if (rectangles.length === 0) {
        return;
      }
  
      const getMaxProperty = (property: keyof DOMRect) => Math.max(...rectangles.map(rect => rect[property]));
      const getMinProperty = (property: keyof DOMRect) => Math.min(...rectangles.map(rect => rect[property]));
  
      setMaxWidth(getMaxProperty('width'));
      setMaxHeight(getMaxProperty('height'));
      // setMaxWidth(getMaxProperty('right') - getMinProperty('left'));
      // setMaxHeight(getMaxProperty('bottom') - getMinProperty('top'));
      setMinTop(getMinProperty('top'));
      setMinLeft(getMinProperty('left'));
    };
  

    onMount(() => {
      requestAnimationFrame(measureElements);

    });
  
    return (
      <Portal>
        <div
          class={`${getBorder()} fixed`}
          style={{ height: `${maxHeight() + 1}px`, left: `${minLeft() - 1}px`, 'pointer-events': 'none', top: `${minTop() - 1}px`, width: `${maxWidth() + 1}px` }}
        ></div>
      </Portal>
    );
  };

  return (
    <PageRenderVertexContext.Provider value={[...usePageRenderVertexContext(), props.item]}>
      <span // NOSONAR 
        class={`${"drop-targe"} ${(layoutStore.draggedVertices.length > 0 || isSelectedLayoutId(props.item.id)) ? "m:3px" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onLayoutItemClick(setLayoutStore, props.item.id, graph, setGraph);
        }}
        onDragEnter={(e) =>
          handleDragOverAndSetDropPosition(
            e,
            layoutStore,
            setLayoutStore,
            props.item,
            isPreview(),
            () => [],
            childrenAttrs,
            graph,
            setGraph,
            layoutStore.formData.formData
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
            childrenAttrs,
            graph,
            setGraph,
            layoutStore.formData.formData
          )
        }
        onDrop={async (e) => {
          await handleDrop(
            e,
            layoutStore,
            setLayoutStore,
            graph,
            setGraph,
            showErrorToast
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
        ref={el => setTimeout(() => setReference(el.firstElementChild!), 150)}
      >
        <Show keyed when={!layoutStore?.hiddenNodes.includes(props.item.id)}>
          {resolvedChildren()}
        </Show>
        <Show when={isSelectedLayoutId(props.item.id) || isSelectedHoverId(props.item.id) || layoutStore.multiHighlight.includes(props.item.id)}>
          <ZIndex>
            <Portal mount={document.body}>
              <div
                class=""
                ref={setFloating}
                style={{
                  left: `${position.x ?? 0}px`,
                  position: position.strategy,
                  top: `${position.y ?? 0}px`
                }}
              >
                <AttrConfigPopOver item={props.item} />
              </div>
            </Portal>
          </ZIndex>
        </Show>
      </span>
      <Show when={getBorder()}>
        <ShowBorder />
      </Show>
    </PageRenderVertexContext.Provider>
  );
}
