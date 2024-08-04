import { klona } from "klona";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { HeaderWithDescription } from "~/components/HeaderWithDescription";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";

export function Permission() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  const uniqueConstrainsMetaAttribute = klona(FormMetaData.Form.attributes).find((meta) => meta.name === "Perm");
  if (!uniqueConstrainsMetaAttribute) return <></>;
  //modifyFieldMetaAllFields(uniqueConstrainsMetaAttribute.attributes!.find((attribute) => attribute.name === "key")!, graph, setGraph, layoutStore, true);
  const { metaVertexId } = generateTableInputMeta(uniqueConstrainsMetaAttribute);

  return (
    <div class="mt:6">
      <HeaderWithDescription description="All the permissions to the form level" paddingXSm="0.25rem" title="Form Permissions" />

      <div class="mt:.5rem px:0.25rem">
        <DynamicComponent
          componentName={"TagBox"}
          data={layoutStore.formStore[0]?.formData}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={{ P: { collection: '->$0Perm', name: "globalPerm" } as unknown as FieldAttribute } as unknown as Vertex}
          txnId={layoutStore.formStore[0].txnId}
        />
      </div>

      <HeaderWithDescription description="All the permissions that are used in the form." paddingXSm="0.25rem" title="All Form Permissions" />
      <div class="mt:.5rem px:0.25rem">
        <TableInputField
          data={layoutStore.formStore[0]?.formData}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={layoutStore.formStore[0].txnId}
        />
      </div>


    </div>
  );
}
