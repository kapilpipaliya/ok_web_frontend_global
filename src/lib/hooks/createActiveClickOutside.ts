import type { SetStoreFunction, Store } from "solid-js/store";

import { createUniqueId, onCleanup } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
import type {
  GlobalProperties,
  GraphInterface,
} from "~/lib/graph/GraphContext";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export function createActiveClickOutside(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const currentId = createUniqueId();
  const globalStoreId = "globalStoreId";

  const currentActiveClickOutside =
    (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P
      .activeClickOutside || [];
  const newActiveClickOutside = [...currentActiveClickOutside, currentId];

  mergeVertexProperties(0, globalStoreId, graph, setGraph, {
    activeClickOutside: newActiveClickOutside,
  });

  onCleanup(() => {
    const currentActiveClickOutside =
      (graph.vertexes[globalStoreId] as Vertex<GlobalProperties>).P
        .activeClickOutside || [];
    const updatedActiveClickOutside = currentActiveClickOutside.filter(
      (id) => id !== currentId,
    );
    mergeVertexProperties(0, globalStoreId, graph, setGraph, {
      activeClickOutside: updatedActiveClickOutside,
    });
  });

  return currentId;
}
