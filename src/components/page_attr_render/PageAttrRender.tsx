import { toTitle } from "case-switcher-js";
import { For, Match, Show, Switch, createMemo, useContext, } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getId } from "~/components/page_attr_render/utils/getID";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { Tab, TabContainer } from "~/components/solid_blocks";
import {
  FormContext,
  IsPreviewContext
  } from "~/lib/contexts";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";

import { PageAttrDnDWrapper } from "./page_attr_dnd_wrapper/PageAttrDnDWrapper";

export function PageAttrRender(props: Readonly<{ data?: Vertex; metaVertex: Vertex }>) {
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
            applyDefaults={true}
            // NOTE: For repeater we cant use parentData
            component={component()}
            // data={props.data || getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes || getDataVertex(item) || parentData()}
            data={
              props.data ||
              getSelectionOptions(
                graph,
                setGraph,
                item.P.data,
                [...useContext(RepeaterVertexContext)],
              ).vertexes ||
              getDataVertex(graph, item)
            }
            // setValue={props.setValue}
            disabled={false}
            meta={item}
            title={toTitle(getId(graph, item) ?? "")}
            txnId={txnId}
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
                <Show fallback={<PageComponentWithPreview />} when={!isPreview()}>
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </Tab>
            </Match>
            <Match when={parentComponent() === "TabContainer"}>
              <TabContainer>
                <Show fallback={<PageComponentWithPreview />} when={!isPreview()}>

                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </TabContainer>
            </Match>
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <Show fallback={<PageComponentWithPreview />} when={!isPreview()}>

                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </li>
            </Match>
            <Match when={true}>
              <Show fallback={<PageComponentWithPreview />} when={!isPreview()}>

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


