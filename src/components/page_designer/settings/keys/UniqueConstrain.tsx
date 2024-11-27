import { klona } from "klona";
import { createStore } from "solid-js/store";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { PageRenderContextProvider } from "~/components/page_attr_render/context/PageRenderContext";
import { useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";
import { modifyFieldMetaAllFields } from "../../rules/functions/modifyFieldMetaAllFields";

export function UniqueConstrains() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData.Form.attributes,
  ).find((meta) => meta.key === "Unique")!;
  modifyFieldMetaAllFields(
    uniqueConstrainsMetaAttribute.attributes!.find(
      (attribute) => attribute.key === "key",
    )!,
    graph,
    setGraph,
    layoutStore,
    true,
  );
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  return (
    <div class="mt:6">
        <TableInputField
          data={layoutStore.formStore[0]?.formData}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          txnId={layoutStore.formStore[0].txnId}
        />
    </div>
  );
}
