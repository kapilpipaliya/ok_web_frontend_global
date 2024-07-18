import { Match, Switch, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { deNullify, ifNotNull } from "~/lib/utils";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
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

  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={component()}>
        <Dynamic
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
          {...deNullify(customMetaProps)}
        />
      </Match>
    </Switch>
  );
}
