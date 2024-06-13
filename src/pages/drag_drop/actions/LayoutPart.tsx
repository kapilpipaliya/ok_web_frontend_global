import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, createSelector, For, Show, onMount } from "solid-js";
import Drawer from "~/components/Drawer";
import { GenericField } from "~/components/fields/GenericField";
import { Tooltip } from "~/components/solid_blocks";
import {
  PageConfigContext,
  HoverIdContext,
  HiddenNodesContext,
  SelectedIdContext,
  IndicatorPositionContext,
  ShowDrawerContext,
} from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { useDragDrop } from "~/lib/drag_drop/useDragDrop";
import { Properties } from "./properties/Properties";
import { evaluate } from "~/lib/expression_eval";
import jsep from "jsep";
import { iconMap } from "~/lib/constants";
import { nameExpr } from "~/pages/drag_drop/actions/utils/nameExpr";
import { getRowProps } from "~/lib/graph/get/sync/graph_functions";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function LayoutPart(props: {}) {
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
    const {
      children,
      isActiveItem,
      handleDragStart,
      handleDragEnter,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      onLayoutItemClick,
      clone,
      deleteLayout,
    } = useDragDrop(
      graph,
      setGraph,
      pageConfig.formData.txnId,
      pageConfig.formData.formData,
      props.metaVertex,
      collapsedKeys,
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

    return (
      <div>
        <div
          draggable={true}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          class={`${isSelectedLayoutId(props.metaVertex.id)
              ? "bg:rgb(197,221,255)"
              : isSelectedHoverId(props.metaVertex.id)
                ? "bg:#F2EDED"
                : ""
            } ${children().length ? "r:5|5|5|5" : "r:0|5|5|0"} ${children().length ? "box-shadow:1px|1px|1px|1px #F2EDED" : ""
            }`}
          classList={{
            "b:1px":
              isActiveItem() && indicatorPosition().position === "center",
          }}
          onClick={() => onLayoutItemClick(props.metaVertex)}
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

            "box-shadow": children().length
              ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
              : "0px",
            "border-top":
              isActiveItem() && indicatorPosition().position === "before"
                ? "2px solid green"
                : "",
            "border-bottom":
              isActiveItem() && indicatorPosition().position === "after"
                ? "2px solid green"
                : "",
            "border-left": children().length ? "" : "1px dashed black",
            "align-items": "center",
            "justify-content": "space-between",
            display: "flex",
          }}
        >
          <div style="display: flex;align-items: center;">
            &nbsp;
            <Show when={children().length}>
              <button
                class="cursor: pointer;"
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
                  onclick={clone}
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
                          deleteLayout(name);
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

  const rootChildren = () => evaluate(jsep("->Attr"), { vertexes: [pageConfig.formData?.formData], graph, setGraph }) || []
  const isFormRootVertetx = () => pageConfig.formData?.formData?.L?.[0] === "Form";
  const rootVertexes = () => {
    if (isFormRootVertetx()) {
      return rootChildren();
    }
    return pageConfig.formData?.formData ? [pageConfig.formData.formData] : [];
  }; // Starting point(s)

  return (
    <>
      <Show when={showPropertiesDrawer()}>
        <Drawer open={showPropertiesDrawer} setIsOpen={setShowPropertiesDrawer}>
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
