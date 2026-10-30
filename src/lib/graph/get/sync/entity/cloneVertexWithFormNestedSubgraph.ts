import type { SetStoreFunction } from "solid-js/store";

import { untrack } from "solid-js";

import { generateNewVertexId } from "../../../mutate/core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface CloneFormNestedSubgraphSpec {
  deepCloneOutgoingRelationshipTypes: string[];
  remapParentElementPropertyKeys?: string[];
}

export interface CloneFormNestedSubgraphResult {
  root: Vertex;
  nestedLineSourceIdByCloneId: Record<string, string>;
}

/**
 * Clone a table row for form edit: shallow-clone the root (all IN + non-deep OUT),
 * deep-clone vertices along configured nested-line OUT types, shallow-clone other OUT (e.g. to File).
 * Returns a map from each cloned nested-line vertex id → original Neo4j element id (no synthetic P keys).
 */
export function cloneVertexWithFormNestedSubgraph(
  txnId: number,
  vertex: Vertex,
  extraProperties: Record<string, unknown>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  spec: CloneFormNestedSubgraphSpec,
): CloneFormNestedSubgraphResult {
  const deepTypes = new Set(
    (spec.deepCloneOutgoingRelationshipTypes || [])
      .map((t) => String(t).trim())
      .filter((t) => t !== ""),
  );
  const remapKeys = (spec.remapParentElementPropertyKeys || [])
    .map((k) => String(k).trim())
    .filter((k) => k !== "");

  const idMap: Record<string, string> = {};
  const nestedLineSourceIdByCloneId: Record<string, string> = {};

  const cloneRecursive = (
    source: Vertex,
    isFormRoot: boolean,
    parentSourceId: string | null,
  ): string => {
    const existingCloneId = idMap[source.id];
    if (existingCloneId) {
      return existingCloneId;
    }

    const newId = untrack(() => generateNewVertexId(graph, setGraph));
    idMap[source.id] = newId;

    const nextP: Record<string, unknown> = { ...source.P };
    for (let remapIndex = 0; remapIndex < remapKeys.length; remapIndex++) {
      const remapKey = remapKeys[remapIndex];
      const raw = nextP[remapKey];
      if (raw == null || raw === "") continue;
      const mapped = idMap[String(raw)];
      if (mapped) nextP[remapKey] = mapped;
    }
    if (isFormRoot) {
      Object.assign(nextP, extraProperties);
    }

    untrack(() => {
      addNewVertex(
        txnId,
        newVertex(newId, [...source.L], nextP as { [key: string]: unknown }),
        graph,
        setGraph,
      );

      for (const edgeType in source.OUT) {
        const outEdgeIds = source.OUT[edgeType];
        if (!Array.isArray(outEdgeIds)) continue;
        for (let outIndex = 0; outIndex < outEdgeIds.length; outIndex++) {
          const outEdge = graph.edges[outEdgeIds[outIndex]];
          if (!outEdge) continue;
          if (deepTypes.has(edgeType)) {
            const target = graph.vertexes[outEdge.E];
            if (!target) continue;
            const targetCloneId = cloneRecursive(target, false, source.id);
            nestedLineSourceIdByCloneId[targetCloneId] = target.id;
            const deepEdge = newEdge(
              generateNewVertexId(graph, setGraph),
              outEdge.T,
              outEdge.P,
              newId,
              targetCloneId,
            );
            addNewEdge(txnId, deepEdge, graph, setGraph);
          } else {
            const shallowEdge = newEdge(
              generateNewVertexId(graph, setGraph),
              outEdge.T,
              outEdge.P,
              newId,
              outEdge.E,
            );
            addNewEdge(txnId, shallowEdge, graph, setGraph);
          }
        }
      }

      for (const edgeType in source.IN) {
        const inEdgeIds = source.IN[edgeType];
        if (!Array.isArray(inEdgeIds)) continue;
        for (let inIndex = 0; inIndex < inEdgeIds.length; inIndex++) {
          const inEdge = graph.edges[inEdgeIds[inIndex]];
          if (!inEdge) continue;
          if (!isFormRoot && parentSourceId != null && inEdge.S === parentSourceId) {
            continue;
          }
          const inCopy = newEdge(
            generateNewVertexId(graph, setGraph),
            inEdge.T,
            inEdge.P,
            inEdge.S,
            newId,
          );
          addNewEdge(txnId, inCopy, graph, setGraph);
        }
      }
    });

    return newId;
  };

  untrack(() => {
    cloneRecursive(vertex, true, null);
  });

  const root = graph.vertexes[idMap[vertex.id]];
  return { root, nestedLineSourceIdByCloneId };
}
