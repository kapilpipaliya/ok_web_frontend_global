import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerFormIdContext } from "../../context/LayoutContext";

export function Permission() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData[formStoreVertex()?.P.formId as keyof typeof FormMetaData].attributes,
  ).find((meta) => meta.key === "PermGlobal");
  if (!uniqueConstrainsMetaAttribute) {
    return <></>;
  }
  //modifyFieldMetaAllFields(uniqueConstrainsMetaAttribute.attributes!.find((attribute) => attribute.key === "key")!, graph, setGraph, layoutStore, true);
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  return (
    <div class="mt:6">
      <HeaderWithDescription
        description="All the permissions to the form level"
        paddingXSm="0.25rem"
        title="Form Permissions"
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
