import { createMemo, createSelector, For, Match, Show, Switch, useContext } from "solid-js";
import { toTitle } from "case-switcher-js";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getChildVertex, getChildVertexes, getParentVertex, getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDragDrop } from "~/lib/drag_drop/useDragDrop";
import { Icon } from "@iconify-icon/solid";
import { Tab, TabContainer, Tooltip } from "~/components/solid_blocks";
import {
  DragOverTargetIdContext,
  FormContext,
  HoverIdContext,
  IndicatorPositionContext,
  IsPreviewContext,
  SelectedIdContext,
  ShowDrawerContext
} from "~/lib/contexts";
import { Popover } from "@kobalte/core/popover";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_item_render/Context";
import { iconMap } from "~/lib/constants";
import { getComponent } from "~/components/page_item_render/utils/getComponent";
import {
  getDataVertex
} from "~/components/page_item_render/utils/getDataVertex";
import { getId } from "~/components/page_item_render/utils/getID";
import { getLastItem } from "~/components/page_item_render/utils/getLastItem";

export function PageItemRender(props: { metaVertex: Vertex; data?: Vertex }) {
  const parentItems = useContext(PageRenderVertexContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [dragOverTargetId, _] = useContext(DragOverTargetIdContext);
  const [showDrawer, setShowDrawer] = useContext(ShowDrawerContext);
  const [isPreview, setIsPreview] = useContext(IsPreviewContext);
  const [indicatorPosition, setIndicatorPosition] = useContext(
    IndicatorPositionContext,
  );
  // TODO: Fix dont use PageDisnger Txn Id here.
  const { txnId, formData: pageDesignerFormVertex, cleanUpConfig } = useContext(FormContext);
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedDragOverTargetId = createSelector(dragOverTargetId);
  const isSelectedHoverId = createSelector(hoverId);
  const PropertyDrawer = (props: { itemId: any }) => {
    return (
      <Show when={isSelectedLayoutId(props.itemId)}>
        <Icon
          icon={"mingcute:settings-5-line"}
          onclick={() => {
            setShowDrawer(!showDrawer());
          }}
          height={22}
          width={22}
          class="cursor:pointer"
        />
      </Show>
    );
  };

  return (
    <For
      each={getChildVertexes(
        graph,
        ["Attr"],
        [props.metaVertex],
      ).vertexes?.sort((a, b) => a.P.pos - b.P.pos)}
    >
      {(item, index) => {
        const {
          children,
          isActiveTargetItem,
          handleDragStart,
          handleDragEnter,
          handleDragOver,
          handleDragLeave,
          handleDrop,
          onLayoutItemClick,
          clone,
          deleteLayout,
        } = useDragDrop(graph, setGraph, txnId, pageDesignerFormVertex, item, () => [], true);
        const getBorder = () => {
          if (!isPreview()) {
            if (isActiveTargetItem()) {
              if (indicatorPosition().position === "before") {
                return "bt:rgb(0,0,255)|2.5px|solid>*";
              }
              if (indicatorPosition().position === "after") {
                return "bb:rgb(0,0,255)|2.5px|solid>*";
              }
            }
            if (
              isSelectedLayoutId(item.id) ||
              isSelectedDragOverTargetId(item.id)
            ) {
              return "b:#3996E1|1.5px|solid>* r:5>*";
            }
            if (isSelectedHoverId(item.id)) {
              return "b:#3996E1|1.5px|dashed>* r:5>*";
            }
          }
        }

        const component = createMemo(
          () =>
            item.P.component ||
            getComponent(graph, item)?.P[IdAttr],
        );
        const parentComponent = createMemo(() => {
          return getComponent(
            graph,
            getLastItem(parentItems, 1),
          )?.P[IdAttr];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const parentData = () => {
          return getDataVertex(
            graph,
            getLastItem(parentItems, 1),
          );
        };

        const getComponentName = () =>
          getChildVertex(graph, ["$0Comp"], item).vertex?.P.name;

        const Content = () => (
          <DynamicComponent
            meta={item}
            // NOTE: For repeater we cant use parentData
            // data={props.data || getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes || getDataVertex(item) || parentData()}
            data={
              props.data ||
              getSelectionOptions(
                graph,
                setGraph,
                [...useContext(RepeaterVertexContext)],
                item.P.data,
              ).vertexes ||
              getDataVertex(graph, item)
            }
            title={toTitle(getId(graph, item) || "")}
            // setValue={props.setValue}
            disabled={false}
            component={component()}
            txnId={txnId}
            applyDefaults={true}
          />
        );

        const PageComponent = () => (
          <PageRenderVertexContext.Provider
            value={[...useContext(PageRenderVertexContext), item]}
          >
            <Show when={!isPreview()} fallback={<Content />}>
              <span
                class={`contents ${getBorder() || ""}`}
                onMouseOver={(e) => {
                  e.stopPropagation();
                  setHoverId(item.id);
                }}
                onmouseleave={(e) => {
                  e.stopPropagation();
                  setHoverId(-1);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLayoutItemClick(item);
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Popover
                  placement="top-start"
                  open={isSelectedLayoutId(item.id) || isSelectedHoverId(item.id)}
                >
                  <Popover.Anchor>
                    <Content />
                  </Popover.Anchor>
                  <Popover.Portal>
                    <Popover.Content class="popover__content">
                      <Show when={isSelectedLayoutId(item.id)}>
                        <span class="position:relative  flex justify-content:flex-end ">
                          <div
                            class="@fade|.3s z:50"
                            style={{
                              "border-radius": "0.25rem",
                              position: "absolute",
                              "background-color": "rgb(37,99,235)",
                              color: "rgb(255,255,255)",
                              padding: "3px",
                            }}
                          >
                            <div
                              style={{
                                "z-index": 50,
                                display: "flex",
                                gap: "3px",
                                margin: "2px 6px",
                              }}
                            >
                              <div
                                class="mr:0.5rem f:0.875rem lh:1.25rem"
                                style={{ display: "flex" }}
                              >
                                <PropertyDrawer itemId={item.id} />
                              </div>
                              <Tooltip content={"Name"} nowrap>
                                <div
                                  style={{
                                    display: "flex",
                                    "font-size": "0.875rem",
                                    "line-height": "1.25rem",
                                    "margin-right": "4px",
                                  }}
                                >
                                  {getComponentName()}
                                </div>
                              </Tooltip>
                              <Tooltip content={"Move"} nowrap>
                                <Icon
                                  draggable={true}
                                  onDragStart={handleDragStart}
                                  icon={
                                    "material-symbols-light:drag-pan-rounded"
                                  }
                                  height={20}
                                  width={20}
                                  class="cursor:pointer flex"
                                />
                              </Tooltip>
                              <Tooltip content={"Parent"} nowrap>
                                <Icon
                                  icon={"mdi:arrow-up"}
                                  height={20}
                                  width={20}
                                  class="cursor:pointer  flex "
                                  onClick={(e) => {
                                    const parentResult = getParentVertex(
                                      ["Attr"],
                                      item,
                                      graph,
                                    );
                                    if (parentResult.error) {
                                      return;
                                    }

                                    onLayoutItemClick(parentResult.vertex!);
                                  }}
                                />
                              </Tooltip>
                              <Tooltip content={"Duplicate"}>
                                <Icon
                                  icon={"mage:copy"}
                                  height={20}
                                  width={20}
                                  class="cursor:pointer  flex "
                                  onClick={clone}
                                />
                              </Tooltip>
                              <Tooltip content={"Delete"}>
                                <Icon
                                  onClick={() => deleteLayout(getComponentName())}
                                  icon={"fluent:delete-20-regular"}
                                  height={20}
                                  width={20}
                                  class="cursor:pointer  flex "
                                />
                              </Tooltip>
                            </div>
                          </div>
                        </span>
                      </Show>
                      <Show
                        when={
                          !isSelectedLayoutId(item.id) &&
                          isSelectedHoverId(item.id)
                        }
                      >
                        <span class="position:relative ">
                          <div class="position:absolute color:white bottom:100% flex bg:rgb(37,99,235)  r:0.25rem  z:50 p:0.25rem ai:center">
                            <Icon
                              icon={iconMap[getComponentName()]}
                              class=" flex"
                            />
                            <Tooltip content={"Name"} nowrap>
                              <div class="mr:0.5rem   f:0.875rem lh:1.25rem">
                                {getComponentName()}
                              </div>
                            </Tooltip>
                          </div>
                        </span>
                      </Show>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover>
              </span>
            </Show>
          </PageRenderVertexContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.
        return (
          <Switch>
            <Match when={parentComponent() === "TabList"}>
              <Tab style={item.P}>
                <PageComponent />
              </Tab>
            </Match>
            <Match when={parentComponent() === "TabContainer"}>
              <TabContainer>
                <PageComponent />
              </TabContainer>
            </Match>
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <PageComponent />
              </li>
            </Match>
            <Match when={true}>
              <PageComponent />
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}

