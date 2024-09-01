import { klona } from "klona";
import { createStore } from "solid-js/store";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { HeaderWithDescription } from "~/components/HeaderWithDescription";
import { PageRenderContextProvider } from "~/components/page_attr_render/PageRenderContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { generateTableInputMeta } from "../../rules/functions/generateTableInputMeta";

export function Permission() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
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
          componentName={"TagBox"}
          data={layoutStore.formStore[0]?.formData}
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
          txnId={layoutStore.formStore[0].txnId}
        />
      </div>

      <HeaderWithDescription
        description="All the permissions that are used in the form."
        paddingXSm="0.25rem"
        title="All Form Permissions"
      />
      <div class="mt:.5rem px:0.25rem">
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
    </div>
  );
}
