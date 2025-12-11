import {
  createMemo,
  Show,
  splitProps,
  useContext,
  Switch,
  Match,
  onCleanup,
} from "solid-js";
import { createAsync } from "@solidjs/router";
import { createStore } from "solid-js/store";

import {
  SlotContext,
  type SlotContextType,
} from "~/components/fields/component/contexts/SlotContext";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";
import {
  usePageRenderContext,
  PageRenderContextProvider,
} from "~/features/page_attr_render/context/PageRenderContext";
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
import type { JSX } from "solid-js";
import { useFunctionProxy } from "~/components/form/dynamic_component/hooks/useFunctionProxy";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";

// MOST Important: Component Field just render PageAttrRender, it render Children Attr of Component, there will be one root Attr where we define fns, its run inside <DynamicComponent/> so it will work with nested functions too.
export function ComponentField(props: Readonly<{ children?: JSX.Element }>) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [previewStore, setPreviewStore] = usePreviewContext();
  const [, otherProps] = splitProps(props, ["children"]);

  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data as Vertex | undefined;
  const componentName = () => parentRenderContext()!.context.componentName;

  const getCompVertex = createMemo(() =>
    meta()
      ? findVertexByLabelAndUniqueId(graph, "Component", "key", componentName())
      : undefined,
  );

  const componentData = createAsync(
    async () => {
      const name = componentName();
      if (typeof name !== "string") {
        return {};
      }
      // when there is no children (when creating a component and added in tree) it continues to fetch, improve it
      if (meta()?.id?.startsWith("-")) {
        return {};
      }
      const vertex = getCompVertex();
      if (vertex && getChildrenAttrs(graph, setGraph, vertex).length !== 0) {
        return {};
      }
      return await fetchComponentData([name]);
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

    // Memoize component default values to avoid recalculation
    const defaultValuesMemo = createMemo(() =>
      getComponentDefaultValues(
        getCompVertex()!,
        graph,
        setGraph,
      )
    );

    // Merge defaults with props once
    const propsMemo = createMemo(() => {
      return { ...defaultValuesMemo(), ...removeUndefinedProperties(otherProps) };
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
          // Check props first
          const propValue = props[key as keyof typeof props];
          if (propValue !== undefined && propValue !== null) {
            return propValue;
          }
          // Use memoized defaults instead of recalculating
          return defaultValuesMemo()[key as keyof ReturnType<typeof defaultValuesMemo>];
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

    // Inner component that uses function proxy after DataContext is provided
    const ComponentContent = () => {
      // Setup function proxy for component functions
      // Now useFunctionProxy is called inside DataContext.Provider context
      // so useDataContext() will return newDataContext with props
      const { getFunctionArgumentWithValue, setRef, setMounted } = useFunctionProxy({
        props: {
          get meta() {
            return getCompVertex() as Vertex;
          },
          get data() {
            return data();
          },
        },
        value: () => data(),
        componentName: () => componentName() as string,
        isNoPermissionCheck: () =>
          parentRenderContext()?.context.isNoPermissionCheck,
        isViewMode: () => false,
        hasFullPermission: () => true,
        hasEditPermission: () => true,
        hasCreatePermission: () => true,
        hasViewPermission: () => true,
      });

      // Evaluate dynamic props from metaVertex
      const dynamicProps = createDynamicPropsMemo(
        {
          get meta() {
            return getCompVertex() as Vertex;
          },
        },
        {
          graph,
          getFunctionArgumentWithValue,
        },
      );

      // Lifecycle setup
      useComponentLifecycle({
        dynamicProps,
        getFunctionArgumentWithValue,
        setMounted,
      });

      onCleanup(() => {
        setRef(null);
        setMounted(false);
      });

      // Create PageRenderContext store for this component's entire function argument
      const componentRenderStore = createStore({
        get context() {
          return getFunctionArgumentWithValue();
        },
      });

      return (
        <PageRenderContextProvider store={componentRenderStore}>
          <PageAttrRender
            data={data()}
            metaVertex={getCompVertex() as Vertex}
            isNoPermissionCheck={
              parentRenderContext()?.context.isNoPermissionCheck
            }
          />
        </PageRenderContextProvider>
      );
    };

    return (
      <DataContext.Provider value={newDataContext}>
        <ComponentContent />
      </DataContext.Provider>
    );
  };

  // Get parent children components from SlotContext once
  const parentSlotComponents = useContext(SlotContext) || [];

  const Children = (props: { slot: string; class?: string }) => {
    const slotFilter = (vertex: Vertex) => {
      if (props.slot) {
        return vertex.P.slotName === props.slot;
      }
      return !vertex.P.slotName;
    };

    // Check if slot name includes level indicator (e.g., "1footer")
    const hierarchicalMatch = () => props.slot?.match(/^(\d+)(.+)$/);

    return (
      <Switch>
        <Match when={hierarchicalMatch()}>
          {(match) => {
            const [, levelStr, slotName] = match();
            const level = parseInt(levelStr, 10);

            // Use the parent slot component at the specified level
            // Level 1 = immediate parent (most recent), Level 2 = grandparent, etc.
            const SlotComponentParent =
              level > 0 && level <= parentSlotComponents.length
                ? parentSlotComponents[parentSlotComponents.length - level]
                : (null as unknown as SlotContextType);

            return (
              <Show when={SlotComponentParent}>
                <SlotComponentParent slot={slotName} />
              </Show>
            );
          }}
        </Match>
        <Match when={true}>
          <PreviewContext.Provider value={[previewStoreProxy, setPreviewStore]}>
            <Show when={meta()}>
              <PageAttrRender
                data={data()}
                isNoPermissionCheck={
                  parentRenderContext()?.context.isNoPermissionCheck
                }
                metaVertex={meta() as Vertex}
                filter={slotFilter}
                class={props.class}
              />
            </Show>
          </PreviewContext.Provider>
        </Match>
      </Switch>
    );
  };

  const Content = () => {
    if (componentData()?.graph) {
      setGraphData(graph, setGraph, componentData()!.graph!, {
        skipExisting: true,
      });
    }
    return (
      <Show
        when={getCompVertex() && typeof componentName() === "string"}
        fallback={
          <div>
            {typeof componentName() !== "string"
              ? "Component name should be a string"
              : `No Component Found: ${componentName()}`}
          </div>
        }
      >
        <SlotContext.Provider value={[...parentSlotComponents, Children]}>
          <ComponentWrapper />
        </SlotContext.Provider>
      </Show>
    );
  };

  return (
    <Show when={componentData()}>
      <Content />
    </Show>
  );
}
