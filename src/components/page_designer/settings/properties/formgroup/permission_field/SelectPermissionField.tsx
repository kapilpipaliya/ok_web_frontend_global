import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { Label } from "../Label";
import { SelectRelation } from "../rule_field/SelectRelation";
import { ConfigurePermissionButton } from "./ConfigurePermissionButton";

interface SelectPermissionFieldProps {
  meta: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function SelectPermissionField(props: SelectPermissionFieldProps) {
  const [layoutStore] = useDesignerLayoutStore();

  const meta = {
    P: {
      class: "flex:1",
      collection: () => `id:'${layoutStore.formStore[0].formDataId}'->$0Perm`,
      componentName: "MultiSelect",
      displayName: props.meta.P.displayName,
      key: props.meta.P.key,
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  return (
    <div
      // fix class for select
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.meta} />
      </span>
      <div class="flex f:15 flex:1 gap:1px">
        <SelectRelation
          data={props.selectedLayout}
          meta={meta}
          txnId={props.txnId}
        />
        <ConfigurePermissionButton title="All Permissions" />
      </div>
    </div>
  );
}
