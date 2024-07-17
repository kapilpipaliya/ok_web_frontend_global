import { Match, Switch, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

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
  const componentName = createMemo(() => getDynamicComponent(props.componentName));
  return (
    <Switch>
      <Match when={!componentName()}>NO INPUT</Match>
      <Match keyed when={componentName()}>
        <Dynamic
          component={componentName()!}
          componentName={props.componentName}
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
