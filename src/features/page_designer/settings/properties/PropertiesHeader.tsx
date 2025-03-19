import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";

// depricated:
export function PropertiesHeader() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

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
