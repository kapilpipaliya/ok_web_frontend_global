
import { type Accessor, For, Show, createMemo, createSelector } from "solid-js";

import { useToast } from "~/components/Toast";
import { generateBoxShadow } from "~/components/css_properties/utils/generate/generateBoxShadow";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { getDnDBoxShadowArgs } from "~/components/page_designer/functions/getDnDBoxShadowArgs";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { handleDragOver } from "../../event_handler/handleDragOver";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { TreeItemContent } from "./TreeItemContent";


export function TreeItem(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>
) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();
  const {previewMeta} = usePreviewContext();
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex)
  );

  let startTime = 0;

  // debounce is giving error, node not found
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStore,
      setLayoutStore,
      props.metaVertex,
      !!previewMeta,
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      layoutStore.formData.formData,
      (position) => {
        if (position === "center" && Date.now() - startTime > 1000) {
          if (props.collapsedKeys().includes(props.metaVertex.id)) {
            props.toggleExpand(props.metaVertex.id);
          }
        }
      }
    );
  };

  const handleDragLeave = () => {
    setLayoutStore({ activeItem: null, position: null });
  };

  const handleDropEvent = async (e: DragEvent) => {
    await handleDrop(
      e,
      layoutStore,
      setLayoutStore,
      graph,
      setGraph,
      showErrorToast,
    );
    resetDragDropState(setLayoutStore);
  };

  const handleClick = () => {
    onLayoutItemClick(setLayoutStore, props.metaVertex.id, graph, setGraph);
  };

  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", props.metaVertex.id);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    setLayoutStore("hoverId", -1);
  };
  const isAfter = createMemo(() => !previewMeta && isActiveTargetItem() && layoutStore.position === "after");

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (!previewMeta) {
      if (isActiveTargetItem()) {
        if (layoutStore.position !== "after") {
          const boxShadowProps = getDnDBoxShadowArgs(layoutStore.position, "green-60");
          boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])}`;
        }
      }

      if (isSelectedLayoutId(props.metaVertex.id)) {
        boxShadow += " bg:rgb(197,221,255)";
      } else if (isSelectedHoverId(props.metaVertex.id)) {
        boxShadow += " bg:#F2EDED";
      }
    }

    return boxShadow;
  });



  return (
    <>
      <div // NOSONAR
        classList={{
          "align-items:center": true,
          "bg:#F2EDED": isSelectedHoverId(props.metaVertex.id),
          "bg:rgb(197,221,255)": isSelectedLayoutId(props.metaVertex.id),
          // little dark shadow on top,little lite shadow on bottom
          "box-shadow:rgba(0,0,0,0.2)|0.15px|-1px|5.15px|-0.9px":
            !(isActiveTargetItem()) &&
            children().length > 0,
          "display:flex": true,
          "font-size:14px": true,
          "font-weight:bold": !!children().length,
          "font-weight:normal": !children().length,
          [getBorder()]: true,
          "justify-content:space-between": true,
          "r:0|5|5|0": !children().length,
          "r:5|5|5|5": !!children().length,
          "w:100%": true,
        }}
        draggable={true}
        onClick={handleClick}
        onDragEnter={e => {
          startTime = Date.now();
          handleDragOverEvent(e)
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverEvent}
        onDragStart={(e) => handleDragStart(e, setLayoutStore, props.metaVertex)}
        onDrop={handleDropEvent}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
        ref={el => {
          // @ts-expect-error ignore
          el.useCurrentPosition = true;
        }}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          metaVertex={props.metaVertex}
          toggleExpand={props.toggleExpand}
        />
        <Show when={layoutStore.formData.formData.id !== props.metaVertex.id}>
          <AttrConfigIcons metaVertex={props.metaVertex} />
        </Show>
      </div>

      <Show
        when={
          !props.collapsedKeys().includes(props.metaVertex.id) &&
          children().length > 0
        }
      >
        <ul class="pb:5 pl:8 pt:3">
          <For each={children()}>
            {(vertex) => (
              <Show when={layoutStore.formData}>
                <TreeItem
                  collapsedKeys={props.collapsedKeys}
                  metaVertex={vertex}
                  toggleExpand={props.toggleExpand}
                />
              </Show>
            )}
          </For>
        </ul>
      </Show>
      <Show when={isAfter()}>
        <div class="b:1px|solid|green-60" />
      </Show>
    </>
  );
}
