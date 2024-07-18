import { Match, Switch, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { deNullify, ifNotNull } from "~/lib/utils";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { getDynamicComponent } from "./getDynamicComponent";

export function DynamicComponent(
  props: Readonly<{
    componentName: string;
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
  const component = createMemo(() => getDynamicComponent(props.componentName));
  const componentName = () =>
    props.componentName ?? props.meta.P.componentName;
  const setValue = (value: any) => {
    if (props.setValue) {
      props.setValue(value);
    } else {
      setValueGlobal(graph, setGraph, props.txnId!, props.meta, props.data!, value, false);
    }
  };

  const [, customMetaProps] = splitProps(props.meta.P, ["validation"]);

// // Proxy handler for P property
// const handlerP: ProxyHandler<any> = {
//   get(target, property, receiver) {
//     return Reflect.get(target, property, receiver);
//   },
// };

// // Proxy handler for Vertex
// const handler: ProxyHandler<Vertex> = {
//   get(target, property, receiver) {
//     if (property === "P") {
//       return new Proxy(target.P, handlerP);
//     }
//     return Reflect.get(target, property, receiver);
//   },
// };


// const proxyMetaVertex = new Proxy(props.meta, handler);



  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={component()}>
        <Dynamic
          {...deNullify(customMetaProps)}
          class={mergeCSS("", props.meta.P.class)}
          component={component()!}
          componentName={componentName()}
          data={props.data}
          disabled={props.disabled}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          meta={props.meta}
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
