import {
  createSignal,
  type JSX,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
  getOwner,
  ErrorBoundary,
  createMemo,
  untrack,
} from "solid-js";
import { useSearchParams, useLocation, useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import {
  PageRenderContextProvider,
  usePageRenderContext,
} from "~/features/page_attr_render/context/PageRenderContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { useZIndex } from "../fields/ZIndex";
import { useToast } from "../styled/modal/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";

import { ContentWrapper } from "~/components/form/dynamic_component/components/DynamicContent";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";

import { useComponentPermissions } from "~/components/form/dynamic_component/hooks/useComponentPermissions";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { useComponentName } from "~/components/form/dynamic_component/hooks/useComponentName";
import { useFunctionProxy } from "~/components/form/dynamic_component/hooks/useFunctionProxy";

import type { Vertex } from "~/lib/graph/type/vertex";
import { createComponentMemo } from "~/components/form/dynamic_component/functions/component/createComponentMemo";
import { isComponentHidden } from "~/components/form/dynamic_component/functions/component/isComponentHidden";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { createCssStyleMemo } from "~/components/form/dynamic_component/functions/createCssStyleMemo";
import { createProcessedTextMemo } from "~/components/form/dynamic_component/functions/createProcessedTextMemo";
import { createMergedClasses } from "~/components/form/dynamic_component/functions/createMergedClasses";
import { createValueUpdater } from "~/components/form/dynamic_component/functions/value/createValueUpdater";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createStore } from "solid-js/store";
import { ComponentScopedStyle } from "~/components/ComponentScopedStyle";
import { useComponentStylesMode } from "~/lib/styles/ComponentStylesContext";

export type DynamicComponentProps = Readonly<{
  componentName?: string;
  data?: Vertex;
  disabled?: boolean;
  isLabelWrap?: boolean;
  isNoPermissionCheck?: boolean | null;
  isRealTime?: boolean;
  isTableInside?: boolean;
  isViewMode?: boolean;
  meta: Vertex;
  noLabel?: boolean;
  onChange?: (data: unknown) => void;
  title?: string;
  txnId?: number;
  children?: JSX.Element;
  class?: string;
}>;

/**
 * DynamicComponent is a flexible component that can render different components
 * based on configuration and permissions.
 */
export function DynamicComponent(props: DynamicComponentProps) {
  const [graph, setGraph] = useGraph();
  const { usePerComponentStyles } = useComponentStylesMode();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const [componentName, setComponentName] = createSignal<string>("Html");

  // Permission hooks
  const {
    hasCreatePermission,
    hasEditPermission,
    hasViewPermission,
    hasFullPermission,
    isNoPermissionCheck,
    hasPermission,
    isDisabledByPermissions,
    permissions,
  } = useComponentPermissions(props);

  // Component view mode and read-only state
  const isViewMode = () =>
    props.isViewMode ??
    props.meta.P.isViewMode ??
    parentRenderContext()?.context?.isViewMode;

  // Create the value management utilities
  const { value, updateValue, onChange } = createValueUpdater(props, {
    formVertex,
    isNoPermissionCheck,
    hasCreatePermission,
    hasEditPermission,
  });

  // Context hooks
  const parentItems = usePageRenderContext();
  const parentRenderContext = () =>
    getLastItem(parentItems)?.[0] as
      | { context: FunctionArgumentType }
      | undefined;
  const [previewStore] = usePreviewContext();

  // Setup function proxy with all necessary context
  const {
    functionProxy,
    getFunctionArgumentWithValue,
    ref,
    setRef,
    mounted,
    setMounted,
  } = useFunctionProxy({
    props: {
      get meta() {
        return props.meta;
      },
      get data() {
        return props.data;
      },
    },
    componentName,
    formVertex,
    formId,
    isNoPermissionCheck,
    isViewMode,
    value,
    updateValue,
    onChange,
    hasFullPermission,
    hasEditPermission,
    hasCreatePermission,
    hasViewPermission,
  });

  const dynamicProps = createDynamicPropsMemo(props, {
    graph,
    getFunctionArgumentWithValue,
  });

  useComponentName({
    props,
    componentName,
    setComponentName,
    graph,
    dynamicProps,
    meta: props.meta,
  });

  const component = createComponentMemo(componentName);

  const isHidden = () =>
    isComponentHidden(props, {
      dynamicProps,
      getFunctionArgumentWithValue,
    });

  const { cssStyle, styleId } = createCssStyleMemo(props, {
    getFunctionArgumentWithValue,
  });

  const mergedClasses = createMergedClasses(props, {
    dynamicProps,
    styleId,
    cssStyle,
  });

  const processedText = createProcessedTextMemo(props, {
    dynamicProps,
    getFunctionArgumentWithValue,
  });

  const repeaterStore = createStore({
    get context() {
      return getFunctionArgumentWithValue();
    },
  });
  const ContentWrapperWithMount = () => {
    useComponentLifecycle({
      dynamicProps,
      getFunctionArgumentWithValue,
      setMounted,
    });

    onCleanup(() => {
      setRef(null);
      setMounted(false);
    });

    return (
      <ContentWrapper
        meta={props.meta}
        data={props.data}
        children={props.children}
        dynamicProps={dynamicProps}
        mergedClasses={mergedClasses}
        permissions={permissions}
        component={component}
        processedText={processedText}
        // disabled={
        //   isNoPermissionCheck()
        //     ? props.meta.P.disabled
        //     : (props.disabled ??
        //       previewStore?.isViewOnly ??
        //       isDisabledByPermissions() ??
        //       props.meta.P.disabled)
        // }
        ref={ref}
        setRef={setRef}
        isNoPermissionCheck={isNoPermissionCheck}
      />
    );
  };

  // Create the main content component that will be wrapped conditionally
  const ContentInner = () => (
    <Switch>
      <Match when={isHidden()} />
      <Match when={!component()}>NO INPUT {componentName() as string}</Match>

      <Match when={component() && (isNoPermissionCheck() || hasPermission())}>
        <ContentWrapperWithMount />
      </Match>
      <Match when={getGlobalStore(graph).P.isDevelopment}>
        Hidden component
      </Match>
    </Switch>
  );

  return (
    <ErrorBoundary
      fallback={(err) => {
        console.error(err);
        return <div>Error: {err.message}</div>;
      }}
    >
      <Suspense>
        <Show when={cssStyle() && usePerComponentStyles()} keyed>
          <ComponentScopedStyle cssContent={cssStyle()!} />
        </Show>
        {/* <Show when={!props.isNoPermissionCheck && getGlobalStore(graph).P.isDevelopment}>
        comp:{componentName()}
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={""}
          hasFullPermission={hasFullPermission() ?? false}
          hasEditPermission={hasEditPermission() ?? false}
          hasCreatePermission={hasCreatePermission() ?? false}
          hasViewPermission={hasViewPermission() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={props.meta.id}
          mounted={true}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
        <PageRenderContextProvider store={repeaterStore}>
          <Switch>
            <Match when={!previewStore.isDesignMode}>
              <ContentInner />
            </Match>
            <Match when={previewStore.isDesignMode}>
              {(() => {
                const PageAttrDnDWrapper = clientOnly(
                  () =>
                    import(
                      "~/features/page_attr_render/page_attr_dnd_wrapper/components/PageAttrDnDWrapper"
                    ),
                );
                return (
                  <PageAttrDnDWrapper item={props.meta}>
                    <ContentInner />
                  </PageAttrDnDWrapper>
                );
              })()}
            </Match>
          </Switch>
        </PageRenderContextProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
