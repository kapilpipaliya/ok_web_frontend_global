import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, createSelector, For, Show, onMount, createMemo } from "solid-js";
import {Drawer} from "~/components/Drawer";
import { GenericField } from "~/components/fields/GenericField";
import { Tooltip } from "~/components/solid_blocks";
import {
  PageConfigContext,
  HoverIdContext,
  HiddenNodesContext,
  SelectedIdContext,
  IndicatorPositionContext,
  ShowDrawerContext,
  DraggedVertexContext,
  FormSettingsContext, SelectedCollContext, DragOverTargetIdContext, SelectedComponentContext,
  IsPreviewContext,
} from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { handleDragStart } from "~/lib/drag_drop/event_handler/handleDragStart";
import { handleDragOverAndSetDropPosition } from "~/lib/drag_drop/event_handler/handleDragOverAndSetDropPosition";
import { handleDrop } from "~/lib/drag_drop/event_handler/handleDrop";
import { clone } from "~/lib/drag_drop/event_handler/clone";
import { onLayoutItemClick } from "~/lib/drag_drop/event_handler/onLayoutItemClick";
import { resetDragDropState } from "~/lib/drag_drop/resetDragDropState";
import { Properties } from "./properties/Properties";
import { iconMap } from "~/lib/constants";

import { getRowProps } from "~/lib/graph/get/sync/graph_functions";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { nameExpr } from "./utils/nameExpr";
import {deleteLayoutGlobal} from "~/lib/drag_drop/event_handler/deleteLayoutGlobal";
import {useToast} from "~/components/Toast";

