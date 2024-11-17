import type { SetStoreFunction, Store } from "solid-js/store";

import { createUniqueId, onCleanup } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

export function createActiveClickOutside(
  _graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const currentId = createUniqueId();
  setGraph("activeClickOutside", (uniqueIds: string[]) => [
    ...uniqueIds,
    currentId,
  ]);

  onCleanup(() => {
    setGraph("activeClickOutside", (uniqueIds: string[]) =>
      uniqueIds.filter((id) => id !== currentId),
    );
  });

  return currentId;
}
