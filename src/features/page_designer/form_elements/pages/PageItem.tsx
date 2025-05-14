import type { SetStoreFunction } from "solid-js/store";

import { toTitle } from "case-switcher-js";
import { createSignal, onCleanup, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { onClickAddComponent } from "~/features/page_designer/functions/component/onClickAddComponent";

import type { NavItem } from "../functions/getTreeData";
import {
  baseItemStyle,
  hoverItemStyle,
  buttonStyle,
  setupPreview,
  createOpenInNewTab,
} from "../common/ItemStyles";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { PreviewIsolated } from "./PreviewIsolated";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { Icon } from "@iconify-icon/solid";

export function PageItem(
  props: Readonly<{
    child: NavItem;
    previewGraph: GraphInterface;
    previewPageId: Id | null;
    setPreviewGraph: SetStoreFunction<GraphInterface>;
    setPreviewPageId: (id: Id | null) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  const formStoreVertex = () => {
    const formId = layoutStoreVertex()?.P.formId;
    return formId
      ? (graph.vertexes[formId] as Vertex<FormStoreObject>)
      : undefined;
  };

  let menuRef: HTMLDivElement | undefined;

  // Use shared preview setup with function for props
  const { handleMouseEnter, handleMouseLeave, previewTimer } = setupPreview(
    () => ({
      previewPageId: props.previewPageId,
      setPreviewPageId: props.setPreviewPageId,
      itemId: props.child.id,
    }),
    {
      setHoverPageId,
      setIsHovered,
    },
  );

  // Get combined item style
  const getItemStyle = () => {
    const baseStyle = baseItemStyle;
    return hoverPageId() === props.child.id
      ? `${baseStyle} ${hoverItemStyle}`
      : baseStyle;
  };

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [],
    });
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    props.setPreviewPageId(null);
    const dataTransfer =
      selectedComponents().size > 0
        ? Array.from(selectedComponents())
        : [graph.vertexes[props.child.id]];

    // Safely access draggedVertexIds
    const currentDraggedIds = layoutStoreVertex()?.P.draggedVertexIds || [];

    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [
        ...currentDraggedIds,
        ...dataTransfer.map((v) => v.id),
      ],
    });
    setSelectedComponents(new Set<Vertex>());
  };

  const handleDoubleClick = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [props.child.id],
    });

    const formStore = formStoreVertex();
    if (!formStore) return;

    // Safe access to properties
    const draggedVertex = layoutStoreVertex()?.P.draggedVertexIds?.[0];
    if (!draggedVertex) return;

    onClickAddComponent(
      graph,
      setGraph,
      formStore.P.txnId,
      graph.vertexes[draggedVertex],
      graph.vertexes[formStore.P.formDataId],
      formStore.P.selectedId !== -1
        ? formStore.P.selectedId
        : formStore.P.formDataId,
    );
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      draggedVertexIds: [],
    });
  };

  // Use shared function to create open in new tab handler
  const openInNewInternalTabClick = createOpenInNewTab(
    layoutStoreId,
    graph.vertexes[props.child.id],
    graph,
    setGraph,
  );

  onCleanup(() => {
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
  });

  return (
    <Show when={props.child.key}>
      <As
        as="div"
        css={getItemStyle()}
        draggable={"true"}
        ondblclick={handleDoubleClick}
        onDragStart={handleDragStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={(e) => handleMouseLeave(e)}
        ref={(el) => (menuRef = el)}
      >
        <Show when={props.child.P.icon}>
          <Icon height={20} icon={props.child.P.icon} noobserver width={20} />
        </Show>
        <As as="div" css={css`font-size: 14px;`}>
          {toTitle(props.child.key)}
        </As>
        <Show when={isHovered()}>
          <As as="div" css={css`margin-left: auto;`}>
            <IconButton
              css={buttonStyle}
              icon="ph:arrow-square-out"
              onClick={openInNewInternalTabClick}
              size={18}
              title="Open in new tab"
            />
          </As>
        </Show>
        <Show when={props.previewPageId === props.child.id && menuRef}>
          <DropdownMenu
            onClickOutside={() => props.setPreviewPageId(null)}
            onMouseLeave={() => props.setPreviewPageId(null)}
            parentRef={menuRef as HTMLElement}
          >
            {toTitle(props.child.key)} Preview
            <PreviewIsolated
              // TODO FIX THIS
              item={props.child}
              graph={props.previewGraph}
              setGraph={props.setPreviewGraph}
            />
          </DropdownMenu>
        </Show>
      </As>
    </Show>
  );
}
