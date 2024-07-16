import { toTitle } from "case-switcher-js";
import { For, Match, Show, Switch, createMemo } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import {
  PageRenderVertexContext,
  usePageRenderVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/Context";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { getId } from "~/components/page_attr_render/utils/getID";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { Tab, TabContainer } from "~/components/solid_blocks/tabs/tabs";
import { useFormContext, useIsPreview } from "~/lib/contexts";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";

import { isDisabled, isHidden } from "../page_designer/settings/properties/rules/isHidden";
import { PageAttrDnDWrapper } from "./page_attr_dnd_wrapper/PageAttrDnDWrapper";

export function PageAttrRender(
  props: Readonly<{ data?: Vertex; metaVertex: Vertex }>,
) {
  const parentItems = usePageRenderVertexContext();
  const [graph, setGraph] = useGraph();
  const { formData, txnId } = useFormContext();
  const [isPreview] = useIsPreview();

  return (
    <For each={getChildrenAttrs(graph, setGraph, props.metaVertex)}>
      {(item, index) => {
        const component = createMemo(
          () =>
            item.P.component || getCompFallbackToString(item, graph)?.P[IdAttr],
        );
        const parentComponent = createMemo(() => {
          return getCompFallbackToString(getLastItem(parentItems, 1), graph)?.P[
            IdAttr
          ];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const parentData = () => {
          return getDataVertex(graph, getLastItem(parentItems, 1));
        };

        const Content = () => (
          <Show when={!isPreview() || !isHidden(item, formData, graph, setGraph)}>
            <DynamicComponent
              // NOTE: For repeater we cant use parentData
              component={component()}
              // data={props.data || getSelectionOptions([...useRepeaterVertexContext()], item.P.data).vertexes || getDataVertex(item) || parentData()}
              data={
                props.data ||
                getSelectionOptions(graph, setGraph, item.P.data, [
                  ...useRepeaterVertexContext(),
                ]).vertexes ||
                getDataVertex(graph, item)
              }
              // setValue={props.setValue}
              disabled={isPreview() && isDisabled(item, formData, graph, setGraph)}
              meta={item}
              title={toTitle(getId(graph, item) ?? "")}
              txnId={txnId}
            />
          </Show>
        );

        const PageComponentWithPreview = () => (
          <PageRenderVertexContext.Provider
            value={[...usePageRenderVertexContext(), item]}
          >
            <Content />
          </PageRenderVertexContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.
        return (
          <Switch>
            <Match when={parentComponent() === "TabList"}>
              <Tab>
                <Show
                  fallback={<PageComponentWithPreview />}
                  when={!isPreview()}
                >
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </Tab>
            </Match>
            <Match when={parentComponent() === "TabContainer"}>
              <TabContainer>
                <Show
                  fallback={<PageComponentWithPreview />}
                  when={!isPreview()}
                >
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </TabContainer>
            </Match>
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <Show
                  fallback={<PageComponentWithPreview />}
                  when={!isPreview()}
                >
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
