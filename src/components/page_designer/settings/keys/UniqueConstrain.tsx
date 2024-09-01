import { klona } from "klona";
import { createStore } from "solid-js/store";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { PageRenderContextProvider } from "~/components/page_attr_render/PageRenderContext";
import { useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
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

  const repeaterStore = createStore({});

  return (
    <div class="mt:6">
      <PageRenderContextProvider
        data={layoutStore.formStore[0]?.formData}
        meta={graph.vertexes[metaVertexId]}
        store={repeaterStore}
      >
        <TableInputField
          isNoPermissionCheck={true}
          isRealTime={false}
          txnId={layoutStore.formStore[0].txnId}
        />
      </PageRenderContextProvider>
    </div>
  );
}
