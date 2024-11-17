import { createMemo, For, Match, Show, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useRepeaterVertexContext } from "~/components/page_attr_render/context/PageAttrContext";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { getChildrenAttrs } from "../page_designer/functions/getChildrenAttrs";
import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { useFormContext } from "../form/FormContext";
import { PageAttrDnDWrapper } from "./page_attr_dnd_wrapper/PageAttrDnDWrapper";
import { usePageRenderContext } from "./context/PageRenderContext";

export function PageAttrRender(
  props: Readonly<{ data?: Vertex; metaVertex: Vertex; filter?: (vertex: Vertex) => boolean }>,
) {
  const [parentContext] = usePageRenderContext();
  const [graph, setGraph] = useGraph();
  const [formStore] = useFormContext();
  const [previewStore] = usePreviewContext();

  const childrenAttrs = createMemo(() => {
    const attrs = getChildrenAttrs(graph, setGraph, props.metaVertex);
    return props.filter ? attrs.filter(props.filter) : attrs;
  });

  return (
    <For each={childrenAttrs()}>
      {(item, _index) => {
        const componentName = createMemo(
          () =>
            item.P.componentName ||
            getCompFallbackToString(item, graph)?.P[IdAttr],
        );
        const parentComponent = createMemo(() => {
          return getCompFallbackToString(
            getLastItem(parentContext?.vertexes || [], 1),
            graph,
          )?.P[IdAttr];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const _parentData = () => {
          return getDataVertex(
            graph,
            getLastItem(parentContext?.vertexes || [], 1),
          );
        };

        const Content = () => {
          const getData = createMemo(() => {
            const data = getSelectionOptions(
              graph,
              setGraph,
              item.P.data ?? "->$0Data",
              [...useRepeaterVertexContext()],
            ).vertexes;
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
              // onChange={props.onChange}
              meta={item}
              txnId={formStore?.txnId}
            />
          );
        };

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
            {/* <Match when={parentComponent() === "TreeViewChild"}>
              <li>
                <Show fallback={<Content />} when={previewStore.isDesignMode}>
                  <PageAttrDnDWrapper item={item}>
                    <Content />
                  </PageAttrDnDWrapper>
                </Show>
              </li>
            </Match> */}
            <Match when={true}>
              <Show fallback={<Content />} when={previewStore.isDesignMode}>
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
