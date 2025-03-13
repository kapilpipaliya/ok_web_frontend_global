import { createLazyMemo } from "@solid-primitives/memo";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { toTitle } from "case-switcher-js";
import {
  createEffect,
  createMemo,
  createSignal,
  ErrorBoundary,
  getOwner,
  Match,
  on,
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

import {getMetaProps} from "~/components/form/utils/getMetaProps";
import { Label } from "~/features/css_editor/components/fields/Label";
import { cssStateToString } from "~/features/css_editor/utils/cssStateToString";
import { useRepeaterVertexContext } from "~/features/page_attr_render/context/PageAttrContext";
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
import { getComponentLabel } from "~/features/page_designer/functions/getComponentLabel";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { ifNotNull } from "~/lib/data_structure/ifNotNull";
import { evalExpression } from "~/lib/expression_eval";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import {
  IdAttr,
  useGraph,
  type Vertex,
} from "~/lib/graph/graph";
import { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";
import { addNewVertex, mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";

import type { FunctionArgumentType } from "./FieldSchemaType";

import { NotFoundComponent } from "../fields/NotFoundComponent";
import { useZIndex } from "../fields/ZIndex";
import { useToast } from "../styled/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { getDynamicComponent } from "./functions/getDynamicComponent";

export function DynamicComponent(
  props: Readonly<{
    componentName?: string;
    data?: Vertex;
    disabled?: boolean;
    isLabelWrap?: boolean;
    isNoPermissionCheck?: boolean;
    isRealTime?: boolean;
    isTableInside?: boolean;
    meta: Vertex;
    noLabel?: boolean;
    onChange?: (data: any) => void;
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
  const hasInsertPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "insert", graph) ??
      parentRenderContext()?.context.hasInsertPermission
    );
  });

  const hasEditPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "edit", graph) ??
      parentRenderContext()?.context.hasEditPermission
    );
  });
  const hasViewPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "view", graph) ??
      parentRenderContext()?.context.hasViewPermission
    );
  });
  const hasDeletePermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "delete", graph) ??
      parentRenderContext()?.context.hasDeletePermission
    );
  });

  const isNoPermissionCheck = () =>
    !previewStore ||
    props.isNoPermissionCheck ||
    graph.vertexes[formVertex()?.P.formMetaId!]?.P.isNoPermissionCheck ||
    previewStore.isDesignMode ||
    previewStore.isNoPermissionCheck;
  const _hasPermission = () =>
    hasInsertPermission() || hasViewPermission() || hasEditPermission();
  const hasNoPermission = () =>
    !(hasInsertPermission() || hasViewPermission() || hasEditPermission());
  const isDisabledByPermissions = () => {
    if (isNoPermissionCheck()) {
      return undefined;
      // TODO: use correct permission for view, edit and insert, currently if any permission is true, it will return true
      // } else if (props.isViewMode) {
      //     return true;
      // } else if (props.isEditMode) {
      //     return hasEditPermission();
      // } else if (props.isInsertMode) {
      //     return hasInsertPermission();
    }
    const permission = hasInsertPermission() || hasEditPermission();
    return permission ? undefined : true;
  };

  const functionProxy = (key: string) => {
    try {
      if (dynamicProps().fns && key in dynamicProps().fns) {
        return dynamicProps().fns[key];
      }
      return parentRenderContext()?.context.fns(key);
    } catch (error) {
      console.error("Error in functionProxy:", error);
      return undefined;
    }
  };

  const getFunctionArgumentBase = () =>
    ({
      get context() {
        return previewStore.context;
      },
      get data() {
        return props.data;
      },
      get dataContext() {
        return runWithOwner(owner, () => useRepeaterVertexContext() || {});
      },
      error: (key?: string) => {
        const errorVertexId = `${props.data?.id}-error`;
        return graph.vertexes[errorVertexId]?.P[key ?? props.meta.P.key];
      },
      evalExpression,
      fns: functionProxy,
      // formInitialValues,
      // formSchema,
      formId,
      get graph() {
        return graph;
      },
      get hasDeletePermission() {
        return hasDeletePermission();
      },
      get hasEditPermission() {
        return hasEditPermission();
      },
      get hasInsertPermission() {
        return hasInsertPermission();
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
      ref,
      revertTransaction: (txnId: number) =>
        revertTransaction(txnId, graph, setGraph),
      revertTransactionUpToIndex: (txnId: number, txnIndex: number) =>
        revertTransactionUpToIndex(txnId, txnIndex, graph, setGraph),
      runWithOwner: runWithOwnerFunction,
      runWithParentOwner: runWithParentOwnerFunction,
      searchParams,
      setError: (error: string | undefined, key?: string) => {
        const errorVertexId = `${props.data?.id}-error`;
        if (!graph.vertexes[errorVertexId]) {
          addNewVertex(0, {
            id: errorVertexId,
            IN: {},
            L: ["Error"],
            OUT: {},
            P: {
              [key ?? props.meta.P.key]: error || "",
            },
          }, graph, setGraph);
        } else {
          mergeVertexProperties(0, errorVertexId, graph, setGraph, {
            [key ?? props.meta.P.key]: error || "",
          });
        }
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
        return props.txnId!;
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

      if (!(hasInsertPermission() || hasEditPermission())) {
        showErrorToast("You do not have permission to set this value.");
        return;
      }
      const existingValue = props.data?.P[props.meta.P.key];
      if (existingValue === undefined && !hasInsertPermission()) {
        showErrorToast("You do not have insert permission to set this value.");
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

    // TODO: if only insert permission, and value is set dont display it.
    setValueGlobal(
      graph,
      setGraph,
      props.txnId!,
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

  const permissions = createMemo(() => {
    return {
      get hasDeletePermission() {
        return hasDeletePermission();
      },
      get hasEditPermission() {
        return hasEditPermission();
      },
      get hasInsertPermission() {
        return hasInsertPermission();
      },
      get hasViewPermission() {
        return hasViewPermission();
      },
    } as Record<string, boolean | null | undefined>;
  });


  const value = createMemo(() => {
    return ifNotNull(props.data?.P[props.meta.P[IdAttr]]);
  });

  const getFunctionArgumentWithValue = () => {
    return untrack(() => {
      const functionArgumentDescriptors = Object.getOwnPropertyDescriptors(
        getFunctionArgument(),
      );
      const valueDescriptor = Object.getOwnPropertyDescriptors({
        value: value(),
      });
      return Object.defineProperties(
        {},
        { ...functionArgumentDescriptors, ...valueDescriptor },
      ) as FunctionArgumentType;
    });
  };

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
      // Check for hidden property
      const hiddenProp = dynamicProps().hidden ?? props.meta.P.hidden;
      if (hiddenProp !== undefined) {
        const result =
          typeof hiddenProp === "function"
            ? hiddenProp(getFunctionArgumentWithValue())
            : hiddenProp;
        if (result) return true;
      }

      // Check for show property (inverse of hidden)
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
    parentRenderContext()?.context.isViewMode;

  const isReadOnly = () =>
    // @ts-ignore
    props.isReadOnly ??
    dynamicProps().readOnly ??
    props.meta.P.readOnly ??
    parentRenderContext()?.context.readOnly;

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
    "hidden",
    "children",
    "onChange",
    "projections",
    "props",
    "mounted",
    "hideLabel",
    "class",
    "validation",
    "labelClass",
  ];
  const [, otherProps] = splitProps(props.meta.P, ignoreMetaKeys);

  // break the cyclic dependency by creating an intermediate state for the classes.
  const [mergedClasses, setMergedClasses] = createSignal(
    {} as Record<string, string>,
  );

  createEffect(
    on(
      [() => Object.keys(props.meta.P), dynamicProps],
      ([metaPropsKeys, dynamicPropsValues]) => {
        const classes = [
          ...metaPropsKeys.filter((key) => key.toLowerCase().endsWith("class")),
          ...Object.keys(dynamicPropsValues).filter((key) =>
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
            } ${dynamicPropsValues[key] || ""}`.trim();
            return acc;
          },
          {} as Record<string, string>,
        );
        setMergedClasses(classes);
      },
    ),
  );

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
          hidden={null}
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
          isNoPermissionCheck={isNoPermissionCheck()}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          isViewMode={isViewMode()}
          onChange={onChange}
          props={null}
          readOnly={isReadOnly()}
          ref={setRef}
          txnId={props.txnId}
          value={value()}
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
      {/* <Show when={!props.isNoPermissionCheck && getGlobalStore(graph).P.isDevelopment}>
        comp:{componentName()}
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={""}
          hasDeletePermission={hasDeletePermission() ?? false}
          hasEditPermission={hasEditPermission() ?? false}
          hasInsertPermission={hasInsertPermission() ?? false}
          hasViewPermission={hasViewPermission() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={props.meta.id}
          mounted={true}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
      <PageRenderContextProvider store={repeterStore}>
        <Switch>
          <Match when={!component()}>NO INPUT {componentName()}</Match>
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
            when={component() && (isNoPermissionCheck() || !hasNoPermission())}
          >
            <Switch>
              {/* <Match
                when={
                  (props.isLabelWrap ?? true) &&
                  componentName() !== "Label" &&
                  (props.meta.P.label)
                }
              >
                <Label
                  class={mergeCSS(
                    "",
                    props.meta.P.labelClass,
                    { P: { key: "labelClass" } } as unknown as Vertex,
                    props.meta,
                    graph,
                  )}
                  label={props.meta.P.label}
                  required={
                    props.meta.P.validation?.required
                  }
                >
                  <Content />
                </Label>
              </Match> */}
              <Match when={true}>
                <ContentWrapper />
              </Match>
            </Switch>
          </Match>
          <Match when={getGlobalStore(graph).P.isDevelopment}>
            Hidden component
          </Match>
        </Switch>
      </PageRenderContextProvider>
    </>
  );
}
