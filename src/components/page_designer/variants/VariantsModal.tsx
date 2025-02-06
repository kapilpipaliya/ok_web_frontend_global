
import { klona } from "klona";
import { createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import type {
  FormStoreObject,
} from "~/components/form/context/FormContext";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { useZIndex } from "~/components/fields/ZIndex";
import { useDesignerFormIdContext, } from "~/components/page_designer/context/LayoutContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";
import { createActiveClickOutside } from "~/lib/hooks/createActiveClickOutside";
import { ComponentLabel, FormMetaData } from "~/lib/meta/formMetaData";

import { generateTableInputMeta } from "../rules/functions/generateTableInputMeta";
import { Overlay } from "../rules/Overlay";

const getMetaAttributes = (selectedVariant?: null | Vertex) => {
  let metaAttribute = klona(
    FormMetaData[ComponentLabel].attributes.find((x) => x.key === "Variant")!,
  );
  // we dont allow configuring a single variant for now, because we have many properties for variant with name.
  if (selectedVariant) {
    metaAttribute = metaAttribute.attributes!.find((x) => x.key === "option")!;
  }
  if (!metaAttribute) {
    console.error("Meta attribute not found")
  }
  return metaAttribute;
};

export function VariantsModal(
  props: Readonly<{
    closeModal: () => void;
    onSubmit: () => void;
    prevTxnIndex?: number;
    selectedVariant?: null | Vertex;
  }>,
) {
  const zIndex = useZIndex();
  const [graph, setGraph] = useGraph();
  createActiveClickOutside(graph, setGraph);
  
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const prevTxnIndex =
    props.prevTxnIndex ?? getLastTxnIndex(formStoreVertex()?.P.txnId, graph);

  const { metaVertexId } = generateTableInputMeta(
    getMetaAttributes(props.selectedVariant),
  );

  const [error, setError] = createSignal<null | string>(null);

  const onVariantsSubmit = () => {
    if (error()) {
      alert(error());
    } else {
      props.onSubmit();
    }
  };

  let revertChanges = false;
  const onVariantsCancel = () => {
    if (prevTxnIndex !== -1) {
      revertChanges = true;
    }
    props.closeModal();
  };

  onCleanup(() => {
    if (revertChanges) {
      revertTransactionUpToIndex(formStoreVertex()?.P.txnId, prevTxnIndex - 1, graph, setGraph);
    }
  });

  return (
    <Portal>
      <div
        aria-labelledby="Variants Modal"
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
                    {props.selectedVariant
                      ? `${props.selectedVariant.P.key} Variants`
                      : "All Variants"} :
                  </h3>
                  <div class="mt:0.5rem">

                      <TableInputField
                        data={
                          props.selectedVariant
                            ? props.selectedVariant
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
              <div class="display:grid@sm gap:0.75rem@sm grid-auto-flow:row|dense@sm grid-cols:2@sm mt:1.25rem mt:1.5rem@sm">
                {error() && <div class="color:#FF0000">{error()}</div>}
                <button onClick={onVariantsSubmit}>Submit</button>
                <button
                  class="border-color:#FF0000 color:#FF0000"
                  onClick={onVariantsCancel}
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
