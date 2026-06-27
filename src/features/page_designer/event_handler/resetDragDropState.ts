import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { clearLayoutPreviewHover } from "~/features/page_designer/functions/layout/previewHover";
import { syncHighlightedCompFromFormStore } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function resetDragDropState(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  batch(() => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreVertex.id,
      graph,
      setGraph,
      {
        activeItem: null,
        dragPosition: null,
      },
    );
    const formId = layoutStoreVertex.P.focusedFormId;
    if (formId) {
      mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
        hoverId: -1,
      });
      clearLayoutPreviewHover(layoutStoreVertex.id, graph, setGraph);
      syncHighlightedCompFromFormStore(
        layoutStoreVertex.id,
        graph.vertexes[formId] as Vertex<FormStoreObject>,
        graph,
        setGraph,
      );
    }
  });
}
