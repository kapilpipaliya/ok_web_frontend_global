import { autoUpdate } from "@floating-ui/dom";
import { klona } from "klona";
import { useFloating } from "solid-floating-ui";
import {
  type JSX,
  Show,
  children,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import { ZIndex } from "~/components/ZIndex";
import { generateBoxShadow } from "~/components/css_properties/utils/generateBoxShadow";
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
import { getBoundingRect } from "~/components/page_designer/functions/getIndicatorPosition";
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
  const resolvedChildren = children(() => props.children);

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

  createEffect(() => {
    const ref = reference();
    if (!ref) return;
    ref.getBoundingClientRect = () => getBoundingRect(ref);
  });
  const position = useFloating(reference, floating, {
    placement: isSelectedLayoutId(props.item.id) ? "top-start" : "top-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });

  const ShowBorder = () => {
    const [store, setStore] = createStore({
      maxHeight: 0,
      maxWidth: 0,
      x: 0,
      y: 0
    });
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  
    const ref = reference();
    if (!ref) return;
    ref.getBoundingClientRect = () => getBoundingRect(ref);

    const position = useFloating(reference, floating, {
      placement: "bottom-start",
      strategy: "fixed",
      whileElementsMounted: autoUpdate
    });
    createEffect(() => {
      const pos = klona(position);
      if(pos.strategy) {
        const rect = getBoundingRect(reference()!);
        setStore({
          maxHeight: rect.height + 2,
          maxWidth: rect.width + 2,
          x: pos.x ?? 0,
          y: (pos.y ?? 0) - rect.height
        })
      }
    });
    return (
      <Portal><div class={`${getBorder()} height:${store.maxHeight}px left:${store.x}px pointer-events:none position:fixed top:${store.y}px width:${store.maxWidth}px`}
        ref={setFloating}
      ></div></Portal>
    );
  };

  return (
    <PageRenderVertexContext.Provider value={[...usePageRenderVertexContext(), props.item]}>
      <div // NOSONAR 
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
        ref={setReference}
        style="display:contents;"
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
        <Show when={getBorder()}>
          <ShowBorder />
        </Show>
      </div>
    </PageRenderVertexContext.Provider>
  );
}
