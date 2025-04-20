import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { ComponentVariantsInput } from "../properties/ComponentVariantsInput";
import { VariantsList } from "./body/VariantsList";
import { VariantsHeader } from "./header/VariantsHeader";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function Variants() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const setPropertyValue = (meta: Vertex, value: any) => {
    mergeVertexProperties(
      0,
      formStoreVertex()?.P.componentValue!,
      graph,
      setGraph,
      {
        [meta.P.key]: value,
      },
    );
  };

  return (
    <As as="div" css={css`
  width: 100%;
`}>
      <VariantsHeader />
      <VariantsList />
      <ComponentVariantsInput
        compVertex={graph.vertexes[formStoreVertex()?.P.formDataId]}
        dataVertex={graph.vertexes[formStoreVertex()?.P.componentValue!]}
        setPropertyValue={setPropertyValue}
      />
    </As>
  );
}
