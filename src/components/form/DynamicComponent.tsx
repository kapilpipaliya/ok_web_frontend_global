import { createLazyMemo } from "@solid-primitives/memo";
import { createMemo, ErrorBoundary, Match, Show, splitProps, Switch } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
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
    onChange?: (data: any) => void;
    title?: string;
    txnId?: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [formStore] = useFormContext();
  const { showErrorToast } = useToast();

  const componentName = () => props.componentName ?? props.meta.P.componentName;
  // const [parentItems] = usePageRenderVertexContext();
  // const parentComponent = createMemo(() => getCompFallbackToString(getLastItem(parentItems?.vertexes || [], 2), graph)?.P[IdAttr]);

  const component = createMemo(() => getDynamicComponent(componentName()));

  const [selectedProps, customMetaProps] = splitProps(props.meta.P, [
    "validation",
    "labelClass",
  ]);

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

  const parentRenderItems = usePageRenderContext();
  const [previewStore] = usePreviewContext();

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
    previewStore.isDesignMode;
  const hasPermission = () =>
    hasInsertPermission() || hasViewPermission() || hasEditPermission();
  const hasNoPermission = () =>
    !(hasInsertPermission() || hasViewPermission() || hasEditPermission());
  const isDisabledPermission = () => {
    return isNoPermissionCheck() ? undefined : hasPermission();
  };

  const onChange = (value: unknown) => {
    if (props.onChange) {
      props.onChange(value);
    } else {
      const existingValue = props.data?.P[props.meta.P.name];
      // Check if the user has the appropriate permissions for the specific field
      /*if (!hasFieldPermission(props.meta.P.name)) {
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
      // logAction('modify', props.meta.P.name, value, currentUser);

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
              { P: { name: property } } as unknown as Vertex,
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
  const deNullifyAndMergeCSS = createMemo(() => {
    const result: Record<string, any> = {};

    for (const key in customMetaProps) {
      const descriptor = Object.getOwnPropertyDescriptor(customMetaProps, key);

      if (descriptor) {
        // Handle properties with getters
        if (descriptor.get) {
          if (key.toLowerCase().endsWith("class")) {
            const value = customMetaProps[key];
            if (value !== null) {
              result[key] = mergeCSS(
                "",
                value,
                { P: { name: key } } as unknown as Vertex,
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
                { P: { name: key } } as unknown as Vertex,
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
  const repeterStore = createStore({
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
    vertexes: [] as Vertex[],
  });
  const isCheckbox = () => {
    return componentName() === "Checkbox" || componentName() === "Switch" || componentName() === "MenubarCheckboxItem";
  }
  const DisplayError = () => (
    <Show when={props.meta.P.error}>
      <div class="fg:rgb(255,0,0)">{props.meta.P.error}</div>
    </Show>
  );

  const Content = () => (
    <>
      <ErrorBoundary fallback={(err) => <div>Error: {err.message}</div>}>
        <Dynamic
          {...deNullifyAndMergeCSS()}
          checked={isCheckbox() ? props.data?.P[props.meta.P[IdAttr]] : undefined}
          component={component()}
          componentName={componentName()}
          data={props.data}
          isNoPermissionCheck={isNoPermissionCheck()}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          meta={props.meta}
          onChange={componentName() !== "DynamicTable" ? onChange : undefined}
          title={props.title ?? ""}
          txnId={props.txnId}
          value={!isCheckbox() ? ifNotNull(props.data?.P[props.meta.P[IdAttr]]) : undefined}
          {...expressionProperties()}
          disabled={
            isNoPermissionCheck()
              ? customMetaProps.disabled
              : props.disabled ??
              previewStore.isViewOnly ??
              isDisabledPermission() ??
              expressionProperties().disabled ??
              customMetaProps.disabled
          }
        >
          <Show when={props.meta.id}>
            {props.meta.P.text}
            <PageAttrRender data={props.data} metaVertex={props.meta} />
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
      <PageRenderContextProvider item={props.meta} store={repeterStore}>
        <Switch>
          <Match when={!component()}>NO INPUT {componentName()}</Match>
          <Match
            keyed
            when={
              !expressionProperties().hidden &&
              component() &&
              (isNoPermissionCheck() || !hasNoPermission())
            }
          >
            <Switch>
              <Match
                when={
                  (props.isLabelWrap ?? true) &&
                  componentName() !== "Label" &&
                  (expressionProperties().label || props.meta.P.label)
                }
              >
                <Label
                  class={mergeCSS(
                    "",
                    selectedProps.labelClass,
                    { P: { name: "labelClass" } } as unknown as Vertex,
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
              </Match>
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
const inputTypes = {
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
        <Match when={componentName() === "SelectBox"}>
          <MultiSelectField
            disable={props.disabled}
            displayValueKey="::'P.displayName'||::'P.name'||::'P.id'"
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
