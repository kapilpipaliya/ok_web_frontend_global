import jsep from "jsep";
import { klona } from "klona";
import { createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { useZIndex } from "~/components/fields/ZIndex";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { createActiveClickOutside } from "~/lib/hooks/createActiveClickOutside";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { generateTableInputMeta } from "./functions/generateTableInputMeta";
import { getConditionsExpression } from "./functions/getConditionsExpression";
import { modifyFieldMetaAllFields } from "./functions/modifyFieldMetaAllFields";
import { Overlay } from "./Overlay";

const getMetaAttributes = (
  formStoreVertex: Vertex<FormStoreObject>,
  selectedRule?: null | Vertex,
) => {
  const [graph, setGraph] = useGraph();

  let metaAttribute = klona(
    FormMetaData.Form.attributes.find((x) => x.key === "Rule")!,
  );
  for (const attribute of metaAttribute.attributes!) {
    if (attribute.key === "cond") {
      for (const condAttribute of attribute.attributes!) {
        if (
          condAttribute.key === "leftField" ||
          condAttribute.key === "rightField"
        ) {
          modifyFieldMetaAllFields(
            condAttribute,
            graph,
            setGraph,
            formStoreVertex,
          );
        }
      }
    }
  }
  if (selectedRule) {
    metaAttribute = metaAttribute.attributes!.find((x) => x.key === "cond")!;
  }
  return metaAttribute;
};

export function RulesModal(
  props: Readonly<{
    closeModal: () => void;
    onSubmit: () => void;
    prevTxnIndex?: number;
    selectedRule?: null | Vertex;
  }>,
) {
  const zIndex = useZIndex();
  const [graph, setGraph] = useGraph();
  createActiveClickOutside(graph, setGraph);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const prevTxnIndex =
    props.prevTxnIndex ?? getLastTxnIndex(formStoreVertex()?.P.txnId, graph);

  const { metaVertexId } = generateTableInputMeta(
    getMetaAttributes(formStoreVertex(), props.selectedRule),
  );

  const [error, setError] = createSignal<null | string>(null);

  const expression = createMemo(() => {
    let expr = "";
    if (props.selectedRule) {
      expr = getConditionsExpression(
        props.selectedRule!,
        { P: {} } as unknown as Vertex,
        graph,
        setGraph,
        true,
      );
    } else {
      expr = "";
    }

    try {
      jsep(expr);
      setError(null);
    } catch (_e: any) {
      setError("Please write a valid expression");
    }
    return expr;
  });

  const onRulesSubmit = () => {
    if (error()) {
      alert(error());
    } else {
      props.onSubmit();
    }
  };

  let revertChanges = false;
  const onRulesCancel = () => {
    if (prevTxnIndex !== -1) {
      revertChanges = true;
    }
    props.closeModal();
  };

  onCleanup(() => {
    if (revertChanges) {
      revertTransactionUpToIndex(
        formStoreVertex()?.P.txnId,
        prevTxnIndex,
        graph,
        setGraph,
      );
    }
  });

  return (
    <Portal>
      <div
        aria-labelledby="Rules Modal"
        aria-modal="true"
        class={`position:relative z:${zIndex}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <Overlay />
        <div
          class={`inset:0px overflow-y:auto position:fixed width:100vw z:${zIndex}`}
        >
          <div class="flex align-items:flex-end align-items:center@sm justify-content:center min-height:100% p:1rem padding:0@sm text-align:center">
            <div class="~duration:150ms ~easing:cubic-bezier(0.4,0,0.2,1) ~property:all bg:rgb(255,255,255) border-radius:0.5rem box-shadow:0|20px|25px|-5px|rgba(0,0,0,0.1),0|10px|10px|-5px|rgba(0,0,0,0.04) max-width:90vw@sm my:2rem@sm overflow:hidden p:1.5rem@sm pb:1rem position:relative pt:1.25rem px:1rem text-align:left translate(0,0) width:100%@sm">
              <div>
                <div class="">
                  <h3
                    class="lh:1.5rem color:rgb(17,24,39) f:1rem font-weight:600 leading:1.5rem"
                    id="modal-title"
                  >
                    {props.selectedRule
                      ? `${props.selectedRule.P.key} Rules`
                      : "All Rules"}
                    :
                  </h3>
                  <div class="mt:0.5rem">
                    <TableInputField
                      data={
                        props.selectedRule
                          ? props.selectedRule
                          : graph.vertexes[formStoreVertex()?.P.formDataId]
                      }
                      isNoPermissionCheck={true}
                      isRealTime={false}
                      meta={graph.vertexes[metaVertexId]}
                      txnId={formStoreVertex()?.P.txnId}
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
}
