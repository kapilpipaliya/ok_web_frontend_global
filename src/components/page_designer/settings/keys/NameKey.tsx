import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { modifyFieldMetaAllFields } from "../../rules/functions/modifyFieldMetaAllFields";

export function NameKey() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">Name Key</span>
      <span class="f:15 flex:1">
        <DynamicComponent
          componentName={"TagBox"}
          data={layoutStore.formStore?.formData}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={{ P: modifyFieldMetaAllFields({ name: "nameKey" } as FieldAttribute , graph, setGraph, layoutStore, true)} as unknown as Vertex}
          txnId={layoutStore.formStore.txnId}
        />
      </span>
    </div>
  );
}
