
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { RulesModal } from "~/components/page_designer/rules/RulesModal";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { AddNewRule } from "../../../rules/AddNewRule";
import { Label } from "../Label";
import { AddNewRelationButton } from "./AddNewRelationButton";
// import { DisplayAllRules } from "./DisplayAllRules";
import { SelectRelation } from "./SelectRelation";
import { getRenderOptionLabelFunction } from "./getRenderOptionLabelFunction";

interface SelectRuleFieldProps {
  metaVertex: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function SelectRuleField(props: SelectRuleFieldProps) {
  const [layoutStore] = useDesignerLayoutStore();

  const meta = {
    P: {
      class: "flex:1",
      collection: () => `id:'${layoutStore.formData.formData.id}'->Rule`,
      componentName: "SelectBox",
      displayName: props.metaVertex.P.displayName,
      name: props.metaVertex.P.name,
      renderLabel: getRenderOptionLabelFunction(RulesModal),
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label metaVertex={props.metaVertex} />
      </span>
      <div class="flex f:15 flex:1">
        <SelectRelation data={props.selectedLayout} meta={meta} txnId={props.txnId} />
        <AddNewRelationButton component={AddNewRule} meta={meta} selectedLayout={props.selectedLayout} title="Add New Rule" txnId={props.txnId} />
        {/* <DisplayAllRules /> */}
      </div>
    </div>
  );
}
