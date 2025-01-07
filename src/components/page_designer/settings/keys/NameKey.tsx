import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { modifyFieldMetaAllFields } from "../../rules/functions/modifyFieldMetaAllFields";

export function NameKey() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">Name Key</span>
      <span class="f:15 flex:1">
        <DynamicComponent
          componentName={"MultiSelect"}
          data={graph.vertexes[formStoreVertex().P.formDataId!]}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={
            {
              P: modifyFieldMetaAllFields(
                { key: "nameKey" } as FieldAttribute,
                graph,
                setGraph,
                layoutStoreId,
                true,
              ),
            } as unknown as Vertex
          }
          txnId={formStoreVertex().P.txnId}
        />
      </span>
    </div>
  );
}
