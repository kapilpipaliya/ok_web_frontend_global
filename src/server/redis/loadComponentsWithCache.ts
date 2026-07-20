import type { Session } from "neo4j-driver";

import { fetchComponentDataPure } from "~/cypher/get/fetchComponentDataPure";
import type { ServerResult } from "~/cypher/types/ServerResult";
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import {
  mergeGraphs,
  prepareGraphForWireTransfer,
} from "~/lib/graph/fetch/graphFetchUtils";
import { splitGraphByComponentKeys } from "~/lib/graph/fetch/splitGraphByComponentKeys";
import {
  getCachedComponent,
  setCachedComponent,
} from "~/server/redis/componentCache";

/**
 * Server-only: load components via per-key L1+Redis cache, falling back to Neo4j.
 * Kept out of shared client modules so ioredis never enters the browser bundle.
 */
export async function loadComponentsWithCache(
  componentNames: string[],
  dbSession: Session | undefined,
  subDomain: string | undefined,
  cacheSubDomain: string,
): Promise<ServerResult | undefined> {
  if (componentNames.length === 0) {
    return undefined;
  }

  const lookups = await Promise.all(
    componentNames.map(async (name) => ({
      name,
      cached: await getCachedComponent(cacheSubDomain, name),
    })),
  );

  const cachedResults: ServerResult[] = [];
  const misses: string[] = [];
  for (const { name, cached } of lookups) {
    if (cached?.graph) {
      cachedResults.push(cached);
    } else {
      misses.push(name);
    }
  }

  if (misses.length > 0) {
    const fetched = await fetchComponentDataPure(
      misses,
      dbSession,
      subDomain,
    );
    if (fetched?.graph) {
      prepareGraphForWireTransfer(fetched.graph);
      const split = splitGraphByComponentKeys(fetched, misses);
      await Promise.all(
        Array.from(split.entries()).map(([name, value]) =>
          setCachedComponent(cacheSubDomain, name, value),
        ),
      );
      cachedResults.push(fetched);
    }
  }

  return mergeGraphs(cachedResults);
}

/** Fetch page/component graphs with skipKeys + per-component server cache. */
export async function fetchComponentDataFromGraphCached(
  graphData: ServerResult | undefined,
  dbSession: Session | undefined,
  subDomain: string | undefined,
  options: {
    skipKeys?: Iterable<string>;
    cacheSubDomain: string;
  },
): Promise<ServerResult | undefined> {
  return fetchComponentDataFromGraph(graphData, dbSession, subDomain, {
    skipKeys: options.skipKeys,
    loadComponents: (names) =>
      loadComponentsWithCache(
        names,
        dbSession,
        subDomain,
        options.cacheSubDomain,
      ),
  });
}
