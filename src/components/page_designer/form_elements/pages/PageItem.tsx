import { Icon } from "@iconify-icon/solid";
import { toTitle } from "case-switcher-js";
import { createSignal, onCleanup, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { NavItem } from "../getTreeData";

import { onClickAddComponent } from "~/components/page_designer/functions/onClickAddComponent";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PageLayoutObject } from "../../context/LayoutContext";
import { IconButton } from "~/components/styled/IconButton";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function PageItem(
  props: Readonly<{
    child: NavItem;
    previewPageId: Id | null;
    setPreviewPageId: (id: Id | null) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  let menuRef: HTMLDivElement;

  const baseStyle =
    "align-items:center background-color:white border-radius:.2rem box-shadow:rgba(0,0,0,0.2)|0px|0px|5px|0px display:flex flex-direction:row gap:10px height:35px margin:5px padding:10px transition:transform|0.2s|ease-in-out,box-shadow|0.2s|ease-in-out";

  const hoverStyle =
    "background-color:#F2EDED box-shadow:4px|4px|4px cursor:move";

  const itemStyle = () =>
    hoverPageId() === props.child.id ? `${baseStyle} ${hoverStyle}` : baseStyle;

  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    if (props.previewPageId !== props.child.id) {
      props.setPreviewPageId(null);
    }
    setHoverPageId(props.child.id);
    timeoutId = setTimeout(() => {
      props.setPreviewPageId(props.child.id);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setHoverPageId(null);
  };

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, { draggedVertexIds: [] });
    clearTimeout(timeoutId);
    props.setPreviewPageId(null);
    const dataTransfer =
      selectedComponents().size > 0
        ? Array.from(selectedComponents())
        : [graph.vertexes[props.child.id]];
    mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, { draggedVertexIds: [...formStoreVertex()?.P.draggedVertexIds, ...dataTransfer.map(v => v.id)] });
    setSelectedComponents(new Set<Vertex>());
  };

  const handleDoubleClick = () => {
    mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, { draggedVertexIds: [props.child.id] });
    onClickAddComponent(
      graph,
      setGraph,
      formStoreVertex()?.P.txnId,
      graph.vertexes[formStoreVertex()?.P.draggedVertexIds[0]],
      formStoreVertex()?.P || {},
      formStoreVertex()?.P.selectedId !== -1
        ? formStoreVertex()?.P.selectedId
        : formStoreVertex()?.P.formDataId,
    );
    mergeVertexProperties<FormStoreObject>(0, layoutStore().formId!, graph, setGraph, { draggedVertexIds: [] });
  };
  const handleOpenClick = (e: MouseEvent) => {
    // Check if form with same label and dataId already exists
    const exists = layoutStore().openedFormIds.some(
      form => form.label === props.child.L[0] && form.dataId === props.child.id
    );

    if (!exists) {
      // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreId,
        graph,
        setGraph,
        {
          openedFormIds: [...layoutStore().openedFormIds, {
            formId: uuidv7(),
            label: props.child.L[0],
            dataId: props.child.id
          }]
        },
        { cloneProperties: false }
      );
    }
  };

  onCleanup(() => {
    clearTimeout(timeoutId);
  });

  return (
    <Show when={props.child.key}>
      <div // NOSONAR
        class={`relative ${itemStyle()}`}
        draggable={true}
        ondblclick={handleDoubleClick}
        onDragStart={handleDragStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={menuRef!}
      >
        <Icon height={22} icon={"iconoir:multiple-pages"} width={22} />
        <div class="font-size:14px">{toTitle(props.child.key)}</div>
        <div class="margin-left:auto">
          <IconButton
            icon="mdi:open-in-new"
            onClick={handleOpenClick}
            size={18}
          />
        </div>
        <Show when={props.previewPageId === props.child.id}>
          <DropdownMenu
            onClickOutside={() => props.setPreviewPageId(null)}
            onMouseLeave={() => props.setPreviewPageId(null)}
            parentRef={menuRef!}
          >
            {toTitle(props.child.key)} Preview
            <PageViewWrapper
              formId={props.child.id}
              isNoPermissionCheck={true}
            />
          </DropdownMenu>
        </Show>
      </div>
    </Show>
  );
}
