import { Match, Switch, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

import { getDynamicComponent } from "./getDynamicComponent";

export function DynamicComponent(
  props: Readonly<{
    component: string; // component is required, cant refactor it to remove it, because parent component needs it too.
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
  const component = createMemo(() => getDynamicComponent(props.component));
  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={component()}>
        <Dynamic
          component={component()!}
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
