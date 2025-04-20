import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { useGraph } from "~/lib/graph/GraphContext";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function Permission() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData[formStoreVertex()?.P.formId as keyof typeof FormMetaData]
      .attributes,
  ).find((meta) => meta.key === "PermGlobal");
  if (!uniqueConstrainsMetaAttribute) {
    return <></>;
  }
  //modifyFieldMetaAllFields(uniqueConstrainsMetaAttribute.attributes!.find((attribute) => attribute.key === "key")!, graph, setGraph, layoutStore, true);
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  return (
    <As as="div" css={css`
  margin-top: 6px;
`}>
      <HeaderWithDescription
        description="All the permissions to the form level"
        paddingXSm="0.25rem"
        title="Form Permissions"
      />

      <As as="div" css={css`
  margin-top: 0.5rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
`}>
        <TableInputField
          data={graph.vertexes[formStoreVertex()?.P.formDataId!]}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={formStoreVertex()?.P.txnId}
        />
      </As>
    </As>
  );
}
