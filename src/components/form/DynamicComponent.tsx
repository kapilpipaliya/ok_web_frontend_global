import type { SetStoreFunction } from "solid-js/store";

import { Match, Switch, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useFormContext } from "~/lib/contexts";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type GraphInterface, IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { deNullify, ifNotNull } from "~/lib/utils";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
import { useRepeaterVertexContext } from "../page_attr_render/Context";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { evaluateRule } from "../page_designer/settings/properties/rules/evaluateRule";
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
  const { formData, } = useFormContext() ?? {};

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

  const [, customMetaProps] = splitProps(props.meta.P, ["validation"]);

  const repeaterContext = useRepeaterVertexContext();

  // Extra properties to be added
  const extraProperties = createMemo(() => {
    const propertyRuleMap = new Map<string, Vertex>(); // Change Set to Map
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

  // Proxy handler for P property
  const handlerP: ProxyHandler<{ [key: string]: unknown }> = {
    get(target, property, receiver) {
      console.log(property)
      if (formData && extraProperties().has(property as string)) {
        const rule = extraProperties().get(property as string);
        let value;
        if (rule) {
          try {
            value = evaluateRule(rule, formData, graph, setGraph);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) { /* empty */ }
        }
        return value;
      }
      return Reflect.get(target, property, receiver);
    },
    getOwnPropertyDescriptor(target, property) { // called for every property
      if (formData && extraProperties().has(property as string)) {
        const rule = extraProperties().get(property as string);
        let value;
        if (rule) {
          try {
            value = evaluateRule(rule, formData, graph, setGraph);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) { /* empty */ }
        }
        return {
          configurable: true,
          enumerable: true,
          value,
          writable: true,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
    ownKeys(target) { // called once to get a list of properties
      console.log(Reflect.ownKeys(target).concat([...extraProperties().keys()]))
      return Reflect.ownKeys(target).concat([...extraProperties().keys()]);
    },
  };

  // Proxy handler for Vertex
  const handler: ProxyHandler<Vertex> = {
    get(target, property, receiver) {
      if (property === "P") {
        return new Proxy(target.P, handlerP);
      }
      return Reflect.get(target, property, receiver);
    },
  };

  const proxyMetaVertex = createMemo(() => new Proxy(props.meta, handler));

  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={component()}>{JSON.stringify(Object.keys(proxyMetaVertex().P))}
        <Dynamic
          {...deNullify(customMetaProps)}
          class={mergeCSS("", props.meta.P.class)}
          component={component()!}
          componentName={componentName()}
          data={props.data}
          disabled={props.disabled}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          meta={proxyMetaVertex()}
          // passed setValue when we have a string value in select field
          setValue={setValue}
          title={props.title ?? ""}
          txnId={props.txnId}
          value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
        >
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Dynamic>
      </Match>
    </Switch>
  );
}
