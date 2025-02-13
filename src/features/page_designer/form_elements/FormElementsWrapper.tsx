import { useGraph } from "~/lib/graph/graph";

import type { PageLayoutObject } from "../context/LayoutContext";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { FormElementTabs } from "./FormElementTabs";

export function FormElementsWrapper() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const _layoutStore = () =>
    graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <aside
    // class={"rel"}
    // classList={{
    //   hidden: !layoutStore().isLeftOpen,
    // }}
    >
      {/* <ZIndex>
        <CloseIconTopRight
          onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isLeftOpen: false })}
        />
      </ZIndex> */}
      <div class={"border:1px|solid|lightgrey r:5|5|5|5"}>
        <FormElementTabs />
      </div>
    </aside>
  );
}
