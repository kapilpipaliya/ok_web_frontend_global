import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { modifyFieldMetaAllFields } from "../../rules/functions/modifyFieldMetaAllFields";

export function NameKey() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">Name Key</span>
      <span class="f:15 flex:1">
        <DynamicComponent
          componentName={"MultiSelect"}
          data={graph.vertexes[formStoreVertex()?.P.formDataId!]}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={
            {
              P: modifyFieldMetaAllFields(
                { key: "nameKey" } as FieldAttribute,
                graph,
                setGraph,
                formStoreVertex(),
                true,
              ),
            } as unknown as Vertex
          }
          txnId={formStoreVertex()?.P.txnId}
        />
      </span>
    </div>
  );
}
