import { batch, Setter } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "../../graph/get/sync/traverse";
import { getComponentFromLayoutRow } from "~/lib/drag_drop/drop/getComponentFromLayoutRow";


export function onLayoutItemClick(setSelectedId: Setter<string | number>, setSelectedComponent: Setter<{
  vertexId: string | number;
}>, setSelectedColl: Setter<{
  vertexId: string | number;
}>, layoutVertex: Vertex, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  batch(() => {
    setSelectedId(-1);
    setSelectedComponent({ vertexId: -1 });
    setSelectedColl({ vertexId: -1 });

    setSelectedId(layoutVertex.id);
    const collVertex = getChildVertex(
      graph,
      ["$0Coll"],
      graph.vertexes[(layoutVertex?.id)!]
    );
    setSelectedColl({ vertexId: collVertex?.vertex?.id || -1 });
    const componentVertex = getComponentFromLayoutRow(
      (layoutVertex?.id)!,
      graph,
      setGraph
    );
    setSelectedComponent({ vertexId: componentVertex?.id || -1 });
  });
}
