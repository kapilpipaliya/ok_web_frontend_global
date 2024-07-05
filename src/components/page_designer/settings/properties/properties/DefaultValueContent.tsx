import { type Accessor, useContext } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../../LayoutContext";

export function DefaultValueContent(props: Readonly<{ meta: Accessor<Vertex>; selectedLayout: Vertex; setValue: (meta: Vertex, data: any) => void; txnId: number; }>) {
  const [graph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  return (
    <DynamicComponent
      component={graph.vertexes[layoutStore.selectedComponent].P.name}
      data={props.selectedLayout}
      isRealTime={false}
      meta={graph.vertexes[layoutStore.selectedComponent]}
      setValue={(data) => props.setValue(props.meta(), data)}
      txnId={props.txnId} />
  );
}
