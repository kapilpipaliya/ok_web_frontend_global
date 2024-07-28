import type { SetStoreFunction, Store } from "solid-js/store";

import { makeEventListener } from "@solid-primitives/event-listener";

import type { GraphInterface } from "~/lib/graph/graph";

import { useActiveClickOutside } from "~/components/useActiveClickOutside";

export function useClickOutside(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  callback: (event: MouseEvent) => void,
) {
  const activeClickOutside = useActiveClickOutside(graph, setGraph);
  const handleClickOutside = (event: MouseEvent) => {
    if (activeClickOutside < graph.activeClickOutside) return;
    callback(event);
  };
  makeEventListener(window, "mousedown", handleClickOutside);
  return activeClickOutside;
}
