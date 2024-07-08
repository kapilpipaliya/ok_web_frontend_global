import { type Accessor, For, Show, createMemo, createSelector } from "solid-js";

import { useToast } from "~/components/Toast";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { validateDragOver } from "~/components/page_designer/functions/validateDragOver";
import { useIsPreview } from "~/lib/contexts";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { TreeItemContent } from "./TreeItemContent";

export function TreeItem(props: Readonly<{ collapsedKeys: Accessor<Id[]>; metaVertex: Vertex; toggleExpand: (itemId: Id) => void; }>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();
  const [isPreview] = useIsPreview();
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() => getChildrenAttrs(graph, setGraph, props.metaVertex));

  let startTime = 0;

  const handleDragEnter = (e: DragEvent) => {
    startTime = Date.now();
    handleDragOverAndSetDropPosition(
      e,
      layoutStore,
      setLayoutStore,
      props.metaVertex,
      isPreview(),
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      layoutStore.formData.formData
    );
  };

  const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    handleDragOverAndSetDropPosition(
      e,
      layoutStore,
      setLayoutStore,
      props.metaVertex,
      isPreview(),
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      layoutStore.formData.formData
    );

    const position = layoutStore.position;
    if (!position) {
      // Don't allow drag and drop
      return;
    }

    if (position === "center" && Date.now() - startTime > 1000) {
      if (props.collapsedKeys().includes(props.metaVertex.id)) {
        props.toggleExpand(props.metaVertex.id);
      }
    }

    for (const vertex of layoutStore.draggedVertices) {
      const fromVertex = vertex;
      const toVertexId = layoutStore.activeItem!;
      if (!fromVertex) {
        // Don't allow drag and drop
        return;
      }

      if (!validateDragOver(
        graph,
        setGraph,
        fromVertex,
        toVertexId,
        layoutStore.formData.formData,
        position
      )) {
        // Don't allow drag and drop
        return;
      }
    }

    // This is necessary to allow the drop action to proceed
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setLayoutStore({ activeItem: null, position: null });
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStore,
      graph,
      showErrorToast,
      setGraph,
      layoutStore.formData.txnId,
      layoutStore.formData.formData
    );
    resetDragDropState(setLayoutStore);
  };

  const handleClick = () => {
    onLayoutItemClick(setLayoutStore, props.metaVertex, graph, setGraph);
  };

  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", props.metaVertex.id);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", -1);
  };

  return (
    <div>
      <button
        classList={{
          "align-items:center": true,
          "bg:#F2EDED": isSelectedHoverId(props.metaVertex.id),
          "bg:rgb(197,221,255)": isSelectedLayoutId(props.metaVertex.id),
          "box-shadow:1px|1px|1px|1px#F2EDED": !!children().length && !isActiveTargetItem() && !!layoutStore.position,
          "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255)": isActiveTargetItem() && layoutStore.position === "after",
          "box-shadow:inset|0|0|0|2px|rgb(0,125,0)": isActiveTargetItem() && layoutStore.position === "center",
          "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255)": isActiveTargetItem() && layoutStore.position === "before",
          "box-shadow:rgba(0,0,0,0.2)|0.15px|-1px|5.15px|-0.9px": !(isActiveTargetItem() && layoutStore.position === "center") && children().length,
          "display:flex": true,
          "font-size:14px": true,
          "font-weight:bold": !!children().length,
          "font-weight:normal": !children().length,
          "height:25px": true,
          "justify-content:space-between": true,
          "r:0|5|5|0": !children().length,
          "r:5|5|5|5": !!children().length,
          "w:100%": true
        }}
        draggable={true}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDragStart={(e) => handleDragStart(e, setLayoutStore, props.metaVertex)}
        onDrop={handleDropEvent}
        onMouseOver={handleMouseOver}
        onmouseleave={handleMouseLeave}
        type="button"
      >
        <TreeItemContent collapsedKeys={props.collapsedKeys} metaVertex={props.metaVertex} toggleExpand={props.toggleExpand} />
        <Show when={layoutStore.formData.formData.id !== props.metaVertex.id}>
          <AttrConfigIcons metaVertex={props.metaVertex} />
        </Show>
      </button>

      <Show
        when={!props.collapsedKeys().includes(props.metaVertex.id) &&
          children().length > 0}
      >
        <ul class="pb:5 pl:8 pt:3">
          <For each={children()}>
            {(vertex) => (
              <Show when={layoutStore.formData}>
                <TreeItem collapsedKeys={props.collapsedKeys} metaVertex={vertex} toggleExpand={props.toggleExpand} />
              </Show>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
