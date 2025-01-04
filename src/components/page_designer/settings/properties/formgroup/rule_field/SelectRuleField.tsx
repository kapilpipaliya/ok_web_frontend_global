import { FormStoreObject } from "~/components/form/FormContext";
import { PageLayoutObject, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { RulesModal } from "~/components/page_designer/rules/RulesModal";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { AddNewRule } from "../../../rules/AddNewRule";
import { Label } from "../Label";
import { AddNewRelationButton } from "./AddNewRelationButton";
import { getRenderOptionLabelFunction } from "./getRenderOptionLabelFunction";
// import { DisplayAllRules } from "./DisplayAllRules";
import { SelectRelation } from "./SelectRelation";

interface SelectRuleFieldProps {
  meta: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function SelectRuleField(props: SelectRuleFieldProps) {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const meta = {
    P: {
      class: "flex:1",
      collection: () => `id:'${formStoreVertex().P.formDataId}'->Rule`,
      componentName: "Select",
      displayName: props.meta.P.displayName,
      key: props.meta.P.key,
      renderLabel: getRenderOptionLabelFunction(RulesModal),
      useLocalStorage: true,
    },
  } as unknown as Vertex;

  return (
    <div
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.meta} />
      </span>
      <div class="flex f:15 flex:1">
        <SelectRelation
          data={props.selectedLayout}
          meta={meta}
          txnId={props.txnId}
        />
        <AddNewRelationButton
          component={AddNewRule}
          meta={meta}
          selectedLayout={props.selectedLayout}
          title="Add New Rule"
          txnId={props.txnId}
        />
        {/* <DisplayAllRules /> */}
      </div>
    </div>
  );
}
