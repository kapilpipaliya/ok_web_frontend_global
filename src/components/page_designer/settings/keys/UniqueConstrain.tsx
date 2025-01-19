import { klona } from "klona";
import { createStore } from "solid-js/store";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { PageRenderContextProvider } from "~/components/page_attr_render/context/PageRenderContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";
import { modifyFieldMetaAllFields } from "../../rules/functions/modifyFieldMetaAllFields";
import { FormStoreObject } from "~/components/form/context/FormContext";

export function UniqueConstrains() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  
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
    <div class="mt:6">
        <TableInputField
          data={formStoreVertex()}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={formStoreVertex()?.P.txnId}
        />
    </div>
  );
}
