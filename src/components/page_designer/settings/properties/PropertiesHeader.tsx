import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "../../context/LayoutContext";

export function PropertiesHeader() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <div class="flex ai:center cursor:pointer jc:space-between">
      <div class="f:16 flex:grow font-weight:bold mb:2px ml:5px p:3|0 text-align:left">
        Properties
        {/* <OpenComponentSettings id={formStoreVertex()?.P.selectedComponent as string} />
        <OpenComponentURL
          meta={graph.vertexes[formStoreVertex()?.P.selectedComponent]}
        /> */}
      </div>
    </div>
  );
}
