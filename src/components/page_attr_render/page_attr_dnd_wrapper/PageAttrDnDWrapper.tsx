import {
  children,
  createMemo,
  createSelector,
  createSignal,
  type JSX,
  Show,
} from "solid-js";

import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { handleDragLeave } from "~/components/page_designer/event_handler/handleDragLeave";
import { handleDragOver } from "~/components/page_designer/event_handler/handleDragOver";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getBoundingRectChildren } from "~/components/page_designer/functions/getBoundingRectChildren";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { PageLayoutObject, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { useToast } from "../../styled/Toast";
import { AttrConfigPopOverWrapper } from "./AttrConfigPopOverWrapper";
import { BorderOverlay } from "./BorderOverlay";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

interface PageAttrDnDWrapperProps {
  children: JSX.Element;
  item: Vertex;
}
export function PageAttrDnDWrapper(props: Readonly<PageAttrDnDWrapperProps>) {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  const isSelectedLayoutId = createSelector(() => layoutStore().selectedId);
  const [previewStore] = usePreviewContext();
  const isSelectedHoverId = createSelector(() => layoutStore().hoverId);
  const { showErrorToast } = useToast();

  const childrenAttrs = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.item),
  );
  const resolvedChildren = children(() => props.children);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onLayoutItemClick(layoutStoreId, props.item.id, graph, setGraph);
  };

  // no need debounde, it is called too less
  const handleMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, { hoverId: props.item.id });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, { hoverId: -1 });
  };

  // debounce is giving error, node not found when running element.currentTarget and we must need it
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStoreId,
      props.item,
      previewStore.isDesignMode,
      false,
      childrenAttrs,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex().P.formDataId!],
    );
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStoreId,
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(layoutStoreId, graph, setGraph);
  };

  return (
    <div // NOSONAR
      onClick={handleClick}
      onDragEnter={handleDragOverEvent}
      onDragLeave={() => handleDragLeave(graph, setGraph, layoutStoreId)}
      onDragOver={handleDragOverEvent}
      onDrop={handleDropEvent}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseEnter} // NOSONAR
      ref={(el) => {
        setReference(el);
        // @ts-expect-error ignore
        el.getBoundingClientRectOriginal = el.getBoundingClientRect.bind(el);
        el.getBoundingClientRect = () => {
          if (layoutStore()?.hiddenNodes.includes(props.item.id)) {
            // @ts-expect-error ignore
            return el.getBoundingClientRectOriginal();
          }
          return getBoundingRectChildren(el);
        };
      }}
      style="display:contents;"
    >
      <Show keyed when={!layoutStore()?.hiddenNodes.includes(props.item.id)}>
        {resolvedChildren()}
      </Show>
      <Show
        when={
          isSelectedLayoutId(props.item.id) ||
          isSelectedHoverId(props.item.id) ||
          layoutStore().multiHighlight.includes(props.item.id)
        }
      >
        <AttrConfigPopOverWrapper
          isSelectedLayoutId={isSelectedLayoutId(props.item.id)}
          item={props.item}
          reference={reference}
        />
      </Show>
      <Show keyed when={!layoutStore()?.hiddenNodes.includes(props.item.id)}>
        <BorderOverlay item={props.item} reference={reference} />
      </Show>
    </div>
  );
}
