import {
  type Accessor,
  createMemo,
  createSelector,
  createSignal,
  For,
  Show,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/styled/modal/Toast";
import { generateBoxShadow } from "~/features/css_editor/utils/generate/generateBoxShadow";
import { handleDragStart } from "~/features/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/features/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import { getDnDBoxShadowArgs } from "~/features/page_designer/functions/drag_drop/getDnDBoxShadowArgs";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { handleDragOver } from "../../event_handler/handleDragOver";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { AttrConfigIcons } from "./AttrConfigIcons";
import { HideShowIcon } from "./HideShowIcon";
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
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const { showErrorToast } = useToast();
  const activeItemChanged = createSelector(
    () => layoutStoreVertex()?.P.activeItem,
  );
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );
  const [parentRef, setParentRef] = createSignal<HTMLElement>();

  let startTime = 0;

  // debounce is giving error, node not found
  const handleDragOverEvent = (e: DragEvent) => {
    handleDragOver(
      e,
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex,
      false,
      props.collapsedKeys,
      children,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId!],
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
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId!,
      graph,
      setGraph,
      {
        activeItem: null,
        position: null,
      },
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

  const handleClick = () => {
    onLayoutItemClick(
      layoutStoreVertex(),
      formStoreVertex(),
      props.metaVertex.id,
      graph,
      setGraph,
    );
  };

  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: props.metaVertex.id,
    });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      hoverId: -1,
    });
  };

  const isAfter = createMemo(
    () => isActiveTargetItem() && layoutStoreVertex()?.P.position === "after",
  );

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (isActiveTargetItem()) {
      if (layoutStoreVertex()?.P.position !== "after") {
        const boxShadowProps = getDnDBoxShadowArgs(
          layoutStoreVertex()?.P.position,
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
        draggable={"true"}
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
          handleDragStart(
            e,
            graph,
            setGraph,
            layoutStoreVertex(),
            props.metaVertex,
          )
        }
        onDrop={handleDropEvent}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
        ref={(el) => {
          setParentRef(el);
          // @ts-expect-error ignore
          el.useCurrentPosition = true;
        }}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          metaVertex={props.metaVertex}
          toggleExpand={props.toggleExpand}
        />
        <HideShowIcon iconSize={20} metaVertex={props.metaVertex} />
        <Show when={formStoreVertex()?.P.formDataId !== props.metaVertex.id}>
          <AttrConfigIcons
            metaVertex={props.metaVertex}
            parentRef={parentRef()!}
          />
        </Show>
      </TreeItemContainer>

      <Show
        when={
          !props.collapsedKeys().includes(props.metaVertex?.id) &&
          children().length > 0
        }
      >
        <ul class="pl:8 pt:5">
          <For each={children()}>
            {(vertex) => (
              <Show when={formStoreVertex()}>
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
