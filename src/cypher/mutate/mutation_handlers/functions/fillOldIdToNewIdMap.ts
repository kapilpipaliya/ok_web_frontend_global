import type { Id } from "~/lib/graph/graph";

export function fillOldIdToNewIdMap(
  idMap: [Id, Id][],
  idMapStore: Map<Id, Id>,
) {
  for (const [oldId, newId] of idMap) {
    idMapStore.set(oldId, newId);
  }
}
