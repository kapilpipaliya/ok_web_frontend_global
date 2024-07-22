import type { Accessor } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "~/components/form/DynamicComponent";

export function Content(
  props: Readonly<{
    componentName: Accessor<string>;
    meta: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
    txnId: number;
  }>,
) {
  return (
    <DynamicComponent
      componentName={props.componentName()}
      data={props.selectedLayout}
      isRealTime={false}
      meta={props.meta}
      setValue={(data) => props.setValue(props.meta, data)}
      txnId={props.txnId}
    />
  );
}
