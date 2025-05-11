import { clientOnly } from "@solidjs/start";
import { createMemo, For, Match, Switch } from "solid-js";

import {
  type FormStoreObject,
  useFormContext,
} from "~/components/form/context/FormContext";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import { usePageRenderContext } from "./context/PageRenderContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PageAttrRender(
  props: Readonly<{
    data?: Vertex;
    filter?: (vertex: Vertex) => boolean;
    isNoPermissionCheck: boolean;
    metaVertex: Vertex;
  }>,
) {
  const parentItems = usePageRenderContext();
  const _parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const [previewStore, _setPreviewStore] = usePreviewContext();

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
              isNoPermissionCheck={props.isNoPermissionCheck}
              // onChange={props.onChange}
              meta={item}
              txnId={formVertex()?.P.txnId}
            />
          );
        };
        const DnDWrapper = () => {
          const PageAttrDnDWrapper = clientOnly(
            () =>
              import("./page_attr_dnd_wrapper/components/PageAttrDnDWrapper"),
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
            <Match when={true}>
              <Switch>
                <Match when={!previewStore.isDesignMode}>
                  <Content />
                </Match>
                <Match when={true}>
                  <DnDWrapper />
                </Match>
              </Switch>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}
