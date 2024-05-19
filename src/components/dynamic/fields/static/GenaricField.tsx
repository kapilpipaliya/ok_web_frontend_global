import {
  createComputed,
  createContext,
  createMemo,
  createSelector,
  For,
  Match,
  Show,
  Switch,
  useContext,
} from "solid-js";
import { toTitle } from "case-switcher-js";
import {
  GraphContext,
  GraphInterface,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import { FormContext, iconMap, PageContext } from "~/lib/Utils";
import {
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions
} from "~/lib/graph/get/sync/traverse";
import { getLastItem } from "~/lib/functions";
import { DynamicComponent } from "~/components/dynamic/components/DynamicComponent";
import { useDragDrop } from "~/lib/pageStore";
import { Icon } from "@iconify-icon/solid";
import { SetStoreFunction, Store } from "solid-js/store";
import { Tab, TabContainer, Tooltip } from "~/components/solid-blocks/blocks";
import {
  getCollAttrComp,
  getCompProps,
  getRowProps,
} from "~/lib/graph/get/sync/graph_functions";
import {
  HoverIdContext,
  IndicatorPositionContext,
  IsPreviewContext,
  SelectedIdContext,
  TargetIdContext,
} from "~/lib/contexts";
// Do not specify the items property if you specified the dataSource, and vice versa.
// It's best to use dataSource but we are using items for simplicity.

export const PageRenderContext = createContext([] as Vertex[]);
export const RepeaterContext = createContext([] as Vertex[]); // DataVertex[]

export const PageRenderUtils = {
  getCollection: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): string | undefined =>
    item && getChildVertex(graph, ["$0Coll"], item).vertex?.P[IdAttr],
  getAttrVertex: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): Vertex | undefined =>
    item && getChildVertex(graph, ["$0Att"], item).vertex,
  getAttr: (graph: Store<GraphInterface>, item?: Vertex): string | undefined =>
    item && PageRenderUtils.getAttrVertex(graph, item)?.P[IdAttr],
  getID: (item?: Vertex): string | undefined => item && item.P["name"],
  getId: (graph: Store<GraphInterface>, item?: Vertex): string | undefined =>
    PageRenderUtils.getAttr(graph, item) || PageRenderUtils.getID(item) || "",
  // get component or Attribute component
  getComponent: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): Vertex | undefined => {
    if (!item) return;

    const currentComp = getChildVertex(graph, ["$0Comp"], item).vertex;
    if (currentComp) return currentComp;

    const attrVertex = PageRenderUtils.getAttrVertex(graph, item);
    if (!attrVertex) return;
    return getCollAttrComp(attrVertex, graph);
  },
  getDataVertex: (graph: Store<GraphInterface>, item?: Vertex) =>
    item && getChildVertex(graph, ["$0Data"], item).vertex,
};

