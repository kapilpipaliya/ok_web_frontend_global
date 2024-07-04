import type { SetStoreFunction, Store } from "solid-js/store";

import { onCleanup } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

export function useActiveClickOutside(graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>) {
  setGraph('activeClickOutside', prev => prev + 1);
  const activeClickOutside = graph.activeClickOutside;
  onCleanup(() => {
    setGraph('activeClickOutside', prev => prev - 1);
  })
  return activeClickOutside;
}