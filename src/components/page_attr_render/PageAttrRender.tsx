import { createMemo, For, Match, Show, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { usePreviewContext, PreviewContext } from "~/components/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { useFormContext, type FormStoreObject } from "../form/context/FormContext";
import { getChildrenAttrs } from "../page_designer/functions/getChildrenAttrs";
import { usePageRenderContext } from "./context/PageRenderContext";
import { getComponentLabel } from "../page_designer/functions/getComponentLabel";
import { clientOnly } from "@solidjs/start";

export function PageAttrRender(
  props: Readonly<{
    data?: Vertex;
    filter?: (vertex: Vertex) => boolean;
    metaVertex: Vertex;
    isNoPermissionCheck: boolean;
  }>,
) {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;
  const [previewStore, setPreviewStore] = usePreviewContext();

  const childrenAttrs = createMemo(() => {
    const attrs = getChildrenAttrs(graph, setGraph, props.metaVertex);
    return props.filter ? attrs.filter(props.filter) : attrs;
  });

  return (
    <For each={childrenAttrs()}>
      {(item, _index) => {

        const Content = () => {
          return (
            <DynamicComponent
              // data={props.data || getDataVertex(item) || parentData()}
              data={props.data}
              // onChange={props.onChange}
              meta={item}
              txnId={formVertex()?.P.txnId}
              isNoPermissionCheck={props.isNoPermissionCheck}
            />
          );
        };
        const DnDWrapper = () => {
          const PageAttrDnDWrapper = clientOnly(
            () => import("./page_attr_dnd_wrapper/PageAttrDnDWrapper"),
          );

          return (
            <PageAttrDnDWrapper item={item}>
              <Content />
            </PageAttrDnDWrapper>
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
              <Switch>
                <Match when={!previewStore.isDesignMode}>
                  <Content />
                </Match>
                <Match when={true}>
                  <DnDWrapper/>
                </Match>
              </Switch>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}
