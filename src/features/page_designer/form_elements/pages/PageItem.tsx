import { toTitle } from "case-switcher-js";
import { createSignal, onCleanup, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { onClickAddComponent } from "~/features/page_designer/functions/component/onClickAddComponent";

import type { NavItem } from "../functions/getTreeData";
import {
  baseItemStyle,
  buttonStyle,
  createOpenInNewTab,
} from "../common/ItemStyles";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { attachPalettePageDraggable } from "../../functions/drag_drop/pragmatic/pragmaticDragDrop";
import {
  bindDragDropRef,
  cleanupDragDropRef,
} from "../../functions/drag_drop/pragmatic/bindDragDropRef";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { Icon } from "@iconify-icon/solid";
import { ComponentPreview } from "../components/ComponentPreview";

export function PageItem(
  props: Readonly<{
    child: NavItem;
    previewPageId: Id | null;
    setPreviewPageId: (id: Id | null) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPreviewOpen, setIsPreviewOpen] = createSignal(false);
  const [isMouseOverItem, setIsMouseOverItem] = createSignal(false);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  const formStoreVertex = () => {
    const formId = layoutStoreVertex()?.P.formId;
    return formId
      ? (graph.vertexes[formId] as Vertex<FormStoreObject>)
      : undefined;
  };

  const handleItemMouseEnter = () => {
    setIsHovered(true);
    setIsMouseOverItem(true);
  };

  const handleItemMouseLeave = () => {
    setIsMouseOverItem(false);
    // Only change hover state if preview is not open
    if (!isPreviewOpen()) {
      setIsHovered(false);
    }
  };

  const handlePreviewOpen = () => {
    setIsPreviewOpen(true);
    // Ensure item stays in hovered state
    setIsHovered(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);

    // Only reset hover state if mouse is not over the item
    if (!isMouseOverItem()) {
      setIsHovered(false);
    }
  };

  // Get item style
  const getItemStyle = () => {
    return baseItemStyle;
  };

  const [itemRef, setItemRef] = createSignal<HTMLDivElement>();

  const bindPaletteDrag = bindDragDropRef(
    `palette-page-${props.child.id}`,
    (element) =>
      attachPalettePageDraggable(element, {
        graph,
        vertexId: props.child.id,
        getSelectedVertices: () => Array.from(selectedComponents()),
        clearSelectedVertices: () => setSelectedComponents(new Set<Vertex>()),
      }),
  );

  onCleanup(() => {
    cleanupDragDropRef(itemRef());
  });

  const handleDoubleClick = () => {
    const formStore = formStoreVertex();
    if (!formStore) {
      return;
    }

    onClickAddComponent(
      graph,
      setGraph,
      formStore.P.txnId,
      graph.vertexes[props.child.id],
      graph.vertexes[formStore.P.formDataId],
      formStore.P.selectedId === -1
        ? formStore.P.formDataId
        : formStore.P.selectedId,
    );
  };

  // Use shared function to create open in new tab handler
  const openInNewInternalTabClick = createOpenInNewTab(
    layoutStoreId,
    graph.vertexes[props.child.id],
    graph,
    setGraph,
  );

  // Should show buttons if item is hovered or preview is open
  const shouldShowButtons = () => isHovered() || isPreviewOpen();

  return (
    <Show when={props.child.key}>
      <As
        as="div"
        css={getItemStyle()}
        ondblclick={handleDoubleClick}
        onMouseEnter={handleItemMouseEnter}
        onMouseLeave={handleItemMouseLeave}
        ref={(element) => {
          setItemRef(element);
          bindPaletteDrag(element);
        }}
      >
        <Show when={props.child.P.icon}>
          <Icon height={20} icon={props.child.P.icon} noobserver width={20} />
        </Show>
        <As as="div" css={"return `._id {font-size: 14px;}`;"}>
          {toTitle(props.child.key)}
        </As>
        <Show when={shouldShowButtons()}>
          <As
            as="div"
            css={"return `._id {margin-left: auto; display: flex;}`;"}
          >
            <ComponentPreview
              item={props.child}
              onPreviewOpen={handlePreviewOpen}
              onPreviewClose={handlePreviewClose}
            />
            <IconButton
              css={buttonStyle}
              icon="ph:arrow-square-out"
              onClick={openInNewInternalTabClick}
              size={18}
              title="Open in new tab"
            />
          </As>
        </Show>
      </As>
    </Show>
  );
}
