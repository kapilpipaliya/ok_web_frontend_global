import jsep from "jsep";
import { klona } from "klona";
import { createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import type { FieldAttribute } from "~/lib/FormMetadataType";

import { useZIndex } from "~/components/ZIndex";
import { TableInputField } from "~/components/fields/table_input/TableInputField";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";
import { useActiveClickOutside } from "~/components/useActiveClickOutside";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { revertTransactionUpTo } from "~/lib/graph/transaction/revertTransactionUpTo";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { getConditionsExpression } from "./getConditionsExpression";


export function RulesModal(
  props: Readonly<{
    closeModal: () => void;
    onSubmit: () => void;
    prevTxnIndex?: number;
    selectedRule?: Vertex | null;
  }>,
) {
  const zIndex = useZIndex();
  const [graph, setGraph] = useGraph();
  useActiveClickOutside(graph, setGraph);
  const [layoutStore] = useDesignerLayoutStore();
  const prevTxnIndex =
    props.prevTxnIndex ??
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length ??
    0;

  const metaVertexId = graph.newVertexId;
  const metaTxnId = graph.newTxnId;
  let metaAttribute = klona(
    FormMetaData.Form.attributes.find((x) => x.name === "Rule")!,
  );
  for (const attribute of metaAttribute.attributes!) {
    if (attribute.name === "cond") {
      for (const condAttribute of attribute.attributes!) {
        if (
          condAttribute.name === "leftField" ||
          condAttribute.name === "rightField"
        ) {
          modifyFieldMeta(condAttribute);
        }
      }
    }
  }
  if (props.selectedRule) {
    metaAttribute = metaAttribute.attributes!.find((x) => x.name === "cond")!;
  }

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["MetaAttr"], metaAttribute),
    graph,
    setGraph,
  );
  addMetaVertexes(
    graph,
    setGraph,
    metaTxnId,
    graph.vertexes[metaVertexId],
    metaAttribute.attributes!,
  );
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const [error, setError] = createSignal<null | string>(null);

  const expression = createMemo(() => {
    let expr = '';

    try {
      expr = getConditionsExpression(props.selectedRule!, { P: {} } as unknown as Vertex, graph, setGraph, true);
      jsep(expr);
      setError(null);
    } catch (e: any) {
      setError('Please write a valid expression');
    }
    
    return expr;
    
  });

  const onRulesSubmit = () => {
    if (!error()) {
      props.onSubmit();
    } else {
      alert(error());
    }
  };

  const onRulesCancel = () => {
    if (prevTxnIndex !== -1) {
      revertTransactionUpTo(layoutStore.formData.txnId, prevTxnIndex, graph);
    }
    props.closeModal();
  };

  return (
    <Portal>
      <div
        aria-labelledby="Rules Modal"
        aria-modal="true"
        class={`position:relative z:${zIndex}`}
        role="dialog"
      >
        <Overlay />
        <div class="inset:0px overflow-y:auto position:fixed width:100vw z:10">
          <div class="flex align-items:flex-end align-items:center@sm justify-content:center min-height:100% p:1rem padding:0@sm text-align:center">
            <div class="~duration:150ms ~easing:cubic-bezier(0.4,0,0.2,1) ~property:all bg:rgb(255,255,255) border-radius:0.5rem box-shadow:0|20px|25px|-5px|rgba(0,0,0,0.1),0|10px|10px|-5px|rgba(0,0,0,0.04) max-width:90vw@sm my:2rem@sm overflow:hidden p:1.5rem@sm pb:1rem position:relative pt:1.25rem px:1rem text-align:left translate(0,0) width:100%@sm">
              <div>
                <div class="">
                  <h3
                    class="lh:1.5rem color:rgb(17,24,39) f:1rem font-weight:600 leading:1.5rem"
                    id="modal-title"
                  >
                    {!props.selectedRule
                      ? "All Rules"
                      : `${props.selectedRule.P.name} Rules`}
                    :
                  </h3>
                  <div class="mt:0.5rem">
                    <TableInputField
                      data={
                        props.selectedRule
                          ? props.selectedRule
                          : layoutStore.formData.formData
                      }
                      isRealTime={false}
                      meta={graph.vertexes[metaVertexId]}
                      txnId={layoutStore.formData.txnId}
                    />
                  </div>
                </div>
              </div>
              Expression: {expression()}
              <div class="display:grid@sm gap:0.75rem@sm grid-auto-flow:row|dense@sm grid-cols:2@sm mt:1.25rem mt:1.5rem@sm">
                {error() && <div class="color:#FF0000">{error()}</div>}
                <button onClick={onRulesSubmit}>Submit</button>
                <button
                  class="border-color:#FF0000 color:#FF0000"
                  onClick={onRulesCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );

  function modifyFieldMeta(attribute: FieldAttribute) {
    attribute.labelKey = "::'name'||::'P.displayName'||::'P.name'||::'P.id'";
    attribute.valueKey = "id";
    attribute.childrenKey = "attributes";
    attribute.options = () =>
      getFormMetaData(graph, setGraph, layoutStore.formData.formData)
        .attributes;
  }
}
const Overlay = () => {
  return (
    <div class="--bg-opacity:0.75 ~duration:150ms ~easing:cubic-bezier(0.4,0,0.2,1) ~property:opacity bg:rgb(107,114,128) inset:0px position:fixed"></div>
  );
};
