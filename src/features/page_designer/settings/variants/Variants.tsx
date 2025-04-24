import { Icon } from "@iconify-icon/solid";
import { createSignal, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { IconButton } from "~/components/styled/IconButton";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { ComponentVariantsInput } from "../properties/ComponentVariantsInput";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { ZIndex } from "~/components/fields/ZIndex";
import { VariantsModal } from "../../variants/VariantsModal";

export function Variants() {
  const [graph, setGraph] = useGraph();
  const [showVariantModal, setShowVariantModal] = createSignal(false);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const setPropertyValue = (meta: Vertex, value: unknown) => {
    if (formStoreVertex()?.P.componentValue) {
      mergeVertexProperties(
        0,
        formStoreVertex().P.componentValue as string,
        graph,
        setGraph,
        {
          [meta.P.key]: value,
        },
      );
    }
  };

  const handleAddVariant = () => {
    setShowVariantModal(true);
  };

  const closeModal = () => {
    setShowVariantModal(false);
  };

  return (
    <As
      as="div"
      css={css`
  margin-top: 6px;
  width: 100%;
`}
    >
      <As
        as="div"
        css={css`
          display: flex;
          gap: 0.5rem;
          align-items: center;
        `}
      >
        <As
          as="h3"
          css={css`
            color: rgb(17,24,39);
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <Icon icon="ph:stack" />
          Variants
        </As>
        <IconButton
          icon="ph:pencil"
          css={css`
            background-color: \${args.theme.var.color.primary_15};
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            &:hover {
              background-color: \${args.theme.var.color.primary_50};
            }
          `}
          size="18"
          aria-label="Add new variant"
          onClick={handleAddVariant}
        />
      </As>

      <As
        as="div"
        css={css`
  margin-top: 0.5rem;
`}
      >
        <Show when={formStoreVertex()?.P.formDataId && formStoreVertex()?.P.componentValue}>
          <ComponentVariantsInput
            compVertex={graph.vertexes[formStoreVertex()!.P.formDataId!]}
            dataVertex={graph.vertexes[formStoreVertex()!.P.componentValue!]}
            setPropertyValue={setPropertyValue}
          />
        </Show>
      </As>

      <Show when={showVariantModal()}>
        <ZIndex>
          <VariantsModal
            closeModal={closeModal}
            onSubmit={closeModal}
          />
        </ZIndex>
      </Show>
    </As>
  );
}
