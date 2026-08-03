import type { Session } from "neo4j-driver";

import { fetchComponentDataPure } from "~/cypher/get/fetchComponentDataPure";
import type { ServerResult } from "~/cypher/types/ServerResult";

import { extractComponentNames } from "./extractComponentNames";
import { mergeGraphs } from "./graphFetchUtils";

export type FetchComponentDataOptions = {
  /** Component keys the client already has — skip fetch and wire transfer. */
  skipKeys?: Iterable<string>;
  /**
   * Optional loader used by server code to fetch a batch of component names
   * (e.g. via the per-component Redis cache). Defaults to a direct DB fetch.
   */
  loadComponents?: (
    componentNames: string[],
  ) => Promise<ServerResult | undefined>;
};

/**
 * Fetches component data for all components referenced in the provided graph data.
 * Recursively fetches nested components until all dependencies are resolved.
 *
 * Components listed in `options.skipKeys` (already on the client) are not fetched
 * or returned. This module stays free of Redis/ioredis so it is safe to import
 * from browser code.
 */
export async function fetchComponentDataFromGraph(
  graphData?: ServerResult,
  dbSession?: Session,
  subDomain?: string,
  options?: FetchComponentDataOptions,
): Promise<ServerResult | undefined> {
  if (!graphData?.graph?.vertexes) {
    return undefined;
  }

  const skipKeys = new Set(options?.skipKeys ?? []);
  const loadComponents =
    options?.loadComponents ??
    ((names: string[]) => fetchComponentDataPure(names, dbSession, subDomain));

  const allFetchedComponents = new Set<string>();
  const componentDataResults: ServerResult[] = [];
  let currentVertices = graphData.graph.vertexes;

  while (true) {
    const componentNames = extractComponentNames(currentVertices);
    const newComponentNames = Array.from(componentNames).filter(
      (name) => !(allFetchedComponents.has(name) || skipKeys.has(name)),
    );

    if (newComponentNames.length === 0) {
      break;
    }

    for (const name of newComponentNames) {
      allFetchedComponents.add(name);
    }

    const componentData = await loadComponents(newComponentNames);

    if (componentData?.graph?.vertexes) {
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
