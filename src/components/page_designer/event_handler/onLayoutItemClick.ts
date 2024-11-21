import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id } from "~/lib/graph/graph";

import { getComponentFromLayoutRow } from "~/components/page_designer/functions/drop/getComponentFromLayoutRow";

export function onLayoutItemClick(
  setLayoutStore: SetStoreFunction<PageLayoutObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    setLayoutStore("selectedId", layoutVertexId ?? -1);

    const componentVertex = getComponentFromLayoutRow(
      layoutVertexId,
      graph,
      setGraph,
    );
    setLayoutStore("selectedComponent", componentVertex?.id ?? -1);
  });
}
