import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { modifyFieldMetaAllFields } from "../properties/rules/modifyFieldMetaAllFields";

export function UniqueConstrains() {
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">Unique Constrains</span>
      <span class="f:15 flex:1">
        <DynamicComponent
          component={"TagBox"}
          data={layoutStore.formData?.formData}
          isRealTime={false}
          meta={{ P: modifyFieldMetaAllFields({ name: "uniqueConstrains" } , graph, setGraph, layoutStore)} as unknown as Vertex}
          //  Todo Add tree options, only includes the top level fields.
          txnId={layoutStore.formData.txnId}
        />
      </span>
    </div>
  );
}