export function LayoutPart(props: {}) {
  const [formSettings, setFormSettings] = useContext(FormSettingsContext) || [];
  const [showPropertiesDrawer, setShowPropertiesDrawer] = useContext(ShowDrawerContext);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [hiddenNodes, setHiddenNodes] = useContext(HiddenNodesContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [indicatorPosition, setIndicatorPosition] = useContext(
    IndicatorPositionContext,
  );
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedHoverId = createSelector(hoverId);
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [, setSelectedColl] = useContext(SelectedCollContext);
  const [, setDragOverTargetId] = useContext(DragOverTargetIdContext);
  const [selectedComponent, setSelectedComponent] = useContext(
    SelectedComponentContext,
  );
  const { showErrorToast, showSuccessToast } = useToast()
    const [isPreview, setIsPreview] = useContext(IsPreviewContext);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  function toggleHidden(itemId: Id) {
    setHiddenNodes((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  const TreeView = (props: { metaVertex: Vertex }) => {
    const activeItemChanged = createSelector<any, Vertex>(
      indicatorPosition,
      (a, b) => a.id === b.activeItem,
    );
    const isActiveTargetItem = () => activeItemChanged(props.metaVertex);

    const children = createMemo(() =>
      getChildrenAttrs(graph, setGraph, props.metaVertex),
    );

    const getComponent: any = () =>
      getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name;

    // TODO: remove this function after testing
    onMount(() => {
      const layoutPropRows = getRowProps(
        graph,
        setGraph,
        props.metaVertex,
      );
      // console.log("adding old properties", getComponent(), layoutPropRows);
      if (Object.keys(layoutPropRows).length) {
        mergeVertexProperties(pageConfig.formData.txnId, props.metaVertex.id, graph, setGraph, layoutPropRows);
      }
    });

    let startTime = 0;
    const endTime = 0;
    const handleDragEnter = (e: DragEvent) => {
      startTime = Date.now();
      // e.stopPropagation();
      handleDragOverAndSetDropPosition(e, setIndicatorPosition, setDragOverTargetId, props.metaVertex, isPreview(), collapsedKeys, children, draggedVertex, graph, setGraph, pageConfig.formData.formData);

    };

    const handleDragOver = (e: DragEvent) => {
      e.stopPropagation();
      handleDragOverAndSetDropPosition(e, setIndicatorPosition, setDragOverTargetId, props.metaVertex, isPreview(), collapsedKeys, children, draggedVertex, graph, setGraph, pageConfig.formData.formData);

  
      const position = indicatorPosition().position;
      if (!position) {
        // Don't allow drag and drop
        return;
      }
      if (position === "center") {
        if (Date.now() - startTime > 1000) {
          if (collapsedKeys().includes(props.metaVertex.id)) {
            toggleExpand(props.metaVertex.id);
          }
        }
      }
  
      for (const vertex of draggedVertex()) {
        const fromVertex = vertex;
        const toVertexId = indicatorPosition().activeItem!;
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
            pageConfig.formData.formData,
            position,
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
      setIndicatorPosition({ activeItem: null, position: null });
      // console.log('leave',layoutVertex.id)
      // Do not uncomment this, because drag is called before on drop
      // setDraggedVertex(null);
      // resetDragDropState();
    };
    return (
      <div>
        <div
          draggable={true}
          onDragStart={(e)=>handleDragStart(e, setDraggedVertex, props.metaVertex)}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={async (e)=>{
            await handleDrop(e, draggedVertex, indicatorPosition, graph, showErrorToast, setGraph, pageConfig.formData.txnId, pageConfig.formData.formData);
            resetDragDropState(setDraggedVertex, setIndicatorPosition, setDragOverTargetId);
          }}
          class={`${isSelectedLayoutId(props.metaVertex.id)
              ? "bg:rgb(197,221,255)"
              : isSelectedHoverId(props.metaVertex.id)
                ? "bg:#F2EDED"
                : ""
            } ${children().length ? "r:5|5|5|5" : "r:0|5|5|0"}
            }`}
          classList={{
            "box-shadow:inset|0|0|0|2px|rgb(0,125,0)":
              isActiveTargetItem() && indicatorPosition().position === "center",
            "box-shadow:inset|0|8px|0|-6px|rgb(0,0,255)":
              isActiveTargetItem() && indicatorPosition().position === "before",
            "box-shadow:inset|0|-8px|0|-6px|rgb(0,0,255)":
              isActiveTargetItem() && indicatorPosition().position === "after",
            "box-shadow:1px|1px|1px|1px#F2EDED": !!children().length && !isActiveTargetItem() && !!indicatorPosition().position,
          }}
          onClick={() => {
            onLayoutItemClick(setSelectedId, setSelectedComponent, setSelectedColl, props.metaVertex, graph, setGraph);

          }}
          onMouseOver={(e) => {
            e.stopPropagation();
            setHoverId(props.metaVertex.id);
          }}
          onmouseleave={(e) => {
            e.stopPropagation();
            setHoverId(-1);
          }}
          style={{
            "font-size": "14px",
            height: "25px",
            "font-weight": children().length ? "bold" : "normal",
            "box-shadow": !(isActiveTargetItem() && indicatorPosition().position === "center") && children().length
              ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
              : undefined,
            "align-items": "center",
            "justify-content": "space-between",
            display: "flex",
          }}
        >
          <div style="display: flex;align-items: center;" class={`${!children().length ? "bl:1px|dashed|black pl:10" : ""}`}>
            &nbsp;
            <Show when={children().length}>
              <button
                class="cursor:pointer"
                style={{
                  "z-index": "1",
                }}
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
          {/* When root element, dont display icons */}
          <div class="flex ai:center mt:4">
            <Show
              when={(
                isSelectedLayoutId(props.metaVertex.id) ||
                isSelectedHoverId(props.metaVertex.id)) && isFormRootVertetx()
              }
            >
              <Tooltip content={"Properties"} nowrap>
                <Icon
                  icon={"mingcute:settings-5-line"}
                  onclick={() => setShowPropertiesDrawer(!showPropertiesDrawer())}
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
                  hiddenNodes().includes(props.metaVertex.id)
                }
              >
              <Tooltip content={"Duplicate"} nowrap>
                <Icon
                  icon={"mage:copy"}
                  height={18}
                  width={18}
                  color={"black"}
                  class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
                  onclick={e=>{
                    clone(props.metaVertex, undefined, undefined, pageConfig.formData.txnId, graph, setGraph, pageConfig.formData.formData);
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
                          deleteLayoutGlobal(selectedId, props.metaVertex, setSelectedId, setSelectedComponent, setSelectedColl, hoverId, setHoverId, graph, setGraph, pageConfig.formData.txnId, name, showSuccessToast);

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
                  content={`${!hiddenNodes().includes(props.metaVertex.id) ? "Show" : "Show"
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
                      when={!hiddenNodes().includes(props.metaVertex.id)}
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

        </div>

        <Show
          when={
            !collapsedKeys().includes(props.metaVertex.id) && children().length > 0
          }
        >
          <ul class="pl:8 pt:3 pb:5">
            <For each={children()}>
              {(vertex) => (
                <Show when={pageConfig.formData}>
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
    getChildrenAttrs(graph, setGraph, pageConfig.formData?.formData)
  );
  const isFormRootVertetx = () => pageConfig.formData?.formData?.L?.[0] === "Form";
  const rootVertexes = () => {
    if (isFormRootVertetx()) {
      return formSettings.activeStepId ? [graph.vertexes[formSettings.activeStepId]] : (steps()[0] ? [steps()[0]] : [])
    }
    return pageConfig.formData?.formData ? [pageConfig.formData.formData!] : [];
  }; // Starting point(s)

  return (
    <>
      <Show when={showPropertiesDrawer()}>
        <Drawer customButton={() => false}
          drawerStyle={'padding: 10px'} open={showPropertiesDrawer} setIsOpen={setShowPropertiesDrawer}>
          <Properties setShowDrawer={setShowPropertiesDrawer} />
        </Drawer>
      </Show>
      <For each={rootVertexes()}>
        {(item) => (
          <Show when={pageConfig.formData}>
            <TreeView metaVertex={item} />
          </Show>
        )}
      </For>
    </>
  );
}
