import { klona } from "klona";
import { createStore } from "solid-js/store";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";

export function Permission() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph] = useGraph();
  
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData.Form.attributes,
  ).find((meta) => meta.key === "Perm");
  if (!uniqueConstrainsMetaAttribute) {
    return <></>;
  }
  //modifyFieldMetaAllFields(uniqueConstrainsMetaAttribute.attributes!.find((attribute) => attribute.key === "key")!, graph, setGraph, layoutStore, true);
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  const repeaterStore = createStore({});

  return (
    <div class="mt:6">
      <HeaderWithDescription
        description="All the permissions to the form level"
        paddingXSm="0.25rem"
        title="Form Permissions"
      />

      <div class="mt:.5rem px:0.25rem">
        <DynamicComponent
          componentName={"MultiSelect"}
          data={graph.vertexes[formStoreVertex()?.P.formDataId!]}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={
            {
              P: {
                collection: "->$0Perm",
                key: "globalPerm",
              } as unknown as FieldAttribute,
            } as unknown as Vertex
          }
          txnId={formStoreVertex()?.P.txnId}
        />
      </div>

      <HeaderWithDescription
        description="All the permissions that are used in the form."
        paddingXSm="0.25rem"
        title="All Form Permissions"
      />
      <div class="mt:.5rem px:0.25rem">
        <TableInputField
          data={graph.vertexes[formStoreVertex()?.P.formDataId!]}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={formStoreVertex()?.P.txnId}
        />
      </div>
    </div>
  );
}
