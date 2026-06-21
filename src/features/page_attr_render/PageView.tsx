import {
  createMemo,
  Match,
  Show,
  Switch,
  createSignal,
  onCleanup,
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
import { SimpleAlert } from "~/components/styled/SimpleAlert";
import { usePermissions } from "~/pages/PageViewWrapper/usePermissions";
import { AuthRequired } from "~/components/auth/AuthRequired";

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
    pageVertexName?: string;
    parentPreviewStore?: PreviewStoreObject;
  }>,
) {
  const [graph, setGraph] = useGraph();

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

    const isNoPermissionCheck2 = createMemo(
      () =>
        props.isNoPermissionCheck ||
        props.metaVertex?.P.isNoPermissionCheck ||
        props.parentPreviewStore?.isNoPermissionCheck,
    );
    // Initialize permissions
    const { permissions: permissions2 } = usePermissions(props, {
      graph,
      metaVertex: () => props.metaVertex!,
      isNoPermissionCheck: isNoPermissionCheck2,
      id: () => props.id,
      previewStore: props.parentPreviewStore!,
    });

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
        hasFullPermission: () =>
          props.pageVertexName
            ? permissions2.full()
            : (props.hasFullPermission ?? true),
        hasEditPermission: () =>
          props.pageVertexName
            ? permissions2.edit()
            : (props.hasEditPermission ?? true),
        hasCreatePermission: () =>
          props.pageVertexName
            ? permissions2.create()
            : (props.hasCreatePermission ?? true),
        hasViewPermission: () =>
          props.pageVertexName
            ? permissions2.view()
            : (props.hasViewPermission ?? true),
      });

    // Evaluate dynamic props from metaVertex
    const dynamicProps = createDynamicPropsMemo(
      {
        get meta() {
          return props.metaVertex!;
        },
      },
      {
        graph,
        getFunctionArgumentWithValue,
      },
    );

    const hasPageDataFetch = createMemo(
      () =>
        !!(
          dynamicProps().data ||
          dynamicProps().expression ||
          dynamicProps().serverFunction
        ),
    );

    const isNoPermissionCheck = createMemo(
      () =>
        props.isNoPermissionCheck ||
        dynamicProps().isNoPermissionCheck ||
        props.metaVertex?.P.isNoPermissionCheck ||
        props.parentPreviewStore?.isNoPermissionCheck,
    );
    // Initialize permissions
    const { checkAuthError } = usePermissions(props, {
      graph,
      metaVertex: () => props.metaVertex!,
      isNoPermissionCheck,
      id: () => props.id,
      previewStore: props.parentPreviewStore!,
    });

    const enabledValidationError = createMemo((): string => {
      if (
        !isNoPermissionCheck() &&
        props.metaVertex &&
        ["Page"].includes(props.metaVertex.L[0])
      ) {
        if (!props.pageVertexName) {
          return "";
        }
        const proxy = functionProxy as any;
        const enabled =
          typeof proxy.enabled === "function" ? proxy.enabled() : proxy.enabled;

        if (!enabled) {
          return `${props.pageVertexName || "Page"} is not enabled. Please contact your administrator.`;
        }
      }
      return "";
    });

    const validationError = createMemo((): string => {
      if (!props.pageVertexName) {
        return "";
      }
      // Use enabled validation error first
      if (enabledValidationError()) {
        return enabledValidationError();
      }

      if (!props.metaVertex) {
        return "No Page found";
      }

      if (!props.metaVertex.P.key) {
        return `No key for the ${props.pageVertexName || "Page"}`;
      }

      // Check auth error if provided
      if (checkAuthError) {
        const authError = checkAuthError();
        if (authError) {
          return authError;
        }
      }

      return "";
    });

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
        return getFunctionArgumentWithValue();
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
        <Match when={hasPageDataFetch()}>
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

    const PageViewContent = () => (
      <PageRenderContextProvider store={repeterStore}>
        <Show when={validationError()}>
          <SimpleAlert type="error" message={validationError()} />
        </Show>
        <Switch>
          <Match when={hasPageDataFetch()}>
            <HtmlField
              data={
                dynamicProps().data as
                  | (() => unknown[])
                  | unknown[]
                  | undefined
              }
              expression={dynamicProps().expression as string | undefined}
              serverFunction={dynamicProps().serverFunction as string | undefined}
              loop={dynamicProps().loop as boolean | undefined}
              contextName={dynamicProps().contextName as string | undefined}
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
    const previewStore = createStore<PreviewStoreObject>({
      get context() {
        return props.context;
      },
      get hasFullPermission() {
        return props.pageVertexName
          ? permissions2.full()
          : (props.hasFullPermission ?? true);
      },
      get hasEditPermission() {
        return props.pageVertexName
          ? permissions2.edit()
          : (props.hasEditPermission ?? true);
      },
      get hasCreatePermission() {
        return props.pageVertexName
          ? permissions2.create()
          : (props.hasCreatePermission ?? true);
      },
      get hasViewPermission() {
        return props.pageVertexName
          ? permissions2.view()
          : (props.hasViewPermission ?? true);
      },
      get id() {
        return props.id;
      },
      get isDesignMode() {
        return props.isDesignMode;
      },
      get isNoPermissionCheck() {
        return props.pageVertexName
          ? isNoPermissionCheck()
          : (props.isNoPermissionCheck ?? false);
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
    return (
      <PreviewContext.Provider value={previewStore}>
        <Switch>
          <Match
            when={
              props.metaVertex?.P?.signinRequired ||
              dynamicProps().signinRequired
            }
          >
            <AuthRequired>
              <PageViewContent />
            </AuthRequired>
          </Match>
          <Match
            when={
              !(props.metaVertex?.P?.signinRequired ||dynamicProps().signinRequired)
            }
          >
            <PageViewContent />
          </Match>
        </Switch>
      </PreviewContext.Provider>
    );
  };

  // LayoutRenderer runs outside MainContentDataWrapper, so it needs its own
  // PreviewContext or isDesignMode stays false and preview hover borders never mount.
  const pagePreviewStore = createStore<PreviewStoreObject>({
    get context() {
      return props.context;
    },
    get hasFullPermission() {
      return props.hasFullPermission ?? true;
    },
    get hasEditPermission() {
      return props.hasEditPermission ?? true;
    },
    get hasCreatePermission() {
      return props.hasCreatePermission ?? true;
    },
    get hasViewPermission() {
      return props.hasViewPermission ?? true;
    },
    get id() {
      return props.id;
    },
    get isDesignMode() {
      return props.isDesignMode;
    },
    get isNoPermissionCheck() {
      return props.isNoPermissionCheck ?? false;
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

  return (
    <Show when={props.metaVertex}>
      <PreviewContext.Provider value={pagePreviewStore}>
        <Show when={layouts().length > 0} fallback={<MainContentDataWrapper />}>
          <LayoutRenderer index={0} />
        </Show>
      </PreviewContext.Provider>
    </Show>
  );
}
