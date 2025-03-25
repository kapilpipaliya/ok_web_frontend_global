import { createEffect, createMemo, on, Show, splitProps } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { ComponentChildrenContext } from "~/components/fields/component/contexts/ComponentChildrenContext";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";
import {
  PageContext,
  usePageContext,
} from "~/features/page_attr_render/context/PageContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  usePreviewContext,
} from "~/features/page_designer/context/PreviewContext";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { deNullify } from "~/lib/data_structure/object/deNullify";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";

import type { GenericComponentProps } from "../type/FieldType";

import { getComponentDefaultValues } from "./functions/getComponentDefaultValues";

export function ComponentField(
  props: Readonly<GenericComponentProps & { componentId?: string }>,
) {
  const [, otherProps] = splitProps(props, ["componentId"]);

  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [previewStore, setPreviewStore] = usePreviewContext();

  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const fetchMetaData = async () => {
    if (!getCopmVertex().length) {
      return;
    }
    fetchComponentData([getCopmVertex()[0]], graph, setGraph);
  };

  const getCopmVertex = createMemo(() =>
    meta()
      ? (evalExpression("->$0Comp", {
          graph,
          setGraph,
          vertexes: [meta()],
        }) as Vertex[]) || ([] as Vertex[])
      : [],
  );

  createEffect(
    on(getCopmVertex, (component, prevComponent) => {
      if (
        component &&
        JSON.parse(JSON.stringify(component)) !==
          JSON.parse(JSON.stringify(prevComponent || [])) &&
        (component.length === 0 ||
          getChildrenAttrs(graph, setGraph, component[0]).length === 0)
      ) {
        // Fetch attrs when no children found
        // setGraph("url", "fetchAttrs", { id: meta.id });
        fetchMetaData();
      }
    }),
  );

  const previewStoreProxy = new Proxy(previewStore, {
    get(target, prop) {
      if (prop === "isDesignMode") {
        // @ts-expect-error ignore temporary key name
        return target.isDesignModePrev;
      }
      return target[prop as keyof typeof target];
    },
  });

  const ComponentWrapper = () => {
    const context = usePageContext() || {};
    const values = createMemo(() => {
      return {
        ...getComponentDefaultValues(getCopmVertex()[0], graph, setGraph),
        ...deNullify(otherProps),
      };
    });

    const repeaterStore = new Proxy(context, {
      get(target, key) {
        if (key === "props") {
          return values();
        }
        return target[key];
      },
    });
    return (
      <PageContext.Provider value={repeaterStore}>
        <PageAttrRender data={data()} metaVertex={getCopmVertex()[0]} />
      </PageContext.Provider>
    );
  };

  return (
    <>
      <Show when={getCopmVertex().length}>
        <ComponentChildrenContext.Provider
          value={() => {
            return (
              <PreviewContext.Provider
                value={[previewStoreProxy, setPreviewStore]}
              >
                {props.children}
              </PreviewContext.Provider>
            );
          }}
        >
          <ComponentWrapper />
        </ComponentChildrenContext.Provider>
      </Show>
      <Show when={!getCopmVertex().length}>Error</Show>
    </>
  );
}
