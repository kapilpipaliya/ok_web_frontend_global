import { useGraph, type Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore, PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";
import { OpenComponentURL } from "../../OpenComponentURL";

export function PropertiesHeader() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const getComponentName = () =>
    formStoreVertex()?.P.selectedId !== -1 && formStoreVertex()?.P.selectedComponent !== -1
      ? graph.vertexes[formStoreVertex()?.P.selectedComponent].P.key || ""
      : "";

  return (
    <div class="flex ai:center cursor:pointer jc:space-between">
      <div class="f:16 flex:grow font-weight:bold mb:2px ml:5px p:3|0 text-align:left">
        {getComponentName()} Properties{" "}
        <OpenComponentSettings id={formStoreVertex()?.P.selectedComponent as string} />
        <OpenComponentURL
          meta={graph.vertexes[formStoreVertex()?.P.selectedComponent]}
        />
      </div>
    </div>
  );
}
