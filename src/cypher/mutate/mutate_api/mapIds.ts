
export function mapIds(idMap: any[], idMapStore: Map<number, number>) {
  for (const [oldId, newId] of idMap) {
    idMapStore.set(oldId, newId);
  }
}
