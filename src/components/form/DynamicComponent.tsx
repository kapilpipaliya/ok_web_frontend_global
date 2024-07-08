import { Match, Switch, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { GenericField } from "~/components/fields/GenericField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { getDynamicComponent } from "./getDynamicComponent";

export function DynamicComponent(props: Readonly<{
  applyDefaults?: boolean;
  component: string; // component is required, cant refactor it to remove it, because parent component needs it too.
  data?: Vertex;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  meta: Vertex;
  setValue?: (data: any) => void;
  title?: string;
  txnId?: number;
}>) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore() || [];
  const component = createMemo(() => getDynamicComponent(props.component));
  const isApplyDefault = () => component() !== GenericInputField && component() !== GenericField;
  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={!layoutStore?.hiddenNodes.includes(props.meta?.id) && component()}>
        <Dynamic
          component={component()!}
          {...(props.applyDefaults && isApplyDefault() && graph.componentIdMap[props.component] ? getCompProps(graph,graph.vertexes[graph.componentIdMap[props.component]]) : {})}
          applyDefaults={props.applyDefaults}
          componentName={props.component}
          data={props.data}
          disabled={props.disabled}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          meta={props.meta}
          // passed setValue when we have a string value in select field
          setValue={props.setValue}
          title={props.title ?? ""}
          txnId={props.txnId}
          />
      </Match>
    </Switch>
  );
}
