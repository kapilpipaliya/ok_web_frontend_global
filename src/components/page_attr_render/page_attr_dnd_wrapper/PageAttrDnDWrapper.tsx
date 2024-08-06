import {
  children,
  createMemo,
  createSelector,
  createSignal,
  type JSX,
  Show,
} from "solid-js";

import { handleDragLeave } from "~/components/page_designer/event_handler/handleDragLeave";
import { handleDragOver } from "~/components/page_designer/event_handler/handleDragOver";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getBoundingRectChildren } from "~/components/page_designer/functions/getBoundingRectChildren";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { useToast } from "../../Toast";
import { AttrConfigPopOverWrapper } from "./AttrConfigPopOverWrapper";
import { BorderOverlay } from "./BorderOverlay";

interface PageAttrDnDWrapperProps {
  children: JSX.Element;
  item: Vertex;
}
export function PageAttrDnDWrapper(props: Readonly<PageAttrDnDWrapperProps>) {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const [previewStore] = usePreviewContext();
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();

  const childrenAttrs = createMemo(() => getChildrenAttrs(graph, setGraph, props.item));
  const resolvedChildren = children(() => props.children);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onLayoutItemClick(setLayoutStore, props.item.id, graph, setGraph);
  };

  // no need debounde, it is called too less
  const handleMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", props.item.id);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", -1);
  };

  // debounce is giving error, node not found when running element.currentTarget and we must need it
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStore,
      setLayoutStore,
      props.item,
      previewStore.isDesignMode,
      false,
      childrenAttrs,
      graph,
      setGraph,
      layoutStore.formStore[0].formData
    );
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStore,
      setLayoutStore,
      graph,
      setGraph,
      showErrorToast
    );
    resetDragDropState(setLayoutStore);
  };

  return (
    <div // NOSONAR
      onClick={handleClick}
      onDragEnter={handleDragOverEvent}
      onDragLeave={() => handleDragLeave(setLayoutStore)}
      onDragOver={handleDragOverEvent}
      onDrop={handleDropEvent}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseEnter} // NOSONAR
      ref={el => {
        setReference(el);
        // @ts-expect-error ignore
        el.getBoundingClientRectOriginal = el.getBoundingClientRect.bind(el);
        el.getBoundingClientRect = () => {
          if (layoutStore?.hiddenNodes.includes(props.item.id)) {
            // @ts-expect-error ignore
            return el.getBoundingClientRectOriginal();
          }
          return getBoundingRectChildren(el);
        };
      }}
      style="display:contents;"
    >
      <Show keyed when={!layoutStore?.hiddenNodes.includes(props.item.id)}>
        {resolvedChildren()}
      </Show>
      <Show when={isSelectedLayoutId(props.item.id) || isSelectedHoverId(props.item.id) || layoutStore.multiHighlight.includes(props.item.id)}>
        <AttrConfigPopOverWrapper isSelectedLayoutId={isSelectedLayoutId(props.item.id)} item={props.item} reference={reference} />
      </Show>
      <Show keyed when={!layoutStore?.hiddenNodes.includes(props.item.id)}>
        <BorderOverlay item={props.item} reference={reference} />
      </Show>
    </div>
  );
}
