import { createLazyMemo } from "@solid-primitives/memo";
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
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { ifNotNull } from "~/lib/data_structure/ifNotNull";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import {
  type GraphInterface,
  IdAttr,
  useGraph,
  type Vertex,
} from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
import { NotFoundComponent } from "../fields/NotFoundComponent";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import {
  PageRenderContextProvider,
  usePageRenderContext,
} from "../page_attr_render/PageRenderContext";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "../page_attr_render/permissions";
import { evaluateRule } from "../page_designer/rules/functions/evaluateRule";
import { Label } from "../solid_blocks/Label";
import { useToast } from "../Toast";
import { useFormContext } from "./FormContext";
import { getDynamicComponent } from "./functions/getDynamicComponent";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useZIndex } from "../ZIndex";
import { ComponentNameType, FunctionArgumentType } from "./FieldSchemaType";

export function getText(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  return (
    (getSelectionOptions(graph, setGraph, projection, repeaterContext)
      .vertexes as string) || projection
  );
}

export function getUrl(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  const url = getSelectionOptions(graph, setGraph, projection, repeaterContext)
    .vertexes as string | undefined;
  return typeof url === "string" && url.startsWith("/") ? url : undefined;
}

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
  const [formStore, setFormStore] = useFormContext();
  const { showErrorToast } = useToast();
  const [ref, setRef] = createSignal(null);
  const [mounted, setMounted] = createSignal(false);
  const zIndex = useZIndex();

  // const [parentItems] = usePageRenderVertexContext();
  // const parentComponent = createMemo(() => getCompFallbackToString(getLastItem(parentItems?.vertexes || [], 2), graph)?.P[IdAttr]);
  
  const parentRenderItems = usePageRenderContext() || [];
  const parentRenderContext = () => getLastItem(parentRenderItems)?.[0];
  const parentMeta = () => parentRenderContext()?.meta;
  const [previewStore] = usePreviewContext();
  const owner = getOwner();

  const runWithOwnerFunction = <T,>(fn: () => T): T | undefined => {
    return runWithOwner(owner, () => {
      return fn();
    });
  };
  const runWithParentOwnerFunction = <T,>(fn: () => T): T | undefined => {
    return runWithOwner(parentRenderContext()!.context.owner, () => {
      return fn();
    });
  };
  // Should also use repeaterContext
  // const repeaterContext = useRepeaterVertexContext();

  // Extra properties to be added
  const extraRuleProperties = createMemo(() => {
    const propertyRuleMap = new Map<string, Vertex>();
    for (const edgeType in props.meta.OUT) {
      for (const edge of props.meta.OUT[edgeType]) {
        const endVertex = graph.vertexes[graph.edges[edge].E];
        if (endVertex.L[0] === "Rule") {
          let propertyName = edgeType.replace(/^Attr/g, "");
          // Lowercase the first letter
          propertyName =
            propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
          propertyRuleMap.set(propertyName, endVertex); // Save endVertex in the value
        }
      }
    }
    return propertyRuleMap;
  });


  const allConfiguredPermission = createLazyMemo(() =>
    getConfiguredPermissions(graph.userRoles, props.meta, graph, setGraph),
  );
  const hasInsertPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "insert", graph, setGraph) ??
      parentRenderItems?.[0]?.hasInsertPermission
    );
  });
  const hasEditPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "edit", graph, setGraph) ??
      parentRenderItems?.[0]?.hasEditPermission
    );
  });
  const hasViewPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "view", graph, setGraph) ??
      parentRenderItems?.[0]?.hasViewPermission
    );
  });
  const hasDeletePermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), "delete", graph, setGraph) ??
      parentRenderItems?.[0]?.hasDeletePermission
    );
  });

  const isNoPermissionCheck = () =>
    !previewStore ||
    props.isNoPermissionCheck ||
    formStore?.formMeta?.P.isNoPermissionCheck ||
    previewStore.isDesignMode ||
    previewStore.isNoPermissionCheck;
  const hasPermission = () =>
    hasInsertPermission() || hasViewPermission() || hasEditPermission();
  const hasNoPermission = () =>
    !(hasInsertPermission() || hasViewPermission() || hasEditPermission());
  const isDisabledPermission = () => {
    return isNoPermissionCheck() ? undefined : hasPermission();
  }

  const getFunctionArgumentBase = () =>
    ({
      // formInitialValues,
      // formSchema,
      formStore,
      meta: props.meta,
      mounted,
      onChange,
      owner,
      parentItems: parentRenderItems,
      get parentMeta() {
        return parentMeta();
      },
      ref,
      runWithOwner: runWithOwnerFunction,
      runWithParentOwner: runWithParentOwnerFunction,
      setFormStore,
      get isViewMode() {
        return isViewMode();
      },
      get readOnly() {
        return isReadOnly();
      },
      zIndex,

    }) as Omit<FunctionArgumentType, "parentValue" | "projections" | "value">;

  const getFunctionArgument = (): Omit<FunctionArgumentType, "value"> => {
    const baseArguments = getFunctionArgumentBase();

    return Object.assign({}, baseArguments, {
    });
  };

  const onChange = (value: unknown) => {
    if (props.onChange) {
      props.onChange(value);
    } else {
      const existingValue = props.data?.P[props.meta.P.key];
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
        if (existingValue === undefined && !hasInsertPermission()) {
          showErrorToast(
            "You do not have insert permission to set this value.",
          );
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
        value,
        false,
      );
    }
  };

  const expressionProperties = createMemo(() => {
    const values = {
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
    } as Record<string, any>;
    for (const [property, rule] of extraRuleProperties().entries()) {
      if (property === "disabled" && previewStore.isDesignMode) {
        continue;
      }
      if (property === "hidden" && previewStore.isDesignMode) {
        continue;
      }
      if (formStore?.formData && rule) {
        try {
          values[property] = evaluateRule(
            rule,
            formStore.formData,
            graph,
            setGraph,
          );
          if (property.toLowerCase().endsWith("class")) {
            values[property] = mergeCSS(
              "",
              values[property],
              { P: { key: property } } as unknown as Vertex,
              props.meta,
              graph,
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          /* empty */
        }
      }
    }

    return values;
  });

  const ignoreMetaKeys = [
    "hidden",
    "children",
    "onChange",
    "projections",
    "otherProps",
    "onMount",
    "beforeMount",
    "mounted",
    "hideLabel",

    "validation",
    "labelClass",
  ];

  const deNullifyAndMergeCSS = createMemo(() => {
    const result: Record<string, any> = {};

    for (const key in props.meta.P) {
      if (ignoreMetaKeys.includes(key)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(props.meta.P, key);

      if (descriptor) {
        // Handle properties with getters
        if (descriptor.get) {
          // TODO: there is issue here, why use class compore on if and else both conditions?
          if (key.toLowerCase().endsWith("class")) {
            const value = props.meta.P[key];
            if (value !== null) {
              result[key] = mergeCSS(
                "",
                value,
                { P: { key: key } } as unknown as Vertex,
                props.meta,
                graph,
              );
            }
          } else {
            Object.defineProperty(result, key, descriptor);
          }
        } else {
          // Handle properties without getters
          const value = descriptor.value;
          if (value !== null) {
            result[key] = key.toLowerCase().endsWith("class")
              ? mergeCSS(
                  "",
                  value,
                  { P: { key: key } } as unknown as Vertex,
                  props.meta,
                  graph,
                )
              : value;
          }
        }
      }
    }

    return result;
  });

  const DisplayError = () => (
    <Show when={props.meta.P.error}>
      <div class="fg:rgb(255,0,0)">{props.meta.P.error}</div>
    </Show>
  );

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

  const componentName = createMemo(() => {
    if (props.componentName) {
      return props.componentName;
    }
    const { componentName } = props.meta.P;
    if (!componentName) {
      return "NotFoundComponent";
    }
    if (typeof componentName === "string") {
      return componentName;
    }
    return typeof componentName === "function"
      ? (componentName as ComponentNameType)(getFunctionArgumentWithValue())
      : componentName;
  });

  const component = createMemo(
    () => getDynamicComponent(componentName()) || NotFoundComponent,
  );

  const getMetaProps = (
    meta: Record<string, any>,
    ignoreKeys: string[],
  ): Record<string, any> => {
    const result = {} as Record<string, any>;

    for (const key in meta) {
      if (ignoreKeys.includes(key)) {
        continue;
      }

      const value = meta[key];
      if (typeof value === "function") {
        result[key] = (...args: unknown[]) =>
          runWithOwner(owner, () => {
            const functionArgs = getFunctionArgumentWithValue();
            return (meta[key] as (...args: unknown[]) => unknown)(
              Object.assign(functionArgs, { args }),
            );
          });
      } else if (value !== null) {
        result[key] = value;
      }
    }
    return result;
  };

  const dynamicProps = createMemo(() => {
    if (typeof props.meta.P.otherProps === "function") {
      const dynamicPropsObj =
        (props.meta.P.otherProps!(
          getFunctionArgumentWithValue(),
        )) || {};
      return getMetaProps(dynamicPropsObj, []);
    } else if (typeof props.meta.P.otherProps === "string") {
      try {
        const otherPropsFunction = new Function(
          "args",
          props.meta.P.otherProps
        );
        const dynamicPropsObj = otherPropsFunction(getFunctionArgumentWithValue()) || {};
        return getMetaProps(dynamicPropsObj, []);
      } catch (error) {
        console.error("Error evaluating otherProps function:", error);
        return {};
      }
    }
    return {};
  });

  const isHidden = () => {
    const hiddenProp =
      dynamicProps().hidden ?? props.meta.P.hidden;
    const result =
      typeof hiddenProp === "function"
        ? hiddenProp(getFunctionArgumentWithValue())
        : hiddenProp;
    return result;
  };


  const isViewMode = () =>
    // @ts-ignore
    props.isViewMode ??
    props.meta.P.isViewMode ??
    parentRenderContext()?.isViewMode;

  const isReadOnly = () =>
    // @ts-ignore
    props.isReadOnly ??
    (dynamicProps()).readOnly ??
    props.meta.P.readOnly ??
    parentRenderContext()?.readOnly;

  const repeterStore = createStore({
    data: [] as Vertex[],
    get context() {
      return getFunctionArgumentWithValue();
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
    vertexes: [] as Vertex[],
  });

  if (dynamicProps().beforeMount) {
    runWithOwner(owner, () => {
      dynamicProps().beforeMount!(getFunctionArgumentWithValue());
    });
  }

  onMount(() => {
    setMounted(true);
    // props.meta.mounted = true;
    runWithOwner(owner, () => {
      const onMountResult = dynamicProps().onMount?.(
        getFunctionArgumentWithValue(),
      );
      if (typeof onMountResult === "function") {
        onCleanup(onMountResult);
      }
    });
  });
  onCleanup(() => {
    setMounted(false);
    if (dynamicProps().onUnmount) {
      // props.meta.mounted = false;
      runWithOwner(owner, () => {
        dynamicProps().onUnmount!(getFunctionArgumentWithValue());
      });
    }
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
          {...deNullifyAndMergeCSS()}
          component={component()}
          // componentName={componentName()}
          isNoPermissionCheck={isNoPermissionCheck()}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          onChange={onChange}
          txnId={props.txnId}
          value={value()}
          ref={setRef}
          {...expressionProperties()}
          disabled={
            isNoPermissionCheck()
              ? props.meta.P.disabled
              : props.disabled ??
                previewStore.isViewOnly ??
                isDisabledPermission() ??
                expressionProperties().disabled ??
                props.meta.P.disabled
          }
          // added:
          isViewMode={isViewMode()}
          readOnly={isReadOnly()}
          {...dynamicProps()}
        >
          <Show
            fallback={<Show when={props.meta.id}>
              <PageAttrRender data={props.data} metaVertex={props.meta} />
            </Show>}
            // @ts-ignore
            when={props.children}
          >
            {/* @ts-ignore */}
            {props.children}
          </Show>
        </Dynamic>
      </ErrorBoundary>
      <DisplayError />
    </>
  );

  return (
    <>
      {/* <Show when={!props.isNoPermissionCheck && graph.isDevelopment}>
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
          userRoles={graph.userRoles}
        />
      </Show> */}
      <PageRenderContextProvider
        data={props.data!}
        meta={props.meta}
        store={repeterStore}
      >
        <Switch>
          <Match when={!component()}>NO INPUT {componentName()}</Match>
          {/* @ts-ignore */}
          <Match when={isHidden()}></Match>
          <Match
            when={
              (componentName()?.startsWith("System") ||
                componentName() === "Select" ||
                componentName() === "MultiSelect") &&
              !props.noLabel &&
              !props.meta.P.noLabel
            }
          >
            <Label
              class={mergeCSS(
                "",
                props.meta.P.labelClass,
                { P: { key: "labelClass" } } as unknown as Vertex,
                props.data!,
                graph,
              )}
              label={
                // @ts-ignore
                props.label ||
                expressionProperties().label ||
                props.meta.P.label ||
                toTitle(props.meta.P.key)
              }
              layoutClass={props.meta.P.labelLayoutClass}
              position={props.meta.P.labelPosition}
              required={
                props.meta.P.validation?.required ||
                expressionProperties().required
              }
              //tooltip={(props.meta).P.tooltip}
            >
              <Content />
            </Label>
          </Match>
          <Match
            keyed
            when={
              !expressionProperties().hidden &&
              component() &&
              (isNoPermissionCheck() || !hasNoPermission())
            }
          > 
            <Switch>
              {/* <Match
                when={
                  (props.isLabelWrap ?? true) &&
                  componentName() !== "Label" &&
                  (expressionProperties().label || props.meta.P.label)
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
                  label={expressionProperties().label || props.meta.P.label}
                  required={
                    props.meta.P.validation?.required ||
                    expressionProperties().required
                  }
                >
                  <Content />
                </Label>
              </Match> */}
              <Match when={true}>
                <Content />
              </Match>
            </Switch>
          </Match>
        </Switch>
      </PageRenderContextProvider>
    </>
  );
}
const _inputTypes = {
  color: "color",
  date: "date",
  "datetime-local": "datetime-local",
  email: "email",
  file: "file",
  image: "image",
  month: "month",
  number: "number",
  password: "password",
  radio: "radio",
  range: "range",
  reset: "reset",
  search: "search",
  tel: "tel",
  text: "text",
  time: "time",
  url: "url",
  week: "week",
};
/*
        <Match when={componentName() === "Select"}>
          <MultiSelectField
            disable={props.disabled}
            displayValueKey="::'P.displayName'||::'P.key'||::'P.id'"
            onRemove={(value: any) => handleChange(value)}
            onSelect={(value: any) => handleChange(value)}
            optionValueKey="id"
            options={props.meta?.P.options ?? []}
            selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
            selectionLimit={1}
          />
          <DisplayError />
        </Match>
        <Match when={componentName() === "RadioGroup"}>
          <RadioGroup disabled={props.disabled}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </RadioGroup>
          <DisplayError />
        </Match>
        
        */

/*
  <Match when={componentName() === "TabContainer"}>
    <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
  </Match>
  <Match when={componentName() === "TabList"}>
    <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
  </Match>
  <Match when={componentName() === "Icon"}>
    <Icon
      height={local.meta.P.height || "24"}
      icon={local.meta.P.icon}
      width={local.meta.P.width || "24"}
      {...deNullify(local.meta.P)}
      class={mergeCSS("", local.meta.P.class)}
      disabled={local.disabled}
    />
  </Match>

  <Match when={componentName() === "Table"}>
    <Table
      headers={
        getSelectionOptions(graph, setGraph, "->Attr", [local.meta])
          .vertexes?.length || 0
      }
      {...deNullify(local.meta.P)}
      class={mergeCSS("", local.meta.P.class)}
      disabled={local.disabled}
    >
      <PageAttrRender data={local.data} metaVertex={local.meta} />
    </Table>
  </Match>
  <Match
    when={
      componentName() === "TableHeader" &&
      getSelectionOptions(graph, setGraph, "->Attr", [local.meta])
        .vertexes?.length
    }
  >
    <TableHeadCell class={"h:5 p:10 text:center"} disabled={local.disabled}>
      <PageAttrRender data={local.data} metaVertex={local.meta} />
    </TableHeadCell>
  </Match>
  <Match when={componentName() === "TableRow"}>
    <TableBodyCell class={"b:1px|solid|#000 bg:#ffffff h:50 text:center"} disabled={local.disabled}>
      <PageAttrRender data={local.data} metaVertex={local.meta} />
    </TableBodyCell>
  </Match>

  <Match when={componentName() === "TreeViewItem"}>
    <TreeView disabled={local.disabled} meta={local.meta} title={local.meta.P?.title ?? "MenuItem"}>
      <PageAttrRender data={local.data} metaVertex={local.meta} />
    </TreeView>
  </Match>
  <Match when={componentName() === "TreeViewChild"}>
    <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
  </Match>


  <Match when={componentName() === "Divider"}>
    <hr
      {...deNullify(local.meta.P)}
      class={` ${mergeCSS("", local.meta.P.class)} color:${local.meta.P.color ?? "lightgrey"} h:${local.meta.P.height ?? "2"} w:full`}
      disabled={local.disabled}
    />
  </Match>


  <Match when={componentName() === "Label"}>
    <Label
      meta={local.meta}
      {...deNullify(local.meta.P)}
      class={mergeCSS("", local.meta.P.class)}
      disabled={local.disabled}
    >
      <PageAttrRender data={local.data} metaVertex={local.meta} />
    </Label>
  </Match>
*/
