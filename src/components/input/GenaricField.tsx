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

import {toTitle} from "case-switcher-js";
import {IdAttr, setGraph, Vertex} from "../../lib/graph";
import {getCollAttrComp, getCompProps, getRowProps} from "../../lib/Record";
import {
  FormContext,
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions,
  PageContext,
} from "../../lib/Utils";
import {getLastItem} from "../../utils/functions";
import {DynamicComponent} from "../DynamicComponent";
import {Tab, TabContainer, Tooltip} from "../solid-blocks/blocks";
import {hoverId, indicatorPosition, selectedId, setHoverId, setSelectedId, targetId, useDragDrop} from "../pageStore";
import {Icon} from "@iconify-icon/solid";

// Do not specify the items property if you specified the dataSource, and vice versa.
// It's best to use dataSource but we are using items for simplicity.

export const PageRenderContext = createContext([] as Vertex[]);
export const RepeaterContext = createContext([] as Vertex[]); // DataVertex[]

export const PageRenderUtils = {
  getCollection: (item?: Vertex): string | undefined =>
    item && getChildVertex(["$0Coll"], item).vertex?.P[IdAttr],
  getAttrVertex: (item?: Vertex): Vertex | undefined =>
    item && getChildVertex(["$0Att"], item).vertex,
  getAttr: (item?: Vertex): string | undefined =>
    item && PageRenderUtils.getAttrVertex(item)?.P[IdAttr],
  getID: (item?: Vertex): string | undefined => item && item.P["name"],
  getId: (item?: Vertex): string | undefined =>
    PageRenderUtils.getAttr(item) || PageRenderUtils.getID(item) || "",
  // get component or Attribute component
  getComponent: (item?: Vertex): Vertex | undefined => {
    if (!item) return;

    const currentComp = getChildVertex(["$0Comp"], item).vertex;
    if (currentComp) return currentComp;

    const attrVertex = PageRenderUtils.getAttrVertex(item);
    if (!attrVertex) return;
    return getCollAttrComp(attrVertex);
  },
  getDataVertex: (item?: Vertex) =>
    item && getChildVertex(["$0Data"], item).vertex,
};

