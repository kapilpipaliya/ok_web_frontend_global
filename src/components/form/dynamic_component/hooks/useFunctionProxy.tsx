import { createMemo, createSignal, getOwner, type Accessor } from "solid-js";
import { useSearchParams, useParams, useLocation, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/styled/modal/Toast";
import { useZIndex } from "~/components/fields/ZIndex";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { createFunctionArgumentBase } from "../functions/function_argument/createFunctionArgumentBase";
import { createFunctionArgumentWithValue } from "../functions/function_argument/createFunctionArgumentWithValue";
import { createDynamicFunctions } from "../functions/function_argument/createDynamicFunctions";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface UseFunctionProxyOptions {
  props: {
    meta: Vertex | undefined;
    data?: Vertex | undefined;
  };
  componentName: Accessor<string>;
  formVertex?: Accessor<any>;
  formId?: string;
  isNoPermissionCheck?: Accessor<boolean>;
  isViewMode?: Accessor<boolean>;
  value: Accessor<unknown>;
  updateValue?: (value: unknown) => void;
  onChange?: (value: unknown) => void;
  hasFullPermission: Accessor<boolean | null | undefined>;
  hasEditPermission: Accessor<boolean | null | undefined>;
  hasCreatePermission: Accessor<boolean | null | undefined>;
  hasViewPermission: Accessor<boolean | null | undefined>;
}

/**
 * Hook to create function proxy and function arguments for components
 * This centralizes the pattern used in DynamicComponent, PageViewWrapper, and ComponentField
 */
export function useFunctionProxy(options: UseFunctionProxyOptions) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const [previewStore] = usePreviewContext();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const zIndex = useZIndex();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const themeToggle = useThemeToggle();
  const owner = getOwner();
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const [mounted, setMounted] = createSignal<null | boolean>(null);

  const parentRenderContext = () =>
    getLastItem(parentItems)?.[0] as
      | { context: FunctionArgumentType }
      | undefined;
  const parentMeta = () => parentRenderContext()?.context.meta;

  // Helper to create function arguments with a given functionProxy
  const createFunctionArgumentGetter = (fnProxy: Record<string, unknown>) => {
    const getFunctionArg = () => {
      // Continue even if meta is undefined - provide maximum possible result
      // Access props reactively so changes are tracked
      return createFunctionArgumentBase(
        options.props as { meta: Vertex; data?: Vertex },
        {
          formVertex: options.formVertex || (() => undefined),
          formId: options.formId,
          componentName: options.componentName,
          isNoPermissionCheck: options.isNoPermissionCheck!,
          isViewMode: options.isViewMode!,
          mounted,
          parentMeta,
          ref,
          setRef,
          updateValue: options.updateValue!,
          onChange: options.onChange!,
          hasFullPermission: options.hasFullPermission,
          hasEditPermission: options.hasEditPermission,
          hasCreatePermission: options.hasCreatePermission,
          hasViewPermission: options.hasViewPermission,
        },
        {
          graph,
          setGraph,
          toast,
          searchParams,
          setSearchParams,
          params,
          zIndex,
          navigate,
          location,
          theme,
          parentItems,
          previewStore,
          themeToggle,
          owner: owner!,
          parentRenderContext,
          functionProxy: fnProxy,
        },
      );
    };

    return createMemo(() =>
      createFunctionArgumentWithValue(getFunctionArg, options.value),
    );
  };

  // Create temporary function proxy that falls back to parent context
  const tempFunctionProxy = createFunctionProxy(
    () => ({}),
    parentRenderContext,
  );

  const getFunctionArgumentWithValueTemp =
    createFunctionArgumentGetter(tempFunctionProxy);

  // Create dynamicFns first using temp function arguments
  const dynamicFns = createDynamicFunctions(
    graph,
    () => options.props.meta,
    getFunctionArgumentWithValueTemp,
    parentRenderContext,
  );

  // Now create the real function proxy with actual dynamicFns
  const functionProxy = createFunctionProxy(
    () => dynamicFns,
    parentRenderContext,
  );

  // Create the final function arguments with real functionProxy
  const getFunctionArgumentWithValue =
    createFunctionArgumentGetter(functionProxy);

  return {
    functionProxy,
    getFunctionArgumentWithValueTemp,
    getFunctionArgumentWithValue,
    ref,
    setRef,
    mounted,
    setMounted,
  };
}