export const PageItemRender = (props: {
  metaVertex: Vertex;
  data?: Vertex;
}) => {
  const parentItems = useContext(PageRenderContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [targetId, setTargetId] = useContext(TargetIdContext);
  const [isPreview, setIsPreview] = useContext(IsPreviewContext);
  const [indicatorPosition, setIndicatorPosition] = useContext(
    IndicatorPositionContext,
  );
  let { txnId, formData, cleanUpConfig } = useContext(FormContext);
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedTargetId = createSelector(targetId);
  const isSelectedHoverId = createSelector(hoverId);

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
          isActiveItem,
          handleDragStart,
          handleDragEnter,
          handleDragOver,
          handleDragLeave,
          handleDrop,
          onLayoutItemClick,
          clone,
          deleteLayout,
        } = useDragDrop(graph, setGraph, txnId, formData, item, () => [], true);

        // createComputed is hard to debug
        createComputed(() => {
          // @Note:(Question)
          // We may need to link vertex with meta,
          // so each vertex can identify its meta.

          // 1. this will re-render when Props length changes.
          // 2. when Prop Key changes.
          const componentVertex = PageRenderUtils.getComponent(graph, item);
          const componentProps = componentVertex
            ? getCompProps(graph, componentVertex)
            : {};
          const rowProps = getRowProps(graph, setGraph, item);
          const compProps = Object.assign(componentProps, rowProps);

         if (!isPreview()) {
          if (isSelectedLayoutId(item.id) || isSelectedTargetId(item.id)) {
            if (compProps.class) {
              compProps.class += ` b:#3996E1|1.5px|solid r:5`;
            } else {
              compProps.class = `b:#3996E1|1px|solid r:5`;
            }
          }
          if (isSelectedHoverId(item.id)) {
            if (compProps.class) {
              compProps.class += ` b:#3996E1|1.5px|dashed r:5`;
            } else {
              compProps.class = `b:#3996E1|1px|dashed r:5`;
            }
          }

          if (isActiveItem()) {
            if (indicatorPosition().position === "before") {
              if (compProps.class) {
                compProps.class += ` bt:rgb(0,0,255)|1px|solid`;
              } else {
                compProps.class = `bt:rgb(0,0,255)|1px|solid`;
              }
            } else if (indicatorPosition().position === "after") {
              if (compProps.class) {
                compProps.class += ` bb:rgb(0,0,255)|2px|solid`;
              } else {
                compProps.class = `bb:rgb(0,0,255)|2px|solid`;
              }
            }
          }
         }

          // supported deleted properties.
          // mergeProperties only merge top level properties. so props will be replaced.
          setGraph("vertexes", item.id, "P", {
            props: compProps,
            name: PageRenderUtils.getId(graph, item),
          });
          // untrack(() => { mergeVertexProperties(getNewTxnId(), item.id, { props: compProps }); })
        });

        const component = createMemo(
          () =>
            item.P.component ||
            PageRenderUtils.getComponent(graph, item)?.P[IdAttr],
        );
        const parentComponent = createMemo(() => {
          return PageRenderUtils.getComponent(
            graph,
            getLastItem(parentItems, 1),
          )?.P[IdAttr];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const parentData = () => {
          return PageRenderUtils.getDataVertex(
            graph,
            getLastItem(parentItems, 1),
          );
        };

        const getComponent = () =>
          getChildVertex(graph, ["$0Comp"], item).vertex?.P.name;

        const Content = () => <DynamicComponent
        meta={item}
        // NOTE: For repeater we cant use parentData
        // data={props.data || getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes || PageRenderUtils.getDataVertex(item) || parentData()}
        data={
          props.data ||
          getSelectionOptions(
            graph,
            setGraph,
            [...useContext(RepeaterContext)],
            item.P.data,
          ).vertexes ||
          PageRenderUtils.getDataVertex(graph, item)
        }
        title={toTitle(PageRenderUtils.getId(graph, item) || "")}
        // setValue={props.setValue}
        disabled={false}
        component={component()}
      />

        const PageComponent = () => (
          <PageRenderContext.Provider
            value={[...useContext(PageRenderContext), item]}
          >
            <Show when={!isPreview()} fallback={<Content/>}>
            <span
              class="contents "
              onMouseOver={(e) => {
                e.stopPropagation();
                setHoverId(item.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onLayoutItemClick();
              }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Show when={isSelectedLayoutId(item.id)}>
                <span class="position:relative flex jc:end">
                  <div class="abs bottom:100% display:flex bg:rgb(38,128,235) r:5 z:9999 m:2|0">
                    <Tooltip content={"Name"} nowrap>
                      <div class={"m:4px mr:10px fg:#ffffff f:14"}>
                        {getComponent()}
                      </div>
                    </Tooltip>
                    <Tooltip content={"Move"} nowrap>
                      <Icon
                        draggable={true}
                        onDragStart={handleDragStart}
                        icon={"material-symbols-light:drag-pan-rounded"}
                        height={20}
                        width={20}
                        color={"white"}
                        class={
                          "cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff"
                        }
                        style={{ color: "white" }}
                      />
                    </Tooltip>
                    <Tooltip content={"Parent"} nowrap>
                      <Icon
                        icon={"mdi:arrow-up"}
                        height={20}
                        width={20}
                        color={"white"}
                        class={
                          "cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff"
                        }
                        style={{ color: "white" }}
                        onclick={(e) => {
                          const parentResult = getParentVertex(
                            ["Attr"],
                            item,
                            graph,
                          );
                          if (parentResult.error) {
                            return;
                          }
                          setSelectedId(parentResult.vertex!.id);
                        }}
                      />
                    </Tooltip>
                    <Tooltip content={"Duplicate"}>
                      <Icon
                        icon={"mage:copy"}
                        height={20}
                        width={20}
                        color={"white"}
                        class={
                          "cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff"
                        }
                        style={{ color: "white" }}
                        onclick={clone}
                      />
                    </Tooltip>
                    <Tooltip content={"Delete"}>
                      <Icon
                        onClick={() => deleteLayout(getComponent())}
                        icon={"fluent:delete-20-regular"}
                        height={20}
                        width={20}
                        color={"white"}
                        class={
                          "cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff"
                        }
                        style={{ color: "white" }}
                      />
                    </Tooltip>
                  </div>
                </span>
              </Show>
              <Show
                when={item.id !== selectedId() && isSelectedHoverId(item.id)}
              >
                <span class="position:relative">
                  <div class="abs bottom:100% flex bg:rgb(38,128,235) r:5 z:9999 p:0|5 ai:center m:2|0">
                    <Icon
                      icon={iconMap[getComponent()]}
                      style={{ color: "white" }}
                    />
                    <Tooltip content={"Name"} nowrap>
                      <div class={"m:4px mr:10px fg:#ffffff f:14"}>
                        {getComponent()}
                      </div>
                    </Tooltip>
                  </div>
                </span>
              </Show>

              <Content/>
            </span>
            </Show>
          
          </PageRenderContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.

        return (
          <Switch>
            <Match when={parentComponent() === "TabList"}>
              <Tab style={item.P.props}>
                <PageComponent />
              </Tab>
            </Match>
            <Match when={parentComponent() === "TabContainer"}>
              <TabContainer>
                <PageComponent />
              </TabContainer>
            </Match>
            <Match when={parentComponent() === "TableHeader"}>
              <th class={"font-weight:medium h:40"}>
                <PageComponent />
              </th>
            </Match>
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <PageComponent />
              </li>
            </Match>
            <Match when={parentComponent() === "TableRow"}>
              <td class={`p:10px bb:1px|solid|rgb(227,231,236)`}>
                <PageComponent />
                {/*<div class=" h:1px  bg:rgb(229,231,235) w:100% " />*/}
              </td>
            </Match>
            <Match when={true}>
              <PageComponent />
            </Match>
          </Switch>
        );
      }}
    </For>
  );
};
// Do not specify the items property if you specified the dataSource, and vice versa.
// It's best to use dataSource, but we are using items for simplicity.
// Components that don't have children.

export function getText(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  return getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string;
}

export function getUrl(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  let url = getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string | undefined;
  if (typeof url === "string" && url.startsWith("/")) {
    // url = (showNav() ? '/nav' : '') + url;
  }
  return url;
}

export function PageView(props: { vertex?: Vertex, isPreview?: boolean }) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const collection = createMemo(() =>
    PageRenderUtils.getCollection(graph, props.vertex),
  );
  const dataVertex = createMemo(() =>
    PageRenderUtils.getDataVertex(graph, props.vertex),
  );

  return (
    <PageContext.Provider value={{ events: {} }}>
      <Show when={props.vertex} keyed>
        <Switch>
          <Match when={collection() && !dataVertex()}>
            <For
              each={
                getSelectionOptions(
                  graph,
                  setGraph,
                  [props.vertex!],
                  `'g:${collection()!}'`,
                ).vertexes
              }
            >
              {(vertex) => (
                <PageRenderContext.Provider value={[props.vertex!]}>
                  <PageItemRender metaVertex={props.vertex!} data={vertex} />
                </PageRenderContext.Provider>
              )}
            </For>
          </Match>
          <Match when={collection() && dataVertex()}>
            <PageItemRender metaVertex={props.vertex!} />
          </Match>
          <Match when={true}>
            <PageItemRender metaVertex={props.vertex!} />
          </Match>
        </Switch>
      </Show>
    </PageContext.Provider>
  );
}
