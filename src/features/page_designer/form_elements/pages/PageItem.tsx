import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { toTitle } from "case-switcher-js";
import { createSignal, onCleanup, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { openInNewInternalTab } from "~/features/page_designer/form_elements/pages/openInNewInternalTab";
import { onClickAddComponent } from "~/features/page_designer/functions/onClickAddComponent";
import {
  type GraphInterface,
  type Id,
  useGraph,
  type Vertex,
} from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import type { NavItem } from "../getTreeData";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { PreviewIsolated } from "./PreviewIsolated";

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
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  const formStoreVertex = () =>
    graph.vertexes[layoutStoreVertex()?.P.formId!] as Vertex<FormStoreObject>;

  let menuRef: HTMLDivElement;

  const baseStyle =
    "align-items:center bg:white border-radius:.2rem box-shadow:rgba(0,0,0,0.2)|0px|0px|5px|0px display:flex flex-direction:row gap:10px height:35px margin:5px padding:10px transition:transform|0.2s|ease-in-out,box-shadow|0.2s|ease-in-out";

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
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      { draggedVertexIds: [] },
    );
    clearTimeout(timeoutId);
    props.setPreviewPageId(null);
    const dataTransfer =
      selectedComponents().size > 0
        ? Array.from(selectedComponents())
        : [graph.vertexes[props.child.id]];
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        draggedVertexIds: [
          ...layoutStoreVertex()?.P.draggedVertexIds,
          ...dataTransfer.map((v) => v.id),
        ],
      },
    );
    setSelectedComponents(new Set<Vertex>());
  };

  const handleDoubleClick = () => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      { draggedVertexIds: [props.child.id] },
    );
    onClickAddComponent(
      graph,
      setGraph,
      formStoreVertex()?.P.txnId,
      graph.vertexes[layoutStoreVertex()?.P.draggedVertexIds[0]],
      graph.vertexes[formStoreVertex()?.P.formDataId],
      formStoreVertex()?.P.selectedId !== -1
        ? formStoreVertex()?.P.selectedId
        : formStoreVertex()?.P.formDataId,
    );
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      { draggedVertexIds: [] },
    );
  };

  const openInNewInternalTabClick = () => {
    openInNewInternalTab(
      layoutStoreId,
      graph.vertexes[props.child.id],
      graph,
      setGraph,
    );
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
        <Icon
          height={22}
          icon={"iconoir:multiple-pages"}
          noobserver
          width={22}
        />
        <div class="font-size:14px">{toTitle(props.child.key)}</div>
        <div class="margin-left:auto">
          <IconButton
            icon="mdi:open-in-new"
            onClick={openInNewInternalTabClick}
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
            <PreviewIsolated
              formId={props.child.id}
              graph={props.previewGraph}
              setGraph={props.setPreviewGraph}
            />
          </DropdownMenu>
        </Show>
      </div>
    </Show>
  );
}
