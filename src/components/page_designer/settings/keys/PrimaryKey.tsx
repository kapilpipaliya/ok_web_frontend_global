import type { Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "~/components/form/DynamicComponent";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function PrimaryKey() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">
        Primary Key
      </span>
      <span class="f:15 flex:1">
        <DynamicComponent
          component={"TagBox"}
          data={layoutStore.formData?.formData}
          isRealTime={false}
          meta={{ P: { name: "pk" } } as unknown as Vertex}
          //  Todo Add tree options, only includes the top level fields.
          txnId={layoutStore.formData.txnId} />
      </span>
    </div>
  );
}
