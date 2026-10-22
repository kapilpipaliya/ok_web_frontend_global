import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import { getDefaultTxnValue } from "~/lib/graph/transaction/value/getDefaultTxnValue";
import type { TransactionDetail } from "~/lib/graph/transaction/types/TransactionDetail";

export type TestGraph = {
  graph: Store<GraphInterface>;
  setGraph: SetStoreFunction<GraphInterface>;
};

export function createEmptyGraph(
  overrides: Partial<GraphInterface> = {},
): TestGraph {
  const [graph, setGraph] = createStore<GraphInterface>({
    broadcastChannels: [],
    edges: {},
    vertexes: {},
    vertexLabelIdMap: {},
    ...overrides,
  });
  return { graph, setGraph };
}

export function createVertex(
  id: string,
  labels: string[],
  properties: Record<string, unknown> = {},
  adjacency: { IN?: Vertex["IN"]; OUT?: Vertex["OUT"] } = {},
): Vertex {
  return {
    id,
    L: labels,
    P: properties,
    IN: adjacency.IN ?? {},
    OUT: adjacency.OUT ?? {},
  };
}

export function createEdge(
  id: string,
  type: string,
  startId: string,
  endId: string,
  properties: Record<string, unknown> = {},
): Edge {
  return { id, T: type, S: startId, E: endId, P: properties };
}

/** Graph with globalStoreId + optional id-map vertices for mutate/txn tests. */
export function createGraphWithGlobalStore(
  options: {
    txnId_?: number;
    newVertexId_?: number;
    broadcastChannels?: string[];
    extraVertexes?: Record<string, Vertex>;
    extraEdges?: Record<string, Edge>;
    vertexLabelIdMap?: GraphInterface["vertexLabelIdMap"];
  } = {},
): TestGraph {
  const globalStore = createVertex("globalStoreId", ["GlobalStore"], {
    txnId_: options.txnId_ ?? 0,
    newVertexId_: options.newVertexId_ ?? 0,
  } satisfies Partial<GlobalProperties>);

  const vertexOldIdToNewIdMap = createVertex("vertexOldIdToNewIdMap", [
    "IdMap",
  ]);
  const edgeOldIdToNewIdMap = createVertex("edgeOldIdToNewIdMap", ["IdMap"]);

  return createEmptyGraph({
    broadcastChannels: options.broadcastChannels ?? [],
    vertexes: {
      globalStoreId: globalStore,
      vertexOldIdToNewIdMap,
      edgeOldIdToNewIdMap,
      ...options.extraVertexes,
    },
    edges: options.extraEdges ?? {},
    vertexLabelIdMap: options.vertexLabelIdMap ?? {},
  });
}

export function createTxnVertex(
  txnId: number,
  overrides: Partial<TransactionDetail> = {},
): Vertex {
  return createVertex(`txn${txnId}`, ["Transaction"], {
    ...getDefaultTxnValue(),
    status: "idle",
    lastModified: Date.now(),
    ...overrides,
  });
}

export function seedVertex(
  setGraph: SetStoreFunction<GraphInterface>,
  vertex: Vertex,
) {
  setGraph("vertexes", vertex.id, vertex);
  for (const label of vertex.L) {
    setGraph("vertexLabelIdMap", label, (ids: string[] | undefined) =>
      Array.isArray(ids) ? [...new Set([...ids, vertex.id])] : [vertex.id],
    );
  }
}
