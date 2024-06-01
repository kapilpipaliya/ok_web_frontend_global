import type { Store } from "solid-js/store";
import type { GraphInterface, Id } from "~/lib/graph/graph";

// helper function to find all the vertex ids of the label

export async function findVertexIdsByLabelAsync(
  graph: Store<GraphInterface>,
  label: string,
): Promise<Id[]> {
  return graph.vertexLabelIdMap[label] || [];
}

export async function findVertexByLabelAndUniqueIdAsync(
  graph: Store<GraphInterface>,
  label: string,
  attribute: string,
  value: number | string,
) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export async function findVertexByLabelAndPksAsync(
  label: string,
  value: {
    [key: string]: number | string | boolean;
  },
  graph: Store<GraphInterface>,
) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find((vertexId) => {
    for (const valueKey in value) {
      if (value[valueKey] !== graph.vertexes[vertexId].P[valueKey]) {
        return false;
      }
    }
    return true;
  });
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export async function findVertexByLabelAndUniqueIdWithSkipAsync(
  label: string,
  attribute: string,
  value: any,
  skipId: number,
  graph: Store<GraphInterface>,
) {
  let vertexIds = graph.vertexLabelIdMap[label] || [];
  if (skipId !== undefined) {
    vertexIds = vertexIds.filter((value) => value !== skipId);
  }
  const vertexId = vertexIds.find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );

  return vertexId ? graph.vertexes[vertexId] : undefined;
}
