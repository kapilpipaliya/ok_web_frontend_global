import { batch, } from "solid-js";
import type { SetStoreFunction, } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "../../graph/get/sync/traverse";
import { getComponentFromLayoutRow } from "~/lib/drag_drop/drop/getComponentFromLayoutRow";
import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";


export function onLayoutItemClick( setLayoutStore: SetStoreFunction<PageLayoutObject>, layoutVertex: Vertex, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  batch(() => {
    setLayoutStore('selectedId', -1);
    setLayoutStore('selectedComponent', -1);
    setLayoutStore('selectedColl', -1);

    setLayoutStore('selectedId', layoutVertex.id);
    const collVertex = getChildVertex(
      graph,
      ["$0Coll"],
      graph.vertexes[(layoutVertex.id)]
    );
    setLayoutStore('selectedColl', collVertex?.vertex?.id ?? -1);
    const componentVertex = getComponentFromLayoutRow(
      (layoutVertex.id),
      graph,
      setGraph
    );
    setLayoutStore('selectedComponent', componentVertex?.id ?? -1);
  });
}
