import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, createSelector, For, Show } from "solid-js";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import { Tooltip } from "~/components/solid-blocks/blocks";
import { iconMap, nameExpr } from "~/lib/Utils";
import {
  PageConfigContext,
  HoverIdContext,
  HiddenNodesContext,
  SelectedIdContext,
  IndicatorPositionContext,
} from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, Id, Vertex } from "~/lib/graph/graph";
import { useDragDrop } from "~/lib/pageStore";

export function LayoutPart(props: {}) {
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

  function toggleExpand(itemId: number) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  function toggleHidden(itemId: number) {
    setHiddenNodes((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  const TreeView = (props: { vertex: Vertex }) => {
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
      props.vertex,
      collapsedKeys,
    );
    const getComponent: any = async () =>
      getChildVertex(graph, ["$0Comp"], props.vertex).vertex?.P.name;

    return (
      <div>
        <div
          draggable={true}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          class={`${
            isSelectedLayoutId(props.vertex.id)
              ? "bg:rgb(197,221,255)"
              : isSelectedHoverId(props.vertex.id)
                ? "bg:#F2EDED"
                : ""
          } ${children().length ? "r:5|5|5|5" : "r:0|5|5|0"} ${children().length ? "box-shadow:1px|1px|1px|1px #F2EDED" : ""}`}

          classList={{
            "b:1px":
              isActiveItem() && indicatorPosition().position === "center",
          }}
          onClick={onLayoutItemClick}
          onMouseOver={(e) => {
            e.stopPropagation();
            setHoverId(props.vertex.id);
          }}
          onmouseleave={(e) => {
            e.stopPropagation();
            setHoverId(-1);
          }}
          style={{
            'font-size': '14px',
            "font-weight": children().length ? "bold" : "normal",
            "margin-bottom":
              children().length ||
              !(isActiveItem() && indicatorPosition().position === "after")
                ? "0px"
                : "10px",
            "box-shadow": children().length
              ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
              : "0px",
            "margin-top":
              isActiveItem() && indicatorPosition().position === "before"
                ? "10px"
                : "",
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

                  toggleExpand(props.vertex.id);
                }}
              >
                <Icon
                  icon="mingcute:down-fill"
                  class={"transform 2s ease-in-out"}
                  style={{
                    transition: "transform 0.2s linear",
                    "margin-top": "7px",
                    transform: `${
                      collapsedKeys().includes(props.vertex.id)
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
            {nameExpr(props.vertex, graph) || props.vertex.P.name}
          </div>
          <Show when={pageConfig.formData.formData.id !== props.vertex.id}>
            <div>
              <Show
                when={
                  isSelectedLayoutId(props.vertex.id) ||
                  isSelectedHoverId(props.vertex.id)
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
                          props: {
                            style: { color: "red" },
                            onClick: () => deleteLayout(getComponent()),
                            width: 18,
                            height: 18,
                            class:
                              "cursor:pointer  mr:5px opacity:.5 opacity:1:hover",
                            icon: "mage:trash",
                          },
                        },
                      } as any
                    }
                  />
                </Tooltip>
              </Show>
              <Show
                when={
                  isSelectedLayoutId(props.vertex.id) ||
                  isSelectedHoverId(props.vertex.id) ||
                  hiddenNodes().includes(props.vertex.id)
                }
              >
                <Tooltip
                  content={`${!hiddenNodes().includes(props.vertex.id) ? "Show" : "Show"}`}
                  nowrap
                >
                  <button
                    class="opacity:.5 opacity:1:hover"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHidden(props.vertex.id);
                    }}
                  >
                    <Show
                      when={!hiddenNodes().includes(props.vertex.id)}
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
            </div>
          </Show>
        </div>

        <Show
          when={
            !collapsedKeys().includes(props.vertex.id) && children().length > 0
          }
        >
          <ul class="pl:8 pt:3 pb:5">
            <For each={children()}>
              {(vertex) => (
                <Show when={pageConfig.formData}>
                  <TreeView vertex={vertex} />
                </Show>
              )}
            </For>
          </ul>
        </Show>
      </div>
    );
  };

  const rootVertexes = () =>
    pageConfig.formData?.formData ? [pageConfig.formData.formData] : []; // Starting point(s)

  return (
    <>
      <For each={rootVertexes()}>
        {(item) => (
          <Show when={pageConfig.formData}>
            <TreeView vertex={item} />
          </Show>
        )}
      </For>
    </>
  );
}
