import { Icon } from "@iconify-icon/solid";
import { Accessor, For, Show, createMemo, createSelector, onMount, useContext } from "solid-js";

import { useToast } from "~/components/Toast";
import { GenericField } from "~/components/fields/GenericField";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { Tooltip } from "~/components/solid_blocks";
import { iconMap } from "~/lib/constants";
import { IsPreviewContext } from "~/lib/contexts";
import { cloneLayoutAndChildren } from "~/lib/drag_drop/cloneLayoutAndChildren";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getRowProps } from "~/lib/graph/get/sync/getProps";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { useDesignerLayoutStore } from "../LayoutContext";
import { nameExpr } from "./utils/nameExpr";

export function TreeItem(props: Readonly<{ collapsedKeys: Accessor<Id[]>; metaVertex: Vertex; toggleExpand: (itemId: Id) => void; }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast, showSuccessToast } = useToast();
  const [isPreview] = useContext(IsPreviewContext);
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);
  function toggleHidden(itemId: Id) {
    setLayoutStore("hiddenNodes", (prev) => prev.includes(itemId)
      ? prev.filter((item) => item !== itemId)
      : [...prev, itemId]
    );
  }
  const children = createMemo(() => getChildrenAttrs(graph, setGraph, props.metaVertex)
  );
  const getComponent = () => getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name as string;

  // TODO: remove this function after testing
  onMount(() => {
    const layoutPropRows = getRowProps(graph, setGraph, props.metaVertex);
    if (Object.keys(layoutPropRows).length) {
      mergeVertexProperties(
        layoutStore.formData.txnId,
        props.metaVertex.id,
        graph,
        setGraph,
        layoutPropRows
      );
    }
  });

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

  const handleDragLeave = (e: DragEvent) => {
    // e.stopPropagation();
    setLayoutStore({ activeItem: null, position: null });
    // console.log('leave',layoutVertex.id)
    // Do not uncomment this, because drag is called before on drop
    // setDraggedVertex(null);
    // resetDragDropState();
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

  const SelectedAttrConfigIcons = () => {
    return <div class="flex ai:center mt:4">
      <Show
        when={(isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id))}
      >
        <Tooltip content={"Properties"} nowrap>
          <Icon
            class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
            height={22}
            icon={"mingcute:settings-5-line"}
            onclick={() => setLayoutStore("showPropertiesDrawer", !layoutStore.showPropertiesDrawer)}
            width={22} />
        </Tooltip>
      </Show>

      {/* <Show when={!rootVertexes().includes(props.metaVertex)}> */}
      <Show
        when={isSelectedLayoutId(props.metaVertex.id) ||
          isSelectedHoverId(props.metaVertex.id) ||
          layoutStore.hiddenNodes.includes(props.metaVertex.id)}
      >
        <Tooltip content={"Duplicate"} nowrap>
          <Icon
            class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
            color={"black"}
            height={18}
            icon={"mage:copy"}
            onclick={(e) => {
              cloneLayoutAndChildren(
                props.metaVertex,
                undefined,
                undefined,
                layoutStore.formData.txnId,
                graph,
                setGraph,
                layoutStore.formData.formData
              );
            }}
            width={18} />
        </Tooltip>
        <Tooltip content={"Delete"} nowrap>
          <GenericField
            meta={{
              P: {
                class: "cursor:pointer  mr:5px opacity:.5 opacity:1:hover",
                component: "Icon",
                height: 18,
                icon: "mage:trash",
                onClick: () => {
                  const name = getComponent();
                  deleteLayoutAttr(
                    layoutStore,
                    setLayoutStore,
                    props.metaVertex,
                    graph,
                    setGraph,
                    layoutStore.formData.txnId,
                    name,
                    showSuccessToast
                  );
                },
                style: { color: "red" },
                width: 18,
              },
            } as any} />
        </Tooltip>

        <Tooltip
          content={`${!layoutStore.hiddenNodes.includes(props.metaVertex.id)
            ? "Hide"
            : "Show"}`}
          nowrap
        >
          <button
            class="opacity:.5 opacity:1:hover"
            onClick={(e) => {
              e.stopPropagation();
              toggleHidden(props.metaVertex.id);
            }}
          >
            <Show
              fallback={<Icon
                class="transition: 0.5s ease-in-out;"
                height={18}
                icon="mdi:eye-off-outline"
                width={18} />}
              when={!layoutStore.hiddenNodes.includes(props.metaVertex.id)}
            >
              <Icon
                class="transition: 0.5s ease-in-out;"
                height={18}
                icon="mdi:eye-outline"
                width={18} />
            </Show>
          </button>
        </Tooltip>
        &nbsp;
      </Show>
      {/* </Show> */}
    </div>;
  };

  return (
    <div>
      <button
        classList={{
          "bg:#F2EDED": isSelectedHoverId(props.metaVertex.id),
          "bg:rgb(197,221,255)": isSelectedLayoutId(props.metaVertex.id),
          "box-shadow:1px|1px|1px|1px#F2EDED": !!children().length && !isActiveTargetItem() && !!layoutStore.position,
          "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255)": isActiveTargetItem() && layoutStore.position === "after",
          "box-shadow:inset|0|0|0|2px|rgb(0,125,0)": isActiveTargetItem() && layoutStore.position === "center",
          "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255)": isActiveTargetItem() && layoutStore.position === "before",
          "r:0|5|5|0": !children().length,
          "r:5|5|5|5": !!children().length,
          "w:100%": true,
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
        style={{
          "align-items": "center",
          "box-shadow": !(isActiveTargetItem() && layoutStore.position === "center") &&
            children().length
            ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
            : undefined,
          display: "flex",
          "font-size": "14px",
          "font-weight": children().length ? "bold" : "normal",
          height: "25px",
          "justify-content": "space-between",
        }}
        type="button"
      >
        <div
          class={`${!children().length ? "bl:1px|dashed|black pl:10" : ""}`}
          style="display: flex;align-items: center;"
        >
          &nbsp;
          <Show when={children().length}>
            <button
              class="cursor:pointer"
              onClick={(e) => {
                e.stopPropagation();
                props.toggleExpand(props.metaVertex.id);
              }}

            >
              <Icon
                class={"transform 2s ease-in-out"}
                icon="mingcute:down-fill"
                style={{
                  "margin-top": "7px",
                  transform: `${props.collapsedKeys().includes(props.metaVertex.id)
                    ? "rotate(0deg)"
                    : "rotate(180deg)"}`,
                  transition: "transform 0.2s linear",
                }} />
            </button>
          </Show>
          &nbsp;
          <Icon
            height={17}
            icon={iconMap[getComponent()] ??
              "material-symbols:widgets-outline-rounded"}
            width={17} />
          &nbsp;&nbsp;
          {nameExpr(props.metaVertex, graph) || props.metaVertex.P.name}
        </div>
        <SelectedAttrConfigIcons />
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
