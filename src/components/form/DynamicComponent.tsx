import { createLazyMemo } from "@solid-primitives/memo";
import { Style } from "@solidjs/meta";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { toTitle } from "case-switcher-js";
import {
  createMemo,
  createSignal,
  ErrorBoundary,
  getOwner,
  Match,
  onCleanup,
  onMount,
  runWithOwner,
  Show,
  splitProps,
  Switch,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { getMetaProps } from "~/components/form/functions/getMetaProps";
import { Label } from "~/features/css_editor/components/fields/Label";
import { cssStateToString } from "~/features/css_editor/utils/cssStateToString";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import {
  PageRenderContextProvider,
  usePageRenderContext,
} from "~/features/page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "~/features/page_attr_render/permissions";
import {
  PreviewContext,
  usePreviewContext,
} from "~/features/page_designer/context/PreviewContext";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { ifNotNull } from "~/lib/data_structure/ifNotNull";
import { evalExpression } from "~/lib/expression_eval";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";

import type { FunctionArgumentType } from "./type/FieldSchemaType";

import { NotFoundComponent } from "../fields/NotFoundComponent";
import { useZIndex } from "../fields/ZIndex";
import { useToast } from "../styled/modal/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { getDynamicComponent } from "./functions/getDynamicComponent";
import { useTheme } from "~/lib/context/ThemeContext";
import { processCssContent } from "~/lib/styles/processCss";
import {
  deleteTxnIdAndCreateNew,
  ensureData,
  removeTxnIdAndCreateNew,
  setError,
} from "./functions/formFunctions";
import { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { createUniqueId } from "~/lib/solid/createUniqueId";
import { createFunctionProxy } from "./createFunctionProxy";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { PermissionLevel } from "~/features/page_attr_render/PermissionLevel";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function DynamicComponent(
  props: Readonly<{
    componentName?: string;
    data?: Vertex;
    disabled?: boolean;
    isLabelWrap?: boolean;
    isNoPermissionCheck?: boolean | null;
    isRealTime?: boolean;
    isTableInside?: boolean;
    meta: Vertex;
    noLabel?: boolean;
    onChange?: (data: unknown) => void;
    title?: string;
    txnId?: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();
  const [ref, setRef] = createSignal(null);
  const [mounted, setMounted] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const zIndex = useZIndex();
  const navigate = useNavigate();
  const theme = useTheme();

  // const [parentItems] = usePageRenderVertexContext();
  // const parentComponent = createMemo(() => getComponentLabel(graph, getLastItem(parentItems?.vertexes || [], 2))?.P[IdAttr]);
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const parentMeta = () => parentRenderContext()?.context.meta;
  const [previewStore, setPreviewStore] = usePreviewContext();
  const owner = getOwner();

  const runWithOwnerFunction = <T,>(fn: () => T): T | undefined => {
    try {
      return runWithOwner(owner, () => {
        return fn();
      });
    } catch (error) {
      console.error("Error in runWithOwnerFunction:", error);
      return undefined;
    }
  };

  const runWithParentOwnerFunction = <T,>(fn: () => T): T | undefined => {
    try {
      if (parentRenderContext()) {
        return runWithOwner(parentRenderContext()?.context.owner!, () => {
          return fn();
        });
      }
    } catch (error) {
      console.error("Error in runWithParentOwnerFunction:", error);
      return undefined;
    }
  };

  const allConfiguredPermission = createLazyMemo(() =>
    getConfiguredPermissions(
      getGlobalStore(graph).P.userRoles,
      props.meta,
      graph,
    ),
  );
  const hasCreatePermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.CREATE) ??
      parentRenderContext()?.context?.hasCreatePermission ??
      (previewStore.hasEditPermission || previewStore.hasFullPermission)
    );
  });

  const hasEditPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.EDIT) ??
      parentRenderContext()?.context?.hasEditPermission ??
      previewStore.hasFullPermission
    );
  });
  const hasViewPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.VIEW) ??
      parentRenderContext()?.context?.hasViewPermission ??
      (previewStore.hasCreatePermission ||
        previewStore.hasEditPermission ||
        previewStore.hasFullPermission)
    );
  });
  const hasFullPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.FULL) ??
      parentRenderContext()?.context?.hasFullPermission ??
      previewStore.hasFullPermission
    );
  });

  const isNoPermissionCheck = () =>
    !previewStore ||
    props.isNoPermissionCheck ||
    graph.vertexes[formVertex()?.P.formMetaId!]?.P.isNoPermissionCheck ||
    previewStore.isDesignMode ||
    previewStore.isNoPermissionCheck;

  const hasPermission = () => {
    // If no permission check is needed, user has permissions
    if (isNoPermissionCheck()) {
      return true;
    }

    // Check if user has any valid permission level
    // Following the hierarchy: FULL > EDIT > CREATE > VIEW
    // Having a higher permission implicitly grants lower permissions
    return (
      hasFullPermission() ||
      hasEditPermission() ||
      hasCreatePermission() ||
      hasViewPermission()
    );
  };

  const isDisabledByPermissions = () => {
    if (isNoPermissionCheck()) {
      return undefined;
    }
    const permission = hasCreatePermission() || hasEditPermission();
    return permission ? undefined : true;
  };
  const permissions = createMemo(() => {
    return {
      get hasFullPermission() {
        return hasFullPermission();
      },
      get hasEditPermission() {
        return hasEditPermission();
      },
      get hasCreatePermission() {
        return hasCreatePermission();
      },
      get hasViewPermission() {
        return hasViewPermission();
      },
    } as Record<string, boolean | null | undefined>;
  });

  const getFunctionArgumentBase = () =>
    ({
      clearAllErrors: () => {
        const errorVertexId = `${props.data?.id}-error`;
        replaceVertexProperties(0, errorVertexId, graph, setGraph, {});
      },
      get componentName() {
        return componentName();
      },
      get context() {
        return previewStore.context;
      },
      get data() {
        return props.data;
      },
      get contextData() {
        return runWithOwner(owner, () => useDataContext() || {});
      },
      deleteTxnIdAndCreateNew: (txnId: number) => {
        return deleteTxnIdAndCreateNew(txnId, formId!, graph, setGraph);
      },
      // on create save dataVertex is is changed, so its not available. so this will create new dataVertex again.
      ensureData: () => {
        return ensureData(props.data?.id, formId!, formVertex, graph, setGraph);
      },
      error: (key?: string) => {
        const errorVertexId = `${props.data?.id}-error`;
        return graph.vertexes[errorVertexId]?.P[key ?? props.meta.P.key];
      },
      evalExpression,
      mergeVertexProperties,
      get fns() {
        return functionProxy;
      },
      // formInitialValues,
      // formSchema,
      formId,
      get graph() {
        return graph;
      },
      get hasFullPermission() {
        return hasFullPermission();
      },
      get hasEditPermission() {
        return hasEditPermission();
      },
      get hasCreatePermission() {
        return hasCreatePermission();
      },
      get hasViewPermission() {
        return hasViewPermission();
      },
      get isNoPermissionCheck() {
        return isNoPermissionCheck();
      },
      get isViewMode() {
        return isViewMode();
      },
      get meta() {
        return props.meta;
      },
      mounted,
      navigate,
      onChange,
      owner,
      parentItems,
      get parentMeta() {
        return parentMeta();
      },
      parentRenderContext: parentRenderContext(),
      get readOnly() {
        return isReadOnly();
      },
      theme,
      ref,
      removeTxnIdAndCreateNew: (txnId: number) => {
        return removeTxnIdAndCreateNew(txnId, formId!, graph, setGraph);
      },
      revertTransaction: (txnId: number) =>
        revertTransaction(txnId, graph, setGraph),
      revertTransactionUpToIndex: (txnId: number, txnIndex: number) =>
        revertTransactionUpToIndex(txnId, txnIndex, graph, setGraph),
      runWithOwner: runWithOwnerFunction,
      runWithParentOwner: runWithParentOwnerFunction,
      searchParams,
      setError: (error: string | undefined, key?: string) => {
        const errorVertexId = `${props.data?.id}-error`;
        setError(
          errorVertexId,
          key ?? props.meta.P.key,
          error,
          graph,
          setGraph,
        );
      },
      get setGraph() {
        return setGraph;
      },
      setGraphData: (
        txnId: number,
        args: Parameters<typeof setGraphDataWithTransaction>[3],
        options: Parameters<typeof setGraphDataWithTransaction>[4],
      ) => {
        setGraphDataWithTransaction(txnId, graph, setGraph, args, options);
      },
      setSearchParams,
      showErrorToast,
      showSuccessToast,
      showWarningToast,
      get txnId() {
        return formVertex()?.P.txnId!;
      },
      updateValue,
      zIndex,
    }) as Omit<FunctionArgumentType, "parentValue" | "projections" | "value">;

  const getFunctionArgument = (): Omit<FunctionArgumentType, "value"> => {
    const baseArguments = getFunctionArgumentBase();

    return Object.assign(baseArguments, {});
  };

  function updateValue(newValue: unknown) {
    // Check if the user has the appropriate permissions for the specific field
    /*if (!hasFieldPermission(props.meta.P.key)) {
      showErrorToast("You do not have permission to modify this field.");
      return;
      }*/

    if (!isNoPermissionCheck()) {
      if (previewStore.isViewOnly) {
        showErrorToast("You do not have permission to modify this field.");
        return;
      }

      if (!(hasCreatePermission() || hasEditPermission())) {
        showErrorToast("You do not have permission to set this value.");
        return;
      }
      const existingValue = props.data?.P[props.meta.P.key];
      if (existingValue === undefined && !hasCreatePermission()) {
        showErrorToast("You do not have create permission to set this value.");
        return;
      }

      // Additional checks, e.g., role-based or context-sensitive permissions
      /*if (!hasRolePermission('editor') || !isOwnerOfData(props.data)) {
        showErrorToast("You do not have the necessary permissions to modify this data.");
        return;
      }*/
    }

    // Log the action for auditing purposes
    // logAction('modify', props.meta.P.key, value, currentUser);

    // TODO: if only create permission, and value is set dont display it.
    setValueGlobal(
      graph,
      setGraph,
      formVertex()?.P.txnId!,
      props.meta,
      props.data!,
      newValue,
      false,
    );
  }

  const onChange = (value: unknown) => {
    if (props.onChange) {
      props.onChange(value);
    } else {
      updateValue(value);
    }
  };

  const value = createMemo(() => {
    return ifNotNull(props.data?.P[props.meta.P[IdAttr]]);
  });

  const getFunctionArgumentWithValue = () => {
    return untrack(() => {
      const functionArgumentDescriptors = Object.getOwnPropertyDescriptors(
        getFunctionArgument(),
      );
      const valueDescriptor = {
        value: {
          get: () => value(),
          enumerable: true,
          configurable: true,
        },
      };
      return Object.defineProperties(
        {},
        { ...functionArgumentDescriptors, ...valueDescriptor },
      ) as FunctionArgumentType;
    });
  };
  const dynamicFns = createMemo(() => {
    try {
      // Helper to evaluate fns from a vertex
      const evaluateFns = (
        fns:
          | ((args: FunctionArgumentType) => Record<string, unknown>)
          | string
          | undefined
          | null,
      ) => {
        if (typeof fns === "function") {
          return fns(getFunctionArgumentWithValue());
        }
        if (typeof fns === "string") {
          try {
            return new Function("args", fns)(getFunctionArgumentWithValue());
          } catch (error) {
            console.error("Error evaluating fns:", error);
            return undefined;
          }
        }
        return undefined;
      };

      // For Component type, merge fns from component vertex and meta
      if (props.meta.P.componentName === "Component") {
        const componentVertex = (
          evalExpression("->$0Comp", {
            graph,
            setGraph,
            vertexes: [props.meta],
          }) as Vertex[]
        )?.[0];

        return new Proxy(
          {},
          {
            get(_, key: string) {
              const metaFns = evaluateFns(props.meta.P.fns);
              if (metaFns && key in metaFns) return metaFns[key];
              const componentFns = evaluateFns(componentVertex.P.fns);
              if (componentFns && key in componentFns) return componentFns[key];
              return parentRenderContext()?.context?.fns?.[key];
            },
          },
        );
      }

      // For other components, just use meta fns
      return (
        evaluateFns(props.meta.P.fns) ??
        parentRenderContext()?.context?.fns ??
        {}
      );
    } catch (error) {
      console.error("Error in dynamicFns:", error);
      return parentRenderContext()?.context?.fns ?? {};
    }
  });

  const functionProxy = createFunctionProxy(dynamicFns, parentRenderContext);
  const dynamicProps = createMemo(() => {
    try {
      if (typeof props.meta.P.props === "function") {
        const dynamicPropsObj =
          props.meta.P.props!(getFunctionArgumentWithValue()) || {};
        return getMetaProps(dynamicPropsObj, [], graph);
      }
      if (typeof props.meta.P.props === "string") {
        try {
          const propsFunction = new Function("args", props.meta.P.props);
          const dynamicPropsObj =
            propsFunction(getFunctionArgumentWithValue()) || {};
          return getMetaProps(dynamicPropsObj, [], graph);
        } catch (error) {
          console.error("Error evaluating props function:", error);
          return {};
        }
      }
      return {};
    } catch (error) {
      console.error("Error in dynamicProps:", error);
      return {};
    }
  });

  const styleId = createUniqueId();
  const cssStyle = createMemo(() => {
    try {
      const functionArgs = getFunctionArgumentWithValue();
      return processCssContent(props.meta.P.css, functionArgs, styleId);
    } catch (error) {
      console.error("Error in css:", error);
      return "";
    }
  });

  const componentName = createMemo(() => {
    try {
      if (dynamicProps().componentName) {
        return dynamicProps().componentName;
      }
      let componentLabel: string | undefined;
      if (props.componentName) {
        componentLabel = props.componentName;
        return componentLabel;
      }
      const { componentName } = props.meta.P;
      if (componentName) {
        componentLabel = componentName;
      }
      if (!componentLabel) {
        componentLabel = getComponentLabel(graph, props.meta);
      }
      if (!componentLabel) {
        return "Html";
      }
      if (typeof componentLabel === "string") {
        return componentLabel;
      }
      return componentLabel;
    } catch (error) {
      console.error("Error in componentName:", error);
      return "NotFoundComponent";
    }
  });

  const component = createMemo(() =>
    typeof componentName() === "function"
      ? componentName()
      : getDynamicComponent(componentName()) || NotFoundComponent,
  );
  const isHidden = () => {
    try {
      // Check for hide property
      const hiddenProp = dynamicProps().hide ?? props.meta.P.hide;
      if (hiddenProp !== undefined) {
        const result =
          typeof hiddenProp === "function"
            ? hiddenProp(getFunctionArgumentWithValue())
            : hiddenProp;
        if (result) {
          return true;
        }
      }

      // Check for show property (inverse of hide)
      const showProp = dynamicProps().show ?? props.meta.P.show;
      if (showProp !== undefined) {
        const result =
          typeof showProp === "function"
            ? showProp(getFunctionArgumentWithValue())
            : showProp;
        return !result;
      }

      return false;
    } catch (error) {
      console.error("Error in isHidden:", error);
      return false;
    }
  };

  const isViewMode = () =>
    // @ts-ignore
    props.isViewMode ??
    props.meta.P.isViewMode ??
    parentRenderContext()?.context?.isViewMode;

  const isReadOnly = () =>
    // @ts-ignore
    props.isReadOnly ??
    dynamicProps().readOnly ??
    props.meta.P.readOnly ??
    parentRenderContext()?.context?.readOnly;

  const repeterStore = createStore({
    get context() {
      return getFunctionArgumentWithValue();
    },
  });

  if (dynamicProps().beforeMount) {
    try {
      runWithOwner(owner, () => {
        dynamicProps().beforeMount!(getFunctionArgumentWithValue());
      });
    } catch (error) {
      console.error("Error in beforeMount:", error);
    }
  }

  onMount(() => {
    try {
      setMounted(true);
      // props.meta.mounted = true;
      runWithOwner(owner, () => {
        const onMountResult = dynamicProps().onMount?.();
        if (typeof onMountResult === "function") {
          onCleanup(onMountResult);
        }
      });
    } catch (error) {
      console.error("Error in onMount:", error);
    }
  });

  onCleanup(() => {
    try {
      setMounted(false);
      if (dynamicProps().onUnmount) {
        runWithOwner(owner, () => {
          dynamicProps().onUnmount!(getFunctionArgumentWithValue());
        });
      }
    } catch (error) {
      console.error("Error in onCleanup:", error);
    }
  });

  const previewStoreProxy = new Proxy(previewStore, {
    get(target, prop) {
      if (prop === "isDesignMode") {
        return false;
      }
      if (prop === "isDesignModePrev") {
        return target.isDesignMode;
      }
      return target[prop as keyof typeof target];
    },
  });

  const ignoreMetaKeys = [
    "hide",
    "children",
    "projections",
    "props",
    "fns",
    "mounted",
    "hideLabel",
    "class",
    "validation",
    "labelClass",
    "key",
    "displayOrder",
    "isNoPermissionCheck",
    "css",
  ];
  const [, otherProps] = splitProps(props.meta.P, ignoreMetaKeys);

  const mergedClasses = createMemo(() => {
    const metaPropsKeys = Object.keys(props.meta.P);
    const dynamicPropsValue = dynamicProps();
    const style = cssStyle();

    const classes = [
      ...metaPropsKeys.filter((key) => key.toLowerCase().endsWith("class")),
      ...Object.keys(dynamicPropsValue).filter((key) =>
        key.toLowerCase().endsWith("class"),
      ),
    ].reduce(
      (acc, key) => {
        if (acc[key]) {
          return acc;
        }
        const cssValue = props.meta.P[key];
        acc[key] = `${
          cssStateToString(
            cssValue,
            { P: { key: key } } as unknown as Vertex,
            props.meta,
            graph,
          ) || ""
        } ${dynamicPropsValue[key] || ""}`.trim();
        return acc;
      },
      {} as Record<string, string>,
    );

    if (style) {
      if (classes.class) {
        classes.class = `${classes.class} ${styleId}`;
      } else {
        classes.class = styleId;
      }
    }

    return classes;
  });

  const Content = () => (
    <>
      <ErrorBoundary
        fallback={(err) => {
          console.error(err);
          return <div>Error: {err.message}</div>;
        }}
      >
        <Dynamic
          {...otherProps}
          {...dynamicProps()}
          // remove extra props, to reduce ssr size
          componentName={null}
          hide={null}
          {...mergedClasses()}
          {...permissions()}
          component={component()}
          disabled={
            isNoPermissionCheck()
              ? props.meta.P.disabled
              : (props.disabled ??
                previewStore.isViewOnly ??
                isDisabledByPermissions() ??
                props.meta.P.disabled)
          }
          // isNoPermissionCheck={isNoPermissionCheck()}
          // isRealTime={props.isRealTime}
          // isTableInside={props.isTableInside}
          // isViewMode={isViewMode()}
          // onChange={onChange}
          props={null}
          readOnly={isReadOnly()}
          ref={setRef}
          // value={value()}
        >
          <Show
            fallback={
              <Show when={props.meta.id}>
                <PageAttrRender
                  data={props.data}
                  isNoPermissionCheck={isNoPermissionCheck()}
                  metaVertex={props.meta}
                />
              </Show>
            }
            // @ts-expect-error
            when={props.children}
          >
            {/* @ts-expect-error */}
            {props.children}
          </Show>
        </Dynamic>
      </ErrorBoundary>
    </>
  );

  const ContentWrapper = () => {
    return (
      <Switch>
        <Match when={componentName() === "Component"}>
          <PreviewContext.Provider value={[previewStoreProxy, setPreviewStore]}>
            <Content />
          </PreviewContext.Provider>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    );
  };

  return (
    <>
      <Show when={cssStyle()}>
        <Style>{cssStyle()}</Style>
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
      <PageRenderContextProvider store={repeterStore}>
        <Switch>
          <Match when={!component()}>
            NO INPUT {componentName() as string}
          </Match>
          {/* @ts-ignore */}
          <Match when={isHidden()} />
          <Match
            when={
              typeof componentName() !== "function" &&
              componentName()?.startsWith("System") &&
              !props.noLabel &&
              !props.meta.P.noLabel
            }
          >
            <Label
              class={cssStateToString(
                props.meta.P.labelClass,
                { P: { key: "labelClass" } } as unknown as Vertex,
                props.data!,
                graph,
              )}
              label={
                // @ts-ignore
                props.label || props.meta.P.label || toTitle(props.meta.P.key)
              }
              layoutClass={props.meta.P.labelLayoutClass}
              position={props.meta.P.labelPosition}
              required={props.meta.P.validation?.required}
              //tooltip={(props.meta).P.tooltip}
            >
              <ContentWrapper />
            </Label>
          </Match>
          <Match
            keyed
            when={component() && (isNoPermissionCheck() || hasPermission())}
          >
            <ContentWrapper />
          </Match>
          <Match when={getGlobalStore(graph).P.isDevelopment}>
            Hidden component
          </Match>
        </Switch>
      </PageRenderContextProvider>
    </>
  );
}
