import { createSignal, onCleanup, Show } from "solid-js";

import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { ZIndex } from "~/components/fields/ZIndex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { ComponentLabel, FormMetaData } from "~/lib/meta/formMetaData";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../../context/LayoutContext";
import { VariantsModal } from "../../../variants/VariantsModal";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { CommonAddComponent } from "../../rules/CommonAddComponent";

export function AddNewVariant(
  props: Readonly<{ onClose: (rowVertex?: Vertex) => void }>,
) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const prevTxnIndex = getLastTxnIndex(formStoreVertex()?.P.txnId, graph);
  const [selectedVariant, setSelectedVariant] = createSignal<Vertex>();
  const metaTxnId = generateNewTxnId(graph, setGraph);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const addNewState = (key: string) => {
    const variantMetaVertexId = generateNewVertexId(graph, setGraph);

    const metaAttribute = FormMetaData[ComponentLabel].attributes.find(
      (x) => x.key === "Variant",
    )!;
    addNewVertex(
      metaTxnId,
      newVertex(variantMetaVertexId, ["Attr"], metaAttribute),
      graph,
      setGraph,
    );

    const rowResult = insertNewRow(
      formStoreVertex()?.P.txnId,
      graph.vertexes[variantMetaVertexId],
      graph.vertexes[formStoreVertex()?.P.formDataId!],
      false,
      graph,
      setGraph,
      { key },
    );

    const variant = graph.vertexes[rowResult!.vertexId!];

    const variantValueMetaVertexId = generateNewVertexId(graph, setGraph);
    const variantValueMetaAttribute = metaAttribute.attributes!.find(
      (x) => x.key === "value",
    );
    if (!variantValueMetaAttribute) {
      throw new Error("Variant value meta attribute not found");
    }
    addNewVertex(
      metaTxnId,
      newVertex(variantValueMetaVertexId, ["Attr"], variantValueMetaAttribute),
      graph,
      setGraph,
    );

    insertNewRow(
      formStoreVertex()?.P.txnId,
      graph.vertexes[variantValueMetaVertexId],
      variant,
      false,
      graph,
      setGraph,
    );

    setSelectedVariant(variant);
  };

  return (
    <CommonAddComponent
      addNewState={addNewState}
      label="Enter Variant Name"
      onClose={props.onClose}
      placeholder="Enter Variant key"
      title="Add New Variant"
    >
      <Show when={selectedVariant()}>
        <ZIndex>
          <VariantsModal
            closeModal={props.onClose}
            onSubmit={() => {
              props.onClose(selectedVariant());
            }}
            prevTxnIndex={prevTxnIndex}
            selectedVariant={selectedVariant()}
          />
        </ZIndex>
      </Show>
    </CommonAddComponent>
  );
}
