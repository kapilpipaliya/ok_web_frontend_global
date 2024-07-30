import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../../LayoutContext";

export function DefaultValueContent(
  props: Readonly<{
    meta: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  return (
    <DynamicComponent
      componentName={graph.vertexes[layoutStore.selectedComponent].P.name}
      data={props.selectedLayout}
      isRealTime={false}
      meta={graph.vertexes[layoutStore.selectedComponent]}
      noPermissionCheck={true}
      setValue={(data) => props.setValue(props.meta, data)}
      txnId={props.txnId}
    />
  );
}
