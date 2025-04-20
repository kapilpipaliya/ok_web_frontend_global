import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { modifyFieldMetaAllFields } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/modifyFieldMetaAllFields";
import { useGraph } from "~/lib/graph/GraphContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function NameKey() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <As
      as="div"
      css={css`
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
`}
    >
      <As
        as="span"
        css={css`
  font-size: 15px;
  flex: 0.5;
`}
      >
        Name Key
      </As>
      <As
        as="span"
        css={css`
  font-size: 15px;
  flex: 1;
`}
      >
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
      </As>
    </As>
  );
}
