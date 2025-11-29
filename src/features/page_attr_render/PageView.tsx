import {
  createMemo,
  Match,
  Show,
  Switch,
  createSignal,
  onCleanup, createEffect, createComputed,
} from "solid-js";
import { createStore } from "solid-js/store";

import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  usePreviewContext,
  type PreviewStoreObject,
} from "~/features/page_designer/context/PreviewContext";
import {
  PageRenderContextProvider,
  type PageRenderObject,
} from "./context/PageRenderContext";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { evalExpression } from "~/lib/expression_eval";
import { ComponentWrapper } from "./ComponentWrapper";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { useFunctionProxy } from "~/components/form/dynamic_component/hooks/useFunctionProxy";
import { HtmlField } from "~/components/fields/HtmlField";
import { DataInternal } from "~/components/fields/data/DataInternal";

export function PageView(
  props: Readonly<{
    context?: Record<string, unknown>;
    data?: Vertex;
    hasFullPermission?: boolean | null;
    hasEditPermission?: boolean | null;
    hasCreatePermission?: boolean | null;
    hasViewPermission?: boolean | null;
    id?: Id;
    isDesignMode?: boolean;
    isNoPermissionCheck?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const [previewStore2] = usePreviewContext();

  const isViewOnlyForm = createMemo(() => {
    if (!(props.id || props.hasCreatePermission)) {
      return true;
    }
    if (props.id && !props.hasEditPermission) {
      return props.hasViewPermission;
    }
  });

  // Function to find and log layout vertexes
  const logLayoutVertexes = () => {
    if (props.metaVertex) {
      // First get all Layout vertices from the data vertex
      const layoutVertices =
        evalExpression("->$0Layout", {
          graph,
          setGraph,
          vertexes: [props.metaVertex],
        }) || [];

      // Sort by displayOrder
      const sortedLayouts = layoutVertices.sort(
        (a: Vertex, b: Vertex) =>
          (a.P.displayOrder || 0) - (b.P.displayOrder || 0),
      );

      // Collect all component vertices
      const allComponents: Vertex[] = [];

      // For each sorted layout, find its Component
      for (const layoutVertex of sortedLayouts) {
        const componentName = layoutVertex.P.componentName;
        const components = componentName
          ? ([
              findVertexByLabelAndUniqueId(
                graph,
                "Component",
                "key",
                componentName,
              ),
            ].filter(Boolean) as Vertex[])
          : [];

        // Add components to the array
        allComponents.push(...components);
      }

      return allComponents;
    }

    return [];
  };

  // Calculate layout components for Page vertices
  const layouts = createMemo(() => {
    if (props.metaVertex?.L[0] === "Page") {
      return logLayoutVertexes();
    }
    return [];
  });

  const previewStore = createStore<PreviewStoreObject>({
    get context() {
      return props.context;
    },
    get hasFullPermission() {
      return props.hasFullPermission;
    },
    get hasEditPermission() {
      return props.hasEditPermission;
    },
    get hasCreatePermission() {
      return props.hasCreatePermission;
    },
    get hasViewPermission() {
      return props.hasViewPermission;
    },
    get id() {
      return props.id;
    },
    get isDesignMode() {
      return props.isDesignMode;
    },
    get isNoPermissionCheck() {
      return props.isNoPermissionCheck;
    },
    get isViewOnly() {
      return isViewOnlyForm();
    },
    get previewData() {
      return props.data;
    },
    get previewMeta() {
      return props.metaVertex;
    },
  });

  // Inner component to handle recursive layout rendering
  const LayoutRenderer = (innerProps: { index: number }) => {
    const currentLayout = createMemo(() =>
      innerProps.index < layouts().length ? layouts()[innerProps.index] : null,
    );

    const LayoutContent = () => {
      const SlotChildren = (childProps: { slot?: string }) => {
        return (
          <Show
            when={!childProps.slot || childProps.slot === "children"}
            fallback={null}
          >
            <LayoutRenderer index={innerProps.index + 1} />
          </Show>
        );
      };

      return (
        <SlotContext.Provider value={[SlotChildren]}>
          {/*<Show*/}
          {/*  when={currentLayout()?.L[0] === "Component"}*/}
          {/*  fallback={*/}
          {/*    <DataContext.Provider value={{ index: 0 }}>*/}
          {/*      <PageAttrRender*/}
          {/*        data={props.data}*/}
          {/*        isNoPermissionCheck={props.isNoPermissionCheck}*/}
          {/*        metaVertex={currentLayout()!}*/}
          {/*      />*/}
          {/*    </DataContext.Provider>*/}
          {/*  }*/}
          {/*>*/}
          <ComponentWrapper
            metaVertex={currentLayout()!}
            data={props.data}
            isNoPermissionCheck={props.isNoPermissionCheck}
          />
          {/*</Show>*/}
        </SlotContext.Provider>
      );
    };

    return (
      <Show when={currentLayout()} fallback={<MainContentDataWrapper />}>
        <LayoutContent />
      </Show>
    );
  };

  const MainContentDataWrapper = () => {
    const [graph] = useGraph();
    const [componentName] = createSignal<string>("Html");

    // Use the centralized function proxy hook
    const { functionProxy, getFunctionArgumentWithValue, setRef, setMounted } =
      useFunctionProxy({
        // props is not a proxy!
        props: {
          get meta() {
            return props.metaVertex;
          },
          get data() {
            return props.data;
          },
        },
        componentName,
        formId: "page-view",
        isNoPermissionCheck: () => props.isNoPermissionCheck ?? false,
        isViewMode: () => false,
        value: () => undefined,
        updateValue: () => {},
        onChange: () => {},
        hasFullPermission: () => props.hasFullPermission ?? true,
        hasEditPermission: () => props.hasEditPermission ?? true,
        hasCreatePermission: () => props.hasCreatePermission ?? true,
        hasViewPermission: () => props.hasViewPermission ?? true,
      });

    // Evaluate dynamic props from metaVertex
    const dynamicProps = createDynamicPropsMemo(
      {
        get meta() {
          return props.metaVertex;
        },
      },
      {
        graph,
        getFunctionArgumentWithValue,
      },
    );

    // Lifecycle setup using useComponentLifecycle hook
    useComponentLifecycle({
      dynamicProps,
      getFunctionArgumentWithValue,
      setMounted,
      reMount: true,
    });

    onCleanup(() => {
      setRef(null);
      setMounted(false);
    });

    const repeterStore = createStore({
      get context() {
        return {
          get fns() {
            return functionProxy;
          },
        };
      },
    } as PageRenderObject);

    const MainContent = () => (
      <Switch>
        <Match when={props.metaVertex?.L[0] === "Component"}>
          <ComponentWrapper
            metaVertex={props.metaVertex!}
            data={props.data}
            isNoPermissionCheck={props.isNoPermissionCheck}
          />
        </Match>
        <Match
          when={
            dynamicProps().data ||
            dynamicProps().expression ||
            dynamicProps().serverFunction
          }
        >
          <PageAttrRender
            data={props.data}
            isNoPermissionCheck={props.isNoPermissionCheck!}
            metaVertex={props.metaVertex!}
          />
        </Match>
        <Match when={true}>
          <DataInternal
            data={props.data}
            index={0}
            meta={props.metaVertex!}
            contextName={""}
            repeaterValue={{ index: 0 }}
            isNoPermissionCheck={props.isNoPermissionCheck!}
          />
        </Match>
      </Switch>
    );

    return (
      <PageRenderContextProvider store={repeterStore}>
        <Switch>
          <Match
            when={
              dynamicProps().data ||
              dynamicProps().expression ||
              dynamicProps().serverFunction
            }
          >
            <HtmlField
              data={dynamicProps().data}
              expression={dynamicProps().expression}
              serverFunction={dynamicProps().serverFunction}
              loop={dynamicProps().loop}
              contextName={dynamicProps().contextName}
              renderChildren
            >
              <MainContent />
            </HtmlField>
          </Match>
          <Match when={true}>
            <MainContent />
          </Match>
        </Switch>
      </PageRenderContextProvider>
    );
  };

  return (
    <Show when={props.metaVertex}>
      <PreviewContext.Provider value={previewStore}>
        <Show when={layouts().length > 0} fallback={<MainContentDataWrapper />}>
          <LayoutRenderer index={0} />
        </Show>
      </PreviewContext.Provider>
    </Show>
  );
}
