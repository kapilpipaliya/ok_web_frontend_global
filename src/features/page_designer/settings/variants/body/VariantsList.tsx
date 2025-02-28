import { createMemo, createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";
import { SimpleWithDismissButton } from "~/components/styled/SimpleModal";
import { evalExpression } from "~/lib/expression_eval";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/vertex/deleteRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../../../context/LayoutContext";
import { VariantsModal } from "../../../variants/VariantsModal";

export function VariantsList() {
  const [graph, setGraph] = useGraph();
  const [selectedVariant, setSelectedVariant] = createSignal<null | Vertex>(
    null,
  );
  const [selectedVariantToDelete, setSelectedVariantToDelete] =
    createSignal<null | Vertex>(null);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const variants = createMemo(() => {
    if (formStoreVertex()?.P.formDataId) {
      return (
        evalExpression("->Variant", {
          graph,
          setGraph,
          vertexes: [graph.vertexes[formStoreVertex()?.P.formDataId!]],
        }) || []
      ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
    }
    return [];
  });

  const openVariantSettings = (variant: Vertex) => {
    setSelectedVariant(variant);
  };

  const closeVariantSettings = () => {
    setSelectedVariant(null);
  };

  const highlightVariant = (variant: Vertex) => {
    const incomingIds: Id[] = [];
    for (const key in variant.IN) {
      for (const edge of variant.IN[key]) {
        incomingIds.push(graph.edges[edge].S);
      }
    }
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      multiHighlight: incomingIds,
    });
  };

  const variantUsageCount = (variant: Vertex) => {
    const count: Id[] = [];
    for (const key in variant.IN) {
      for (const edge of variant.IN[key]) {
        if (graph.edges[edge].S !== formStoreVertex()?.P.formDataId) {
          count.push(graph.edges[edge].S);
        }
      }
    }
    return count;
  };

  const unhighlightVariant = () => {
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      multiHighlight: [],
    });
  };

  const removeAllValues = (variant: Vertex) => {
    const values =
      evalExpression("->$0Value", {
        graph,
        setGraph,
        vertexes: [variant],
      }) || [];
    for (const value of values) {
      deleteRow(value, false, graph, setGraph, formStoreVertex()?.P.txnId);
    }
  };

  const deleteVariant = (variant: Vertex) => {
    removeAllValues(variant);
    deleteRow(variant, false, graph, setGraph, formStoreVertex()?.P.txnId);
    setSelectedVariantToDelete(null);
  };

  const DeleteConfirmDialog = () => {
    const variantUsage = createMemo(() =>
      variantUsageCount(selectedVariantToDelete()!),
    );
    return (
      <ZIndex>
        <SimpleWithDismissButton
          closeButtonText="Cancel"
          confirmButtonText="Delete"
          description={"Are you sure you want to delete this variant?"}
          onClose={() => setSelectedVariantToDelete(null)}
          onConfirm={() => deleteVariant(selectedVariantToDelete()!)}
          title="Delete Variant"
        >
          <div class="mt:1rem">
            <p>
              The variant is used at {variantUsage().length} attributes. It will
              be removed from all places where it is used.
            </p>
            <For each={variantUsage()}>
              {(id) => <div>{graph.vertexes[id].P.key}</div>}
            </For>
          </div>
        </SimpleWithDismissButton>
      </ZIndex>
    );
  };

  return (
    <>
      <For each={variants()}>
        {(variant, index) => (
          <div
            class="lh:1.25rem flex align-items:center b:1px|solid|lightgrey bg:gray-10:hover color:rgb(55,65,81) f:0.875rem jc:space-between px:1rem py:0.5rem"
            classList={{
              "bt:none": index() !== 0,
            }}
            onMouseEnter={() => highlightVariant(variant)}
            onMouseLeave={() => unhighlightVariant()}
          >
            <span class="flex:1">
              {variant.P.key} ({variantUsageCount(variant).length} usage
              {variantUsageCount(variant).length > 1 ? "s" : ""})
            </span>
            <div class="flex gap:2">
              <IconButton
                class="cursor:pointer opacity:.5 opacity:1:hover"
                icon="ph:gear"
                onClick={() => openVariantSettings(variant)}
                size={22}
                title="Edit Variant"
                type="button"
              />
              <IconButton
                class="cursor:pointer opacity:.5 opacity:1:hover"
                icon="mage:trash"
                onClick={() => setSelectedVariantToDelete(variant)}
                size={22}
                title="Delete Variant"
                type="button"
              />
            </div>
          </div>
        )}
      </For>
      <Show when={selectedVariant()}>
        <ZIndex>
          <VariantsModal
            closeModal={closeVariantSettings}
            onSubmit={() => closeVariantSettings()}
            selectedVariant={selectedVariant()}
          />
        </ZIndex>
      </Show>
      <Show when={selectedVariantToDelete()}>
        <DeleteConfirmDialog />
      </Show>
    </>
  );
}
