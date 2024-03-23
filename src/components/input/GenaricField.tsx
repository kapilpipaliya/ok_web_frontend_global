import {
  createComputed,
  createContext, createEffect,
  createMemo, createSelector, createSignal,
  For,
  Match,
  runWithOwner,
  Show,
  Switch,
  useContext,
} from "solid-js";

import { toTitle } from "case-switcher-js";
import { graph, IdAttr, setGraph, Vertex } from "../../lib/graph";
import { getCollAttrComp, getCompProps, getRowProps } from "../../lib/Record";
import {
  FormContext,
  PageContext,
  getSelectionOptions,
  getChildVertex,
  getChildVertexes,
} from "../../lib/Utils";
import { getLastItem } from "../../utils/functions";
import { DynamicComponent } from "../DynamicComponent";
import { Tab, TabContainer } from "../solid-blocks/blocks";
import {hoverId, selectedDom, selectedId, setSelectedId} from "../pageStore";
import Dismiss from "solid-dismiss";
import {Icon} from "@iconify-icon/solid";

export const GlobalDragData = {} as { from: Vertex };
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
  const isSelectedHoverId = createSelector(hoverId);


  const [open, setOpen] = createSignal(true);

  let popupEl;

  const onClickClose = () => {
    setOpen(false);
  };
  const setOpenEditPopUp = (open) => {
    if (open) {
      const { bottom, left } = selectedDom.dom!.getBoundingClientRect();
      const { scrollX, scrollY } = window;

      popupEl.style.position = "absolute";
      popupEl.style.top = bottom + scrollY + "px";
      popupEl.style.left = left + scrollX + "px";
      popupEl.style.zIndex = "1";
    }
  };

  return (
    <For
      each={getChildVertexes(["Attr"], [props.metaVertex]).vertexes?.sort(
        (a, b) => a.P.pos - b.P.pos
      )}
    >
      {(item) => {
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

          if (isSelectedLayoutId(item.id) || isSelectedHoverId(item.id)) {
              if (compProps.class) {
                compProps.class += ` b:rgb(249,0,8)|1px|dashed r:5|5|5|5`;
              } else {
                compProps.class = `b:rgb(249,0,8)|1px|dashed r:5|5|5|5`;
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

        const PageComponent = () => (
          <PageRenderContext.Provider
            value={[...useContext(PageRenderContext), item]}
          >
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
                  setValue={record?.setValue || (() => {
                  })}
                  disabled={false}
                  component={component()}
              />
            <Show when={isSelectedLayoutId(item.id)}>
              <Dismiss
                ref={popupEl}
                menuButton={() => selectedDom.dom}
                open={open}
                setOpen={setOpen}
                onOpen={setOpenEditPopUp}
                // onOpen={setOpenEditPopUpFun}
                focusElementOnClose="menuButton"
                animation={{
                  name: "fade",
                }}
                mount="body"
              >
                <div class="popup bg:rgb(38,128,235) r:3|3|3|3 " >
                  <Icon icon={'mdi:edit'} height={20} width={20} color={'white'} class={'m:5px c:#ffffff'} style={{color:"white"}}/>
                  <Icon icon={'ion:duplicate-outline'} height={20} width={20} color={'white'} class={'m:5px c:#ffffff'} style={{color:"white"}}/>
                  <Icon onclick={()=>{onClickClose();setSelectedId(-1)}} icon={'fluent:delete-20-regular'} height={20} width={20} color={'white'} class={'m:5px c:#ffffff'} style={{color:"white"}}/>
                </div>
              </Dismiss>
            </Show>
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

