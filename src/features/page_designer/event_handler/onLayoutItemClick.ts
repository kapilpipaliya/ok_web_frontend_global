import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import type {
  LayoutTreeScrollSource,
  PageLayoutObject,
} from "../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { syncHighlightedCompKey } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function onLayoutItemClick(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  selectedIndex = 0,
  scrollSource?: LayoutTreeScrollSource,
) {
  batch(() => {
    const layoutUpdates: Partial<PageLayoutObject> = {};
    if (layoutStoreVertex.P.focusedFormId !== formStoreVertex.id) {
      layoutUpdates.focusedFormId = formStoreVertex.id;
    }
    if (scrollSource) {
      layoutUpdates.layoutTreeScrollSource = scrollSource;
    }
    if (Object.keys(layoutUpdates).length > 0) {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreVertex.id,
        graph,
        setGraph,
        layoutUpdates,
      );
    }
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id,
      graph,
      setGraph,
      {
        selectedId: layoutVertexId ?? -1,
        selectedIndex,
      },
    );
    if (layoutVertexId != null && layoutVertexId !== -1) {
      syncHighlightedCompKey(
        layoutStoreVertex.id,
        layoutVertexId,
        graph,
        setGraph,
      );
    }
  });
}
