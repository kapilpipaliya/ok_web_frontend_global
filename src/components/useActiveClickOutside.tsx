import { onCleanup } from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store";

import { GraphInterface } from "~/lib/graph/graph";

export function useActiveClickOutside(graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>) {
  setGraph('activeClickOutside', prev => prev + 1);
  const activeClickOutside = graph.activeClickOutside;
  onCleanup(() => {
    setGraph('activeClickOutside', prev => prev - 1);
  })
  return activeClickOutside;
}