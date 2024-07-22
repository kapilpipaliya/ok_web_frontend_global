import type { SetStoreFunction } from "solid-js/store";

import { Match, Show, Switch, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useFormContext, useIsPreview } from "~/lib/contexts";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type GraphInterface, IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { ifNotNull } from "~/lib/utils";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { evaluateRule } from "../page_designer/settings/properties/rules/evaluateRule";
import { Label } from "../solid_blocks/Label";
import { getDynamicComponent } from "./getDynamicComponent";

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
    isRealTime?: boolean;
    isTableInside?: boolean;
    meta: Vertex;
    setValue?: (data: any) => void;
    title?: string;
    txnId?: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const { formData } = useFormContext() ?? {};
  const [isPreview] = useIsPreview();

  const componentName = () =>
    props.componentName ?? props.meta.P.componentName;
  const component = createMemo(() => getDynamicComponent(componentName()));
  const setValue = (value: unknown) => {
    if (props.setValue) {
      props.setValue(value);
    } else {
      setValueGlobal(graph, setGraph, props.txnId!, props.meta, props.data!, value, false);
    }
  };

  const [selectedProps, customMetaProps] = splitProps(props.meta.P, ["validation", "labelClass"]);

  // Should also use repeaterContext
  // const repeaterContext = useRepeaterVertexContext();

  // Extra properties to be added
  const extraProperties = createMemo(() => {
    const propertyRuleMap = new Map<string, Vertex>();
    for (const edgeType in props.meta.OUT) {
      for (const edge of props.meta.OUT[edgeType]) {
        const endVertex = graph.vertexes[graph.edges[edge].E];
        if (endVertex.L[0] === "Rule") {
          let propertyName = edgeType.replace(/^Attr/g, '');
          // Lowercase the first letter
          propertyName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
          propertyRuleMap.set(propertyName, endVertex); // Save endVertex in the value
        }
      }
    }
    return propertyRuleMap;
  });

  const expressionProperties = createMemo(() => {
    const values = {} as Record<string, any>;
    for (const [property, rule] of extraProperties().entries()) {
      if (property === "disabled" && !isPreview()) {
        continue;
      }
      if (property === "hidden" && !isPreview()) {
        continue;
      }
      if (formData && rule) {
        if (rule) {
          try {
            values[property] = evaluateRule(rule, formData, graph, setGraph);
            if (property.toLowerCase().endsWith("class")) {
              values[property] = mergeCSS("", values[property]);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) { /* empty */ }
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
          if (key.toLowerCase().endsWith('class')) {
            const value = customMetaProps[key];
            if (value !== null) {
              result[key] = mergeCSS("", value);
            }
          } else {
            Object.defineProperty(result, key, descriptor);
          }
        } else {
          // Handle properties without getters
          const value = descriptor.value;
          if (value !== null) {
            result[key] = key.toLowerCase().endsWith('class') ? mergeCSS("", value) : value;
          }
        }
      }
    }

    return result;
  });

  const Content = () => (
    <Dynamic
      {...deNullifyAndMergeCSS()}
      component={component()!}
      componentName={componentName()}
      data={props.data}
      disabled={props.disabled}
      isRealTime={props.isRealTime}
      isTableInside={props.isTableInside}
      meta={props.meta}
      setValue={componentName() !== "DynamicTable" ? setValue : undefined}
      title={props.title ?? ""}
      txnId={props.txnId}
      value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
      {...expressionProperties()}
    >
      <Show when={props.meta.id}>
        <PageAttrRender data={props.data} metaVertex={props.meta} />
      </Show>
    </Dynamic>
  );

  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={!expressionProperties().hidden && component()}>
        <Switch>
          <Match when={componentName() !== "Label" && (expressionProperties().label || props.meta.P.label)}>
            <Label class={mergeCSS("", selectedProps.labelClass)} label={expressionProperties().label || props.meta.P.label}>
              <Content />
            </Label>
          </Match>
          <Match when={true}>
            <Content />
          </Match>
        </Switch>
      </Match>
    </Switch>
  );
}
