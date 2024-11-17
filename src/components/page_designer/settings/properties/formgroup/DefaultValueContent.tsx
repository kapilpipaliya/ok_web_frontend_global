import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../../context/LayoutContext";

export function DefaultValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  return (
    <DynamicComponent
      componentName={graph.vertexes[layoutStore.selectedComponent].P.key}
      data={props.selectedLayout}
      isNoPermissionCheck={true}
      isRealTime={false}
      meta={graph.vertexes[layoutStore.selectedComponent]}
      noLabel
      onChange={(data) => props.onChange(props.meta, data)}
      txnId={props.txnId}
    />
  );
}
