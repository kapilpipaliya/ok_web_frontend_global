import { ZIndex } from "~/components/fields/ZIndex";
import { useGraph } from "~/lib/graph/graph";
import type { PageLayoutObject } from "../context/LayoutContext";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { CloseIconTopRight } from "./CloseIconTopRight";
import { FormElementTabs } from "./FormElementTabs";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";

export function FormElementsWrapper() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <aside
      class={"rel"}
      classList={{
        hidden: !layoutStore().isLeftOpen,
      }}
    >
      <ZIndex>
        <CloseIconTopRight
          onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isLeftOpen: false })}
        />
      </ZIndex>
      <div
        class={`scrollbar-color:lightgrey flex {scrollbar-width:thin} border:1px|solid|lightgrey flex:column h:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 2}px) overflow:auto p:5 r:5|5|5|5`}
      >
        <FormElementTabs />
      </div>
    </aside>
  );
}
