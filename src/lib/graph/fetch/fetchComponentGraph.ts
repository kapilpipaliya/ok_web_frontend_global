import type { Session } from "neo4j-driver";

import { fetchComponentDataPure } from "~/cypher/get/fetchComponentDataPure";
import type { ServerResult } from "~/cypher/types/ServerResult";

import { extractComponentNames } from "./extractComponentNames";
import { mergeGraphs } from "./graphFetchUtils";

/**
 * Fetches component data for all components referenced in the provided graph data.
 * Recursively fetches nested components until all dependencies are resolved.
 */
export async function fetchComponentDataFromGraph(
  graphData?: ServerResult,
  dbSession?: Session,
  subDomain?: string,
): Promise<ServerResult | undefined> {
  if (!graphData?.graph?.vertexes) {
    return undefined;
  }

  const allFetchedComponents = new Set<string>();
  const componentDataResults: ServerResult[] = [];
  let currentVertices = graphData.graph.vertexes;

  while (true) {
    const componentNames = extractComponentNames(currentVertices);
    const newComponentNames = Array.from(componentNames).filter(
      (name) => !allFetchedComponents.has(name),
    );

    if (newComponentNames.length === 0) {
      break;
    }

    const componentData = await fetchComponentDataPure(
      newComponentNames,
      dbSession,
      subDomain,
    );

    if (componentData?.graph?.vertexes) {
      for (const name of newComponentNames) {
        allFetchedComponents.add(name);
      }

      componentDataResults.push(componentData);
      currentVertices = componentData.graph.vertexes;
    } else {
      break;
    }
  }

  return mergeGraphs(componentDataResults);
}

export async function fetchComponentDataWithNested(
  componentNames: string[],
  dbSession?: Session,
): Promise<ServerResult | undefined> {
  const initial = await fetchComponentDataPure(componentNames, dbSession);
  if (!initial?.graph) {
    return undefined;
  }

  const nested = await fetchComponentDataFromGraph(initial, dbSession);
  return mergeGraphs(nested ? [initial, nested] : [initial]);
}
