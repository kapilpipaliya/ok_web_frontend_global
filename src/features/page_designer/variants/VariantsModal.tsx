import { klona } from "klona";
import { createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { useZIndex } from "~/components/fields/ZIndex";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { useGraph } from "~/lib/graph/GraphContext";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import { createActiveClickOutside } from "~/lib/hooks/createActiveClickOutside";
import { ComponentLabel, FormMetaData } from "~/lib/meta/formMetaData";

import { Overlay } from "../settings/properties/formgroup/permission_field/Overlay";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

const getMetaAttributes = (selectedVariant?: null | Vertex) => {
  let metaAttribute = klona(
    FormMetaData[ComponentLabel].attributes.find((x) => x.key === "Variant")!,
  );
  // we dont allow configuring a single variant for now, because we have many properties for variant with name.
  if (selectedVariant) {
    metaAttribute = metaAttribute.attributes!.find((x) => x.key === "option")!;
  }
  if (!metaAttribute) {
    console.error("Meta attribute not found");
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
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const prevTxnIndex =
    props.prevTxnIndex ?? getLastTxnIndex(formStoreVertex()?.P.txnId, graph);

  const { metaVertexId } = generateTableInputMeta(
    getMetaAttributes(props.selectedVariant),
  );

  const [error, _setError] = createSignal<null | string>(null);

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
      revertTransactionUpToIndex(
        formStoreVertex()?.P.txnId,
        prevTxnIndex - 1,
        graph,
        setGraph,
      );
    }
  });

  return (
    <Portal>
      <As
        as="div"
        aria-labelledby="Variants Modal"
        aria-modal="true"
        css={css`
  position: relative;
  z-index: ${zIndex};
`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <Overlay />
        <As
          as="div"
          css={css`
  inset: 0px;
  overflow-y: auto;
  position: fixed;
  width: 100vw;
  z-index: ${zIndex};
`}
        >
          <As
            as="div"
            css={css`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 100%;
  padding: 1rem;
  text-align: center;
  @media (width >= 52.125rem) {
     align-items: center;
     padding: 0;
  }
`}
          >
            <As
              as="div"
              css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);
  overflow: hidden;
  padding-bottom: 1rem;
  position: relative;
  padding-top: 1.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  text-align: left;
  @media (width >= 52.125rem) {
    padding: 0;
    margin-bottom: 2rem;
    margin-top: 2rem;
    padding: 1.5rem;
    width: 100%;
    max-width:90vw;
  }
`}
            >
              <div>
                <div class="">
                  <As
                    as="h3"
                    css={css`
  line-height: 1.5rem;
  color: rgb(17,24,39);
  font-size: 1rem;
  font-weight: 600;
  leading: 1.5rem;
`}
                    id="modal-title"
                  >
                    {props.selectedVariant
                      ? `${props.selectedVariant.P.key} Variants`
                      : "All Variants"}{" "}
                    :
                  </As>
                  <As
                    as="div"
                    css={css`
  margin-top: 0.5rem;
`}
                  >
                    <TableInputField
                      data={
                        props.selectedVariant
                          ? props.selectedVariant
                          : graph.vertexes[formStoreVertex()?.P.formDataId]
                      }
                      isNoPermissionCheck={true}
                      isRealTime={false}
                      meta={graph.vertexes[metaVertexId]}
                      // txnId={formStoreVertex()?.P.txnId}
                    />
                  </As>
                </div>
              </div>
              <As
                as="div"
                css={css`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
`}
              >
                {error() && (
                  <As
                    as="div"
                    css={css`
  color: #FF0000;
`}
                  >
                    {error()}
                  </As>
                )}
                <As as="button" onClick={onVariantsSubmit}>
                  Submit
                </As>
                <As
                  as="button"
                  css={css`
  border-color: #FF0000;
  color: #FF0000;
`}
                  onClick={onVariantsCancel}
                >
                  Cancel
                </As>
              </As>
            </As>
          </As>
        </As>
      </As>
    </Portal>
  );
}
