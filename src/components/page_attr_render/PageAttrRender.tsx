import { createMemo, For, Match, Show, Switch, useContext, } from "solid-js";
import { toTitle } from "case-switcher-js";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { Tab, TabContainer } from "~/components/solid_blocks";
import {
  FormContext,
  IsPreviewContext
  } from "~/lib/contexts";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getId } from "~/components/page_attr_render/utils/getID";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { PageAttrDnDWrapper } from "./PageAttrDnDWrapper";

export function PageAttrRender(props: Readonly<{ metaVertex: Vertex; data?: Vertex }>) {
  const parentItems = useContext(PageRenderVertexContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const { txnId } = useContext(FormContext);
  const [isPreview, setIsPreview] = useContext(IsPreviewContext);
  return (
    <For
      each={getChildrenAttrs(
        graph,
        setGraph,
        props.metaVertex,
      )}
    >
      {(item, index) => {
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
            title={toTitle(getId(graph, item) ?? "")}
            // setValue={props.setValue}
            disabled={false}
            component={component()}
            txnId={txnId}
            applyDefaults={true}
          />
        );

        const PageComponentWithPreview = () => (
          <PageRenderVertexContext.Provider
            value={[...useContext(PageRenderVertexContext), item]}
          >
            <Content />
          </PageRenderVertexContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.
        return (
          <Switch>
            <Match when={parentComponent() === "TabList"}>
              <Tab style={item.P}>
                <Show when={!isPreview()} fallback={<PageComponentWithPreview />}>
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </Tab>
            </Match>
            <Match when={parentComponent() === "TabContainer"}>
              <TabContainer>
                <Show when={!isPreview()} fallback={<PageComponentWithPreview />}>

                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </TabContainer>
            </Match>
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <Show when={!isPreview()} fallback={<PageComponentWithPreview />}>

                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </li>
            </Match>
            <Match when={true}>
              <Show when={!isPreview()} fallback={<PageComponentWithPreview />}>

                <PageAttrDnDWrapper item={item}>
                  <Content />
                </PageAttrDnDWrapper>
              </Show>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}


