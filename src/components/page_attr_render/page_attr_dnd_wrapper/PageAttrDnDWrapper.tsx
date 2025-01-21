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

import { PageLayoutObject, useDesignerFormIdContext, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
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
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () => graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const isSelectedLayoutId = createSelector(() => formStoreVertex()?.P.selectedId);
  const [previewStore] = usePreviewContext();
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showErrorToast } = useToast();

  const childrenAttrs = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.item),
  );
  const resolvedChildren = children(() => props.children);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onLayoutItemClick(formStoreVertex(), props.item.id, graph, setGraph);
  };

  // no need debounde, it is called too less
  const handleMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, { hoverId: props.item.id });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, { hoverId: -1 });
  };

  // debounce is giving error, node not found when running element.currentTarget and we must need it
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      props.item,
      previewStore.isDesignMode,
      false,
      childrenAttrs,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId!],
    );
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
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
          if (formStoreVertex()?.P?.hiddenNodes.includes(props.item.id)) {
            // @ts-expect-error ignore
            return el.getBoundingClientRectOriginal();
          }
          return getBoundingRectChildren(el);
        };
      }}
      style="display:contents;"
    >
      <Show keyed when={!formStoreVertex()?.P?.hiddenNodes.includes(props.item.id)}>
        {resolvedChildren()}
      </Show>
      <Show
        when={
          isSelectedLayoutId(props.item.id) ||
          isSelectedHoverId(props.item.id) ||
          formStoreVertex()?.P.multiHighlight.includes(props.item.id)
        }
      >
        <AttrConfigPopOverWrapper
          isSelectedLayoutId={isSelectedLayoutId(props.item.id)}
          item={props.item}
          reference={reference}
        />
      </Show>
      <Show keyed when={!formStoreVertex()?.P?.hiddenNodes.includes(props.item.id)}>
        <BorderOverlay item={props.item} reference={reference} />
      </Show>
    </div>
  );
}
