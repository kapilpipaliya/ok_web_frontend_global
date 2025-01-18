import { createMemo, For, Match, Show, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { usePreviewContext, PreviewContext } from "~/components/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { useFormContext, type FormStoreObject } from "../form/context/FormContext";
import { getChildrenAttrs } from "../page_designer/functions/getChildrenAttrs";
import { usePageRenderContext } from "./context/PageRenderContext";
import { PageAttrDnDWrapper } from "./page_attr_dnd_wrapper/PageAttrDnDWrapper";
import { getComponentLabel } from "../page_designer/functions/getComponentLabel";

export function PageAttrRender(
  props: Readonly<{
    data?: Vertex;
    filter?: (vertex: Vertex) => boolean;
    metaVertex: Vertex;
  }>,
) {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;
  const [previewStore, setPreviewStore] = usePreviewContext();

  const previewStoreProxy = new Proxy(previewStore, {
    get(target, prop) {
      if (prop === 'isDesignMode') return false;
      return target[prop as keyof typeof target];
    }
  });

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
            getComponentLabel(graph, item),
        );
        const parentComponent = createMemo(() => {
          const parentMeta = getLastItem(parentItems, 1)?.[0].context.meta;
          if (!parentMeta) return undefined;
          return getComponentLabel(
            graph,
            parentMeta
          );
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const _parentData = () => {
          return getDataVertex(
            graph,
            getLastItem(parentItems, 1)?.[0].context.meta,
          );
        };

        const Content = () => {
          return (
            <DynamicComponent
              // NOTE: For repeater we cant use parentData
              componentName={componentName()}
              // data={props.data || getDataVertex(item) || parentData()}
              data={props.data}
              // onChange={props.onChange}
              meta={item}
              txnId={formVertex()?.P.txnId}
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
                <Show 
                  when={componentName() === "Component"}
                  fallback={
                    <PageAttrDnDWrapper item={item}>
                      <Content />
                    </PageAttrDnDWrapper>
                  }
                >
                  <PageAttrDnDWrapper item={item}>
                    <PreviewContext.Provider 
                      value={[previewStoreProxy, setPreviewStore]}
                    >
                      <Content />
                    </PreviewContext.Provider>
                  </PageAttrDnDWrapper>
                </Show>
              </Show>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}
