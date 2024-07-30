import { toTitle } from "case-switcher-js";
import { For, Match, Show, Switch, createMemo } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import {
  PageRenderVertexContext,
  usePageRenderVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/PageAttrContext";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { getId } from "~/components/page_attr_render/utils/getID";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";

import { useFormContext } from "../form/FormContext";
import { PageAttrDnDWrapper } from "./page_attr_dnd_wrapper/PageAttrDnDWrapper";

export function PageAttrRender(
  props: Readonly<{ data?: Vertex; metaVertex: Vertex }>,
) {
  const parentItems = usePageRenderVertexContext();
  const [graph, setGraph] = useGraph();
  const { formData, txnId } = useFormContext();
  const [previewStore] = usePreviewContext();

  return (
    <For each={getChildrenAttrs(graph, setGraph, props.metaVertex)}>
      {(item, index) => {
        const componentName = createMemo(
          () =>
            item.P.componentName || getCompFallbackToString(item, graph)?.P[IdAttr],
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

        const Content = () => {
          const getData = createMemo(() => {
            const data = getSelectionOptions(graph, setGraph, item.P.data ?? "->$0Data", [
              ...useRepeaterVertexContext(),
            ]).vertexes;
            if (!data || data.length === 0) {
              return props.data;
            }
            return data;
          });
          return (
            <DynamicComponent
              // NOTE: For repeater we cant use parentData
              componentName={componentName()}
              // data={props.data || getSelectionOptions([...useRepeaterVertexContext()], item.P.data).vertexes || getDataVertex(item) || parentData()}
              data={getData()}
              // setValue={props.setValue}
              meta={item}
              title={toTitle(getId(graph, item) ?? "")}
              txnId={txnId} />
          );
        };

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
            {/* <Match when={parentComponent() === "TabList"}>
              <Tab>
                <Show
                  fallback={<PageComponentWithPreview />}
                  when={!previewMeta}
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
                  when={!previewMeta}
                >
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </TabContainer>
            </Match> */}
            <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <Show
                  fallback={<PageComponentWithPreview />}
                  when={previewStore.isDesignMode}
                >
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </li>
            </Match>
            <Match when={true}>
              <Show fallback={<PageComponentWithPreview />} when={previewStore.isDesignMode}>
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
