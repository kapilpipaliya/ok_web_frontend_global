import { klona } from "klona";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";

export function Permission() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  const uniqueConstrainsMetaAttribute = klona(FormMetaData.Form.attributes).find((meta) => meta.name === "Role")!;
  //modifyFieldMetaAllFields(uniqueConstrainsMetaAttribute.attributes!.find((attribute) => attribute.name === "key")!, graph, setGraph, layoutStore, true);
  const { metaVertexId } = generateTableInputMeta(uniqueConstrainsMetaAttribute);

  return (
    <div class="mt:6">
      <TableInputField
          data={layoutStore.formData?.formData}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={layoutStore.formData.txnId}
        />
    </div>
  );
}
