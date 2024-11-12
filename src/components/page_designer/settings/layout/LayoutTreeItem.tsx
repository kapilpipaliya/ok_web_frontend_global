import { type Accessor, createMemo, createSelector, For, Show } from "solid-js";

import { generateBoxShadow } from "~/components/css_properties/utils/generate/generateBoxShadow";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { getChildrenAttrs } from "../../functions/getChildrenAttrs";
import { getDnDBoxShadowArgs } from "~/components/page_designer/functions/getDnDBoxShadowArgs";
import { useToast } from "~/components/Toast";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { handleDragOver } from "../../event_handler/handleDragOver";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { TreeItemContainer } from "./TreeItemContainer";
import { TreeItemContent } from "./TreeItemContent";

export function LayoutTreeItem(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast } = useToast();
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );

  let startTime = 0;

  // debounce is giving error, node not found
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStore,
      setLayoutStore,
      props.metaVertex,
      false,
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      layoutStore.formStore[0].formData,
      (position) => {
        if (position === "center" && Date.now() - startTime > 1000) {
          if (props.collapsedKeys().includes(props.metaVertex.id)) {
            props.toggleExpand(props.metaVertex.id);
          }
        }
      },
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
  const isAfter = createMemo(
    () => isActiveTargetItem() && layoutStore.position === "after",
  );

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (isActiveTargetItem()) {
      if (layoutStore.position !== "after") {
        const boxShadowProps = getDnDBoxShadowArgs(
          layoutStore.position,
          "green-60",
        );
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])}`;
      }
    }

    if (isSelectedLayoutId(props.metaVertex.id)) {
      boxShadow += " bg:rgb(197,221,255)";
    } else if (isSelectedHoverId(props.metaVertex.id)) {
      boxShadow += " bg:#F2EDED";
    }

    return boxShadow;
  });

  return (
    <>
      <TreeItemContainer
        class={getBorder()}
        draggable={true}
        hasChildren={!!children().length}
        isDragOver={isActiveTargetItem()}
        isHovered={isSelectedHoverId(props.metaVertex.id)}
        isSelected={isSelectedLayoutId(props.metaVertex.id)}
        onClick={handleClick}
        onDragEnter={(e) => {
          startTime = Date.now();
          handleDragOverEvent(e);
        }}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverEvent}
        onDragStart={(e) =>
          handleDragStart(e, setLayoutStore, props.metaVertex)
        }
        onDrop={handleDropEvent}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
        ref={(el) => {
          // @ts-expect-error ignore
          el.useCurrentPosition = true;
        }}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          metaVertex={props.metaVertex}
          toggleExpand={props.toggleExpand}
        />
        <Show
          when={layoutStore.formStore[0].formData.id !== props.metaVertex.id}
        >
          <AttrConfigIcons metaVertex={props.metaVertex} />
        </Show>
      </TreeItemContainer>

      <Show
        when={
          !props.collapsedKeys().includes(props.metaVertex.id) &&
          children().length > 0
        }
      >
        <ul class="pl:8 pt:5">
          <For each={children()}>
            {(vertex) => (
              <Show when={layoutStore.formStore[0]}>
                <LayoutTreeItem
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
