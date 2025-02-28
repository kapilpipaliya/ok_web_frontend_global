import type {
  GlobalProperties,
  GraphInterface,
  Id,
  Vertex,
} from "~/lib/graph/graph";

export function getEdgeOldIdToNewIdMap(graph: GraphInterface) {
  const vertex = graph.vertexes.edgeOldIdToNewIdMap as Vertex<Record<Id, Id>>;
  return vertex ? vertex.P : {};
}

export function getGlobalStore(graph: GraphInterface) {
  return (
    (graph.vertexes.globalStoreId as Vertex<GlobalProperties>) ??
    ({ P: {} } as Vertex<GlobalProperties>)
  );
}

export function getVertexOldIdToNewIdMap(graph: GraphInterface) {
  const vertex = graph.vertexes.vertexOldIdToNewIdMap as Vertex<Record<Id, Id>>;
  return vertex ? vertex.P : {};
}