export const PageItemRender = (props: {
  metaVertex: Vertex;
  data?: Vertex;
}) => {
  const parentItems = useContext(PageRenderContext);
  // @ts-ignore
  let { record, cleanUpConfig } = useContext(FormContext);
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedTargetId = createSelector(targetId);
  const isSelectedHoverId = createSelector(hoverId);

  return (
    <For
      each={getChildVertexes(["Attr"], [props.metaVertex]).vertexes?.sort(
        (a, b) => a.P.pos - b.P.pos
      )}
    >
      {(item,index) => {

        const {children, isActiveItem, handleDragStart, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, onLayoutItemClick, clone, deleteLayout} = useDragDrop(record, item, () => [], true);

        // createComputed is hard to debug
        createComputed(() => {
          // @Note:(Question)
          // We may need to link vertex with meta,
          // so each vertex can identify its meta.

          // 1. this will re-render when Props length changes.
          // 2. when Prop Key changes.
          const componentVertex = PageRenderUtils.getComponent(item);
          const componentProps = componentVertex
            ? getCompProps(componentVertex)
            : {};
          const rowProps = getRowProps(item);
          const compProps = Object.assign(componentProps, rowProps);

          if (isSelectedLayoutId(item.id) || isSelectedTargetId(item.id)) {
              if (compProps.class) {
                compProps.class += ` b:rgb(252,0,0)|1px|dashed r:5|5|5|5`;
              } else {
                compProps.class = `b:rgb(252,0,0)|1px|dashed r:5|5|5|5`;
              }
          }
          if(isSelectedHoverId(item.id)){
            if (compProps.class) {
              compProps.class += ` b:rgb(38,128,235)|1px|dashed r:5|5|5|5`;
            } else {
              compProps.class = `b:rgb(38,128,235)|1px|dashed r:5|5|5|5`;
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

          // supported deleted properties.
          // mergeProperties only merge top level properties. so props will be replaced.
          setGraph("vertexes", item.id, "P", {
            props: compProps,
            name: PageRenderUtils.getId(item),
          });
          // untrack(() => { mergeVertexProperties(getNewTxnId(), item.id, { props: compProps }); })
        });

        const component = createMemo(
          () =>
            item.P.component || PageRenderUtils.getComponent(item)?.P[IdAttr]
        );
        const parentComponent = createMemo(() => {
          return PageRenderUtils.getComponent(getLastItem(parentItems, 1))?.P[
            IdAttr
          ];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const parentData = () => {
          return PageRenderUtils.getDataVertex(getLastItem(parentItems, 1));
        };


        const getComponent = () =>
            getChildVertex(["$0Comp"], item).vertex?.P.name;

        const PageComponent = () => (
          <PageRenderContext.Provider
            value={[...useContext(PageRenderContext), item]}
          >
              <span
                class='contents '
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
                  <span class="position:relative">
                    <div class="abs bottom:100% display:flex bg:rgb(38,128,235) r:3|3|3|3 z:9999">
                      <Tooltip content={'Name'} nowrap><div class={'m:4px mr:10px fg:#ffffff f:14'}>{getComponent()}</div></Tooltip>
                      <Tooltip content={'Move'} nowrap><Icon draggable={true}
                                                                                      onDragStart={handleDragStart}
                                                                                      icon={'material-symbols-light:drag-pan-rounded'}
                                                                                      height={20} width={20}
                                                                                      color={'white'}
                                                                                      class={'cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff'}
                                                                                      style={{color: "white"}}/></Tooltip>
                      <Tooltip content={'Parent'} nowrap><Icon icon={'mdi:arrow-up'} height={20} width={20} color={'white'}
                            class={'cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff'} style={{color: "white"}} onclick={e => {
                        const parentResult = getParentVertex(['Attr'], item);
                        if (parentResult.error) {
                          return;
                        }
                        setSelectedId(parentResult.vertex!.id);
                      }}/></Tooltip>
                      <Tooltip content={'Duplicate'}><Icon icon={'mage:copy'} height={20} width={20} color={'white'}
                                                               class={'cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff'} style={{color: "white"}} onclick={clone}/></Tooltip>
                      <Tooltip content={'Delete'}><Icon onclick={deleteLayout} icon={'fluent:delete-20-regular'} height={20} width={20} color={'white'}
                                                           class={'cursor:pointer mt:5px mb:2px ml:2px mr:2px c:#ffffff'} style={{color: "white"}}/></Tooltip>
                    </div>
                  </span>
                </Show>
                <DynamicComponent
                    meta={item}

                    // NOTE: For repeater we cant use parentData
                    // data={props.data || getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes || PageRenderUtils.getDataVertex(item) || parentData()}
                    data={
                        props.data ||
                        getSelectionOptions(
                            [...useContext(RepeaterContext)],
                            item.P.data
                        ).vertexes ||
                        PageRenderUtils.getDataVertex(item)
                    }
                    title={toTitle(PageRenderUtils.getId(item) || "")}
                    // setValue={props.setValue}
                    disabled={false}
                    component={component()}
                /></span>
          </PageRenderContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.

        return (
            <Switch>
              <Match when={parentComponent() === "TabList"}>
                <Tab style={item.P.props}>
                  <PageComponent/>
                </Tab>
              </Match>
              <Match when={parentComponent() === "TabContainer"}>
                <TabContainer>
                  <PageComponent/>
                </TabContainer>
              </Match>
              <Match when={parentComponent() === "TableHeader"}>
                <th class={'p:10px bb:1px|solid|rgb(190,211,238)'}>
                  <PageComponent/>
                </th>
              </Match>
              <Match when={parentComponent() === "TreeViewChild"}>
                <li>
                  <PageComponent/>
                </li>
              </Match>
              <Match when={parentComponent() === "TableRow"}>
                <td class={`p:10px`}>
                  <PageComponent/>
                  {/*<div class=" h:1px  bg:rgb(229,231,235) w:100% " />*/}
                </td>
              </Match>
              <Match when={true}>
                <PageComponent/>
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

export function getText(projection: string, repeaterContext: Vertex[]) {
  return getSelectionOptions(repeaterContext, projection).vertexes as string;
}

export function getUrl(projection: string, repeaterContext: Vertex[]) {
  let url = getSelectionOptions(repeaterContext, projection).vertexes as
    | string
    | undefined;
  if (typeof url === "string" && url.startsWith("/")) {
    // url = (showNav() ? '/nav' : '') + url;
  }
  return url;
}

export function PageView(props: { number: number; vertex?: Vertex }) {
  const collection = createMemo(() =>
    PageRenderUtils.getCollection(props.vertex)
  );
  const dataVertex = createMemo(() =>
    PageRenderUtils.getDataVertex(props.vertex)
  );

  return (
    <PageContext.Provider value={{ events: {} }}>
      <Show when={props.number && props.vertex && props.number} keyed>
        <Switch>
          <Match when={collection() && !dataVertex()}>
            <For
              each={
                getSelectionOptions([props.vertex!], `'g:${collection()!}'`)
                  .vertexes
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

