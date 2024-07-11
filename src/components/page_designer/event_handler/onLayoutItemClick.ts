import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";

export function onLayoutItemClick(
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    setLayoutStore("selectedId", -1);
    setLayoutStore("selectedComponent", -1);

    setLayoutStore("selectedId", layoutVertex.id);

    const componentVertex = getComponentFromLayoutRow(
      layoutVertex.id,
      graph,
      setGraph,
    );
    setLayoutStore("selectedComponent", componentVertex?.id ?? -1);
  });
}
