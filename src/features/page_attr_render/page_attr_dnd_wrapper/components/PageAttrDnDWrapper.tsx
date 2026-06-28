import {
  children,
  createMemo,
  createSelector,
  createSignal,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useToast } from "~/components/styled/modal/Toast";
import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { attachPreviewDropTarget } from "~/features/page_designer/functions/drag_drop/pragmatic/pragmaticDragDrop";
import {
  bindDragDropRef,
  cleanupDragDropRef,
} from "~/features/page_designer/functions/drag_drop/pragmatic/bindDragDropRef";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { getBoundingRectChildren } from "~/features/page_designer/functions/drag_drop/ui/getBoundingRectChildren";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import {
  clearDesignerHoverFromPreview,
  setDesignerHover,
} from "~/features/page_designer/functions/layout/designerHoverCoordinator";
import {
  isLayoutPreviewHover,
  schedulePreviewHoverClear,
} from "~/features/page_designer/functions/layout/previewHover";

import { BorderOverlay } from "../overlays/BorderOverlay";
import { AttrConfigPopOverWrapper } from "../popovers/AttrConfigPopOverWrapper";
import { useDataContext } from "../../context/DataContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface PageAttrDnDWrapperProps {
  children: JSX.Element;
  item: Vertex;
}

export function PageAttrDnDWrapper(props: Readonly<PageAttrDnDWrapperProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const [previewStore] = usePreviewContext();
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const isPreviewHoverId = () =>
    isLayoutPreviewHover(layoutStoreVertex()?.P, props.item.id);
  const isHoveredItem = () =>
    isSelectedHoverId(props.item.id) || isPreviewHoverId();
  const { showErrorToast } = useToast();

  const childrenAttrs = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.item),
  );
  const resolvedChildren = children(() => props.children);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const contextData = useDataContext() || {};

  const bindPreviewDrop = bindDragDropRef(
    `preview-drop-${props.item.id}`,
    (element) =>
      attachPreviewDropTarget(element, {
        layoutStoreVertex,
        formStoreVertex,
        layoutVertex: props.item,
        graph,
        setGraph,
        isDesignMode: previewStore.isDesignMode,
        collapsedKeys: false,
        children: childrenAttrs,
        showErrorToast,
        // Mouse events don't fire during pragmatic drag — set hover from drop target.
        onDragEnter: () => {
          setDesignerHover(
            formStoreId!,
            layoutStoreId,
            props.item.id,
            "preview",
            graph,
            setGraph,
          );
        },
        onDragLeave: () => {
          schedulePreviewHoverClear(
            layoutStoreId,
            formStoreId!,
            graph,
            setGraph,
          );
        },
      }),
  );

  onCleanup(() => {
    cleanupDragDropRef(reference() ?? undefined);
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      props.item.id,
      graph,
      setGraph,
      contextData.index,
      "preview",
    );
  };

  const handleMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();
    setDesignerHover(
      formStoreId!,
      layoutStoreId,
      props.item.id,
      "preview",
      graph,
      setGraph,
    );
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    clearDesignerHoverFromPreview(
      formStoreId!,
      layoutStoreId,
      graph,
      setGraph,
    );
  };

  return (
    <div // NOSONAR
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseEnter} // NOSONAR
      ref={(el) => {
        setReference(el);
        bindPreviewDrop(el);
        // display:contents has no box; aggregate child bounds for hit-testing.
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
      <Show
        keyed
        when={!formStoreVertex()?.P?.hiddenNodes.includes(props.item.id)}
      >
        {resolvedChildren()}
      </Show>
      <Show
        when={
          isSelectedLayoutId(props.item.id) ||
          isHoveredItem() ||
          formStoreVertex()?.P.multiHighlight.includes(props.item.id)
        }
      >
        <AttrConfigPopOverWrapper
          isSelectedLayoutId={
            isSelectedLayoutId(props.item.id) &&
            (formStoreVertex()?.P.selectedIndex === contextData.index ||
              formStoreVertex()?.P.selectedIndex === -1)
          }
          item={props.item}
          reference={reference}
        />
      </Show>
      <Show
        keyed
        when={!formStoreVertex()?.P?.hiddenNodes.includes(props.item.id)}
      >
        <BorderOverlay item={props.item} reference={reference} />
      </Show>
    </div>
  );
}

export default PageAttrDnDWrapper;
