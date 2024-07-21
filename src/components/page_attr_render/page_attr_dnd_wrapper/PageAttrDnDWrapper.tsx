import { autoUpdate } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import {
  type JSX,
  Show,
  children,
  createMemo,
  createSelector,
  createSignal,
} from "solid-js";
import { Portal } from "solid-js/web";

import { ZIndex } from "~/components/ZIndex";
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
import { AttrConfigPopOver } from "./AttrConfigPopOver";
import { BorderOverlay } from "./BorderOverlay";

interface PageAttrDnDWrapperProps {
  children: JSX.Element;
  item: Vertex;
}
export function PageAttrDnDWrapper(
  props: Readonly<PageAttrDnDWrapperProps>
) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [isPreview] = useIsPreview();
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();

  const childrenAttrs = createMemo(() => getChildrenAttrs(graph, setGraph, props.item));
  const resolvedChildren = children(() => props.children);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const position = useFloating(reference, floating, {
    placement: isSelectedLayoutId(props.item.id) ? "top-start" : "top-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });

  return (
    <PageRenderVertexContext.Provider value={[...usePageRenderVertexContext(), props.item]}>
      <div // NOSONAR 
        class={`${"drop-targe"}`}
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
        ref={el => {setReference(el); el.getBoundingClientRect = () => getBoundingRect(el)}}
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
         <BorderOverlay item={props.item} reference={reference} />
      </div>
    </PageRenderVertexContext.Provider>
  );
}
