import type { SetStoreFunction, Store } from "solid-js/store";

import { makeEventListener } from "@solid-primitives/event-listener";

import type { GraphInterface } from "~/lib/graph/graph";

import { getGlobalStore } from "../graph/get/sync/getGlobalStore";
import { createActiveClickOutside } from "./createActiveClickOutside";

export function createClickOutside(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  callback: (event: MouseEvent) => void,
) {
  const activeClickOutside = createActiveClickOutside(graph, setGraph);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      activeClickOutside !==
      getGlobalStore(graph).P.activeClickOutside[getGlobalStore(graph).P.activeClickOutside.length - 1]
    ) {
      return;
    }
    callback(event);
  };
  makeEventListener(window, "mousedown", handleClickOutside);
  return activeClickOutside;
}
