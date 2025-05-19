import { createMemo, Show } from "solid-js";
import { createAsync } from "@solidjs/router";

import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  usePreviewContext,
} from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import { getComponentDefaultValues } from "./functions/getComponentDefaultValues";
import {
  DataContext,
  useDataContext,
} from "~/features/page_attr_render/context/DataContext";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

export function ComponentField(props: Readonly<{}>) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [previewStore, setPreviewStore] = usePreviewContext();

  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data as Vertex | undefined;

  const getCompVertex = createMemo(() =>
    meta()
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          meta()!.P.componentName,
        )
      : undefined,
  );

  const componentData = createAsync(
    async () => {
      const vertex = getCompVertex();
      if (vertex && getChildrenAttrs(graph, setGraph, vertex).length !== 0) {
        return {};
      }
      return await fetchComponentData([meta()!.P.componentName]);
    },
    { deferStream: true },
  );

  // createEffect(
  //   on(getCompVertex, (component, prevComponent) => {
  //     if (
  //       component &&
  //       JSON.parse(JSON.stringify(component)) !==
  //       JSON.parse(JSON.stringify(prevComponent || [])) &&
  //       (component.length === 0 ||
  //         getChildrenAttrs(graph, setGraph, component[0]).length === 0)
  //     ) {
  //       // Fetch attrs when no children found
  //       // Trigger refetch by accessing the async resource
  //       componentData();
  //     }
  //   }),
  // );

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
    const contextData = useDataContext() || {};

    const propsMemo = createMemo(() => {
      const defaultValues = getComponentDefaultValues(
        getCompVertex()!,
        graph,
        setGraph,
      );
      return { ...defaultValues, ...removeUndefinedProperties(props) };
    });

    const valuesProxy = new Proxy(
      {},
      {
        get(_, key) {
          if (
            key === Symbol.toPrimitive ||
            key === "toString" ||
            key === "valueOf"
          ) {
            return () => JSON.stringify(propsMemo());
          }
          if (key === "context") {
            return parentRenderContext()?.context;
          }
          const propValue = props[key as keyof typeof props];
          if (propValue !== undefined && propValue !== null) {
            return propValue;
          }
          const defaultValues = getComponentDefaultValues(
            getCompVertex()!,
            graph,
            setGraph,
          );
          return defaultValues[key as keyof typeof defaultValues];
        },
        ownKeys() {
          return Reflect.ownKeys(propsMemo());
        },
        getOwnPropertyDescriptor(_, prop) {
          const value = propsMemo()[prop as keyof ReturnType<typeof propsMemo>];
          return value !== undefined
            ? {
                enumerable: true,
                configurable: true,
                value,
              }
            : undefined;
        },
      },
    );

    const newDataContext = new Proxy(contextData, {
      get(target, key) {
        if (key === "props") {
          return valuesProxy;
        }
        return target[key];
      },
    });

    return (
      <DataContext.Provider value={newDataContext}>
        <PageAttrRender
          data={data()}
          metaVertex={getCompVertex() as Vertex}
          isNoPermissionCheck={
            parentRenderContext()?.context.isNoPermissionCheck
          }
        />
      </DataContext.Provider>
    );
  };

  const Children = (props: { slot: string }) => {
    const slotFilter = (vertex: Vertex) => {
      if (props.slot) {
        return vertex.P.slot === props.slot;
      } else {
        return !vertex.P.slot;
      }
    };
    return (
      <PreviewContext.Provider value={[previewStoreProxy, setPreviewStore]}>
        <Show when={meta()}>
          <PageAttrRender
            data={data()}
            isNoPermissionCheck={
              parentRenderContext()?.context.isNoPermissionCheck
            }
            metaVertex={meta() as Vertex}
            filter={slotFilter}
          />
        </Show>
      </PreviewContext.Provider>
    );
  };

  const Content = () => {
    if (componentData() && componentData()?.graph) {
      setGraphData(graph, setGraph, componentData()!.graph!, {
        skipExisting: true,
      });
    }
    return (
      <Show when={getCompVertex()} fallback={<div>No Component Found!</div>}>
        <SlotContext.Provider value={Children}>
          <ComponentWrapper />
        </SlotContext.Provider>
      </Show>
    );
  };

  return (
    <>
      <Show when={componentData()}>
        <Content />
      </Show>
    </>
  );
}
