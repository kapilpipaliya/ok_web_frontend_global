import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore, PageLayoutObject, useDesignerFormIdContext } from "../../../context/LayoutContext";

export function DefaultValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <DynamicComponent
      componentName={graph.vertexes[formStoreVertex()?.P.selectedComponent]?.P.key}
      data={props.selectedLayout}
      isNoPermissionCheck={true}
      isRealTime={false}
      meta={graph.vertexes[formStoreVertex()?.P.selectedComponent]}
      noLabel
      onChange={(data) => props.onChange(props.meta, data)}
      txnId={props.txnId}
    />
  );
}
