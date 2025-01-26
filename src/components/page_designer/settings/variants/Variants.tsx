import { VariantsHeader } from "./header/VariantsHeader";
import { VariantsList } from "./body/VariantsList";
import { ComponentVariantsInput } from "../properties/ComponentVariantsInput";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject, useDesignerFormIdContext, useDesignerLayoutStore } from "../../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function Variants() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const setPropertyValue = (meta: Vertex, value: any) => {
    mergeVertexProperties(0, formStoreVertex()?.P.componentValue!, graph, setGraph, {
      [meta.P.key]: value,
    });
  };

  return (
    <div class="w-full">
      <VariantsHeader />
      <VariantsList />
      <ComponentVariantsInput
        setPropertyValue={setPropertyValue}
        compVertex={graph.vertexes[formStoreVertex()?.P.formDataId]}
        dataVertex={graph.vertexes[formStoreVertex()?.P.componentValue!]}
      />
    </div>
  );
}
