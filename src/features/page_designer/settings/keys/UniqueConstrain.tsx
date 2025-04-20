import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { modifyFieldMetaAllFields } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/modifyFieldMetaAllFields";
import { useGraph } from "~/lib/graph/GraphContext";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function UniqueConstrains() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData.Form.attributes,
  ).find((meta) => meta.key === "Unique")!;
  modifyFieldMetaAllFields(
    uniqueConstrainsMetaAttribute.attributes!.find(
      (attribute) => attribute.key === "key",
    )!,
    graph,
    setGraph,
    formStoreVertex(),
    true,
  );
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  return (
    <As as="div" css={css`
  margin-top: 6px;
`}>
      <TableInputField
        data={formStoreVertex()}
        isNoPermissionCheck={true}
        isRealTime={false}
        meta={graph.vertexes[metaVertexId]}
        txnId={formStoreVertex()?.P.txnId}
      />
    </As>
  );
}
