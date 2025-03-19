import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { useGraph } from "~/lib/graph/GraphContext";
import { pageAttr } from "~/lib/meta/page/pageAttr";

import { generateTableInputMeta } from "./functions/generateTableInputMeta";

interface SelectPermissionFieldProps {
  meta: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function SelectPermissionField(props: SelectPermissionFieldProps) {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const metaAttribute = klona(pageAttr.find((meta) => meta.key === "Perm"));
  const { metaVertexId } = generateTableInputMeta(metaAttribute!);
  return (
    // <div
    // class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    // >
    <TableInputField
      addNewButtonText="Add New Permission"
      data={props.selectedLayout}
      isNoPermissionCheck={true}
      isRealTime={false}
      meta={graph.vertexes[metaVertexId]}
      txnId={formStoreVertex()?.P.txnId}
    />
    // </div>
  );
}
