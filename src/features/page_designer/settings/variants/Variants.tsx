import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { ComponentVariantsInput } from "../properties/ComponentVariantsInput";
import { VariantsList } from "./body/VariantsList";
import { VariantsHeader } from "./header/VariantsHeader";

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
    <div class="w-full">
      <VariantsHeader />
      <VariantsList />
      <ComponentVariantsInput
        compVertex={graph.vertexes[formStoreVertex()?.P.formDataId]}
        dataVertex={graph.vertexes[formStoreVertex()?.P.componentValue!]}
        setPropertyValue={setPropertyValue}
      />
    </div>
  );
}
