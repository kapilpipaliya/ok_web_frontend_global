import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, createSelector, For, Show, onMount, createMemo, type Setter } from "solid-js";
import { Drawer } from "~/components/Drawer";
import { GenericField } from "~/components/fields/GenericField";
import { Tooltip } from "~/components/solid_blocks";
import { IsPreviewContext } from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { handleDragStart } from "~/components/page_designer/event_handler/handleDragStart";
import { handleDragOverAndSetDropPosition } from "~/components/page_designer/event_handler/handleDragOverAndSetDropPosition";
import { handleDrop } from "~/components/page_designer/event_handler/handleDrop";
import { cloneLayoutAndChildren } from "~/lib/drag_drop/cloneLayoutAndChildren";
import { onLayoutItemClick } from "~/components/page_designer/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { Properties } from "./properties/Properties";
import { iconMap } from "~/lib/constants";
import { getRowProps } from "~/lib/graph/get/sync/getProps";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { nameExpr } from "./utils/nameExpr";
import { deleteLayoutAttr } from "~/components/page_designer/event_handler/deleteLayoutAttr";
import { useToast } from "~/components/Toast";
import { useDesignerLayoutStore } from "../LayoutContext";

export function LayoutTree() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const { showErrorToast, showSuccessToast } = useToast();
  const [isPreview] = useContext(IsPreviewContext);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId]
    );
  }

  function toggleHidden(itemId: Id) {
    setLayoutStore("hiddenNodes", (prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId]
    );
  }

  const TreeView = (props: Readonly<{ metaVertex: Vertex }>) => {
    const activeItemChanged = createSelector(() => layoutStore.activeItem);
    const isActiveTargetItem = () => activeItemChanged(props.metaVertex.id);
    const children = createMemo(() =>
      getChildrenAttrs(graph, setGraph, props.metaVertex)
    );
    const getComponent: any = () =>
      getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name;

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
        collapsedKeys,
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
        collapsedKeys,
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
        if (collapsedKeys().includes(props.metaVertex.id)) {
          toggleExpand(props.metaVertex.id);
        }
      }

      for (const vertex of layoutStore.draggedVertices) {
        const fromVertex = vertex;
        const toVertexId = layoutStore.activeItem!;
        if (!fromVertex) {
          // Don't allow drag and drop
          return;
        }
  
        if (
          !validateDragOver(
            graph,
            setGraph,
            fromVertex,
            toVertexId,
            layoutStore.formData.formData,
            position
          )
        ) {
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
          when={
            (isSelectedLayoutId(props.metaVertex.id) ||
              isSelectedHoverId(props.metaVertex.id)) && isFormRootVertetx()
          }
        >
          <Tooltip content={"Properties"} nowrap>
            <Icon
              icon={"mingcute:settings-5-line"}
              onclick={() =>
                setLayoutStore("showPropertiesDrawer", !layoutStore.showPropertiesDrawer)
              }
              height={22}
              width={22}
              class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
            />
          </Tooltip>
        </Show>

        <Show when={!rootVertexes().includes(props.metaVertex)}>
          <Show
            when={
              isSelectedLayoutId(props.metaVertex.id) ||
              isSelectedHoverId(props.metaVertex.id) ||
              layoutStore.hiddenNodes.includes(props.metaVertex.id)
            }
          >
            <Tooltip content={"Duplicate"} nowrap>
              <Icon
                icon={"mage:copy"}
                height={18}
                width={18}
                color={"black"}
                class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
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
              />
            </Tooltip>
            <Tooltip content={"Delete"} nowrap>
              <GenericField
                meta={
                  {
                    P: {
                      component: "Icon",
                      style: { color: "red" },
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
                      width: 18,
                      height: 18,
                      class:
                        "cursor:pointer  mr:5px opacity:.5 opacity:1:hover",
                      icon: "mage:trash",
                    },
                  } as any
                }
              />
            </Tooltip>

            <Tooltip
              content={`${
                !layoutStore.hiddenNodes.includes(props.metaVertex.id)
                  ? "Show"
                  : "Show"
              }`}
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
                  when={!layoutStore.hiddenNodes.includes(props.metaVertex.id)}
                  fallback={
                    <Icon
                      height={18}
                      width={18}
                      icon="mdi:eye-off-outline"
                      class="transition: 0.5s ease-in-out;"
                    />
                  }
                >
                  <Icon
                    height={18}
                    width={18}
                    icon="mdi:eye-outline"
                    class="transition: 0.5s ease-in-out;"
                  />
                </Show>
              </button>
            </Tooltip>
            &nbsp;
          </Show>
        </Show>
      </div>
    }

    return (
      <div>
        <button
          type="button"
          draggable={true}
          onDragStart={(e) =>
            handleDragStart(e, setLayoutStore, props.metaVertex)
          }
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
          class={`${isSelectedLayoutId(props.metaVertex.id)
              ? "bg:rgb(197,221,255)"
              : isSelectedHoverId(props.metaVertex.id)
                ? "bg:#F2EDED"
                : ""
            } ${children().length ? "r:5|5|5|5" : "r:0|5|5|0"
            }`}
          classList={{
            "box-shadow:inset|0|0|0|2px|rgb(0,125,0)":
              isActiveTargetItem() && layoutStore.position === "center",
            "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255)":
              isActiveTargetItem() && layoutStore.position === "before",
            "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255)":
              isActiveTargetItem() && layoutStore.position === "after",
            "box-shadow:1px|1px|1px|1px#F2EDED":
              !!children().length && !isActiveTargetItem() && !!layoutStore.position,
          }}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onmouseleave={handleMouseLeave}
          style={{
            "font-size": "14px",
            height: "25px",
            "font-weight": children().length ? "bold" : "normal",
            "box-shadow":
              !(isActiveTargetItem() && layoutStore.position === "center") &&
                children().length
                ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
                : undefined,
            "align-items": "center",
            "justify-content": "space-between",
            display: "flex",
          }}
        >
          <div
            style="display: flex;align-items: center;"
            class={`${!children().length ? "bl:1px|dashed|black pl:10" : ""}`}
          >
            &nbsp;
            <Show when={children().length}>
              <button
                class="cursor:pointer"
                style={{ "z-index": "1" }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(props.metaVertex.id);
                }}
              >
                <Icon
                  icon="mingcute:down-fill"
                  class={"transform 2s ease-in-out"}
                  style={{
                    transition: "transform 0.2s linear",
                    "margin-top": "7px",
                    transform: `${collapsedKeys().includes(props.metaVertex.id)
                        ? "rotate(0deg)"
                        : "rotate(180deg)"
                      }`,
                  }}
                />
              </button>
            </Show>
            &nbsp;
            <Icon
              icon={
                iconMap[getComponent()] ??
                "material-symbols:widgets-outline-rounded"
              }
              width={17}
              height={17}
            />
            &nbsp;&nbsp;
            {nameExpr(props.metaVertex, graph) || props.metaVertex.P.name}
          </div>
          <SelectedAttrConfigIcons/>
        </button>

        <Show
          when={
            !collapsedKeys().includes(props.metaVertex.id) &&
            children().length > 0
          }
        >
          <ul class="pl:8 pt:3 pb:5">
            <For each={children()}>
              {(vertex) => (
                <Show when={layoutStore.formData}>
                  <TreeView metaVertex={vertex} />
                </Show>
              )}
            </For>
          </ul>
        </Show>
      </div>
    );
  };

  const steps = createMemo<Vertex[]>(() =>
    getChildrenAttrs(graph, setGraph, layoutStore.formData?.formData)
  );

  const isFormRootVertetx = () =>
    layoutStore.formData?.formData?.L?.[0] === "Form";

  const rootVertexes = () => {
    if (isFormRootVertetx()) {
      return layoutStore.activeStepId
        ? [graph.vertexes[layoutStore.activeStepId]]
        : steps()[0]
          ? [steps()[0]]
          : [];
    }
    return layoutStore.formData?.formData
      ? [layoutStore.formData.formData]
      : [];
  };

  return (
    <>
      <Show when={layoutStore.showPropertiesDrawer}>
        <Drawer
          customButton={() => false}
          drawerStyle={"padding: 10px"}
          open={() => layoutStore.showPropertiesDrawer}
          setIsOpen={((v: boolean) =>
            setLayoutStore("showPropertiesDrawer", v)) as Setter<boolean>}
        >
          <Properties />
        </Drawer>
      </Show>
      <For each={rootVertexes()}>
        {(item) => (
          <Show when={layoutStore.formData}>
            <TreeView metaVertex={item} />
          </Show>
        )}
      </For>
    </>
  );
}
