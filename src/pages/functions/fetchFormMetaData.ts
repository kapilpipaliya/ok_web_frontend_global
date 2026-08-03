import type { Session } from "neo4j-driver";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getSubdomainForRequest } from "~/cypher/session/getSessionForSubdomain";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import {
  getFormMetaDataCacheKey,
  getFormMetaDataCacheTtl,
  redisCacheGetOrSet,
} from "~/server/redis/redisCache";
import { resolveDynamicPageUrl } from "./resolveDynamicPageUrl";
import type { FetchFormMetaDataResult } from "./fetchPageData";
import { fetchComponentDataFromGraphCached } from "~/server/redis/loadComponentsWithCache";
import { prepareGraphForWireTransfer } from "~/lib/graph/fetch/graphFetchUtils";
import {
  extractRootIdFromResult,
  stripResultFromServerResult,
} from "~/lib/graph/fetch/wirePayloadUtils";
import { stripVertexAdjacency } from "~/lib/graph/transfer/stripVertexAdjacency";

/**
 * L1 in-process cache of page-only metadata (no componentData).
 * Components live in a separate per-key cache — see componentCache.ts.
 */
const MEMORY_TTL_MS = 15_000;
const MAX_MEMORY_ENTRIES = 200;

interface MemoryEntry {
  value: FetchFormMetaDataResult;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();

function getFromMemoryCache(key: string): FetchFormMetaDataResult | undefined {
  const entry = memoryCache.get(key);
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setInMemoryCache(key: string, value: FetchFormMetaDataResult): void {
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey !== undefined) {
      memoryCache.delete(oldestKey);
    }
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + MEMORY_TTL_MS });
}

/** Clear the L1 page metadata cache (all subdomains, or a single one). */
export function clearFormMetaDataMemoryCache(subDomain?: string): void {
  if (!subDomain) {
    memoryCache.clear();
    return;
  }
  const prefix = `form-meta:${subDomain}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function fetchFormMetaData(
  // graph: GraphInterface,
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  isDesignMode?: boolean,
  pageKeyName?: string,
  url?: string,
  skipComponentData?: boolean,
  dbSession?: Session,
  /** Database name for `dbSession`; required to fetch nested data outside a request context (e.g. queue workers). */
  subDomain?: string,
  /**
   * Component keys the client already has in its graph (post-hydration).
   * Server skips fetching/sending those to shrink the wire payload.
   */
  knownComponentKeys?: string[],
): Promise<FetchFormMetaDataResult> {
  "use server";
  if (isDesignMode) {
    const form = FormMetaData[pageVertexName!];
    // can't return form, if it contins functions
    return { form };
  }
  if (pageVertexName === "Function") {
    const form = FormMetaData[pageVertexName!];
    return { form };
  }

  if (!dbSession) {
    const { subDomain: requestSubDomain } = await getSubdomainForRequest();

    // Resolve dynamic ":param" urls (e.g. /users/john/12/profile.html) to the
    // page's stored url pattern so all concrete urls share one cache entry and
    // one DB query, and dynamic pages load on the first request (empty graph).
    const resolvedUrl = url
      ? await resolveDynamicPageUrl(requestSubDomain, url, pageVertexName)
      : url;

    // Page cache is always component-free so knownComponentKeys can vary per
    // client without busting the shared page entry.
    const cacheKey = getFormMetaDataCacheKey(requestSubDomain, {
      pageVertexName,
      formId,
      expression,
      pageKeyName,
      url: resolvedUrl,
      skipComponentData: true,
    });

    const memoryHit = getFromMemoryCache(cacheKey);
    const pageResult =
      memoryHit ??
      (await redisCacheGetOrSet(
        cacheKey,
        () =>
          fetchFormMetaDataFromDB(
            pageVertexName,
            formId,
            expression,
            pageKeyName,
            resolvedUrl,
            true,
            undefined,
            requestSubDomain,
          ),
        {
          ttl: getFormMetaDataCacheTtl(),
          shouldCache: (result) => !result.error,
        },
      ));

    if (!(memoryHit || pageResult.error)) {
      setInMemoryCache(cacheKey, pageResult);
    }

    if (pageResult.error || skipComponentData) {
      return pageResult;
    }

    const componentData = await fetchComponentDataFromGraphCached(
      pageResult.data,
      undefined,
      requestSubDomain,
      {
        skipKeys: knownComponentKeys,
        cacheSubDomain: requestSubDomain,
      },
    );

    prepareGraphForWireTransfer(componentData?.graph);

    return { ...pageResult, componentData };
  }

  const resolvedUrl = url
    ? await resolveDynamicPageUrl("", url, pageVertexName, dbSession)
    : url;

  const pageResult = await fetchFormMetaDataFromDB(
    pageVertexName,
    formId,
    expression,
    pageKeyName,
    resolvedUrl,
    true,
    dbSession,
    subDomain,
  );

  if (pageResult.error || skipComponentData) {
    return pageResult;
  }

  const componentData = await fetchComponentDataFromGraphCached(
    pageResult.data,
    dbSession,
    subDomain,
    {
      skipKeys: knownComponentKeys,
      cacheSubDomain: subDomain || "",
    },
  );

  prepareGraphForWireTransfer(componentData?.graph);

  return { ...pageResult, componentData };
}

async function fetchFormMetaDataFromDB(
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  pageKeyName?: string,
  url?: string,
  skipComponentData?: boolean,
  dbSession?: Session,
  subDomain?: string,
): Promise<FetchFormMetaDataResult> {
  const form = FormMetaData[pageVertexName ?? "Page"] || FormMetaData.Page;
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

  const data = await fetchDataFromDB(
    {
      expression:
        expression ??
        (formId
          ? `id:'${formId}'`
          : url
            ? `g:'${pageVertexName ?? "Page"}[$urlFilter]'`
            : `g:'${pageVertexName ?? "Page"}[${pageKeyName}]'`),
      // [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    },
    {
      nodes: {},
      relationships: {},
      ...(dbSession ? { dbSession } : {}),
      ...(subDomain ? { subDomain } : {}),
      $urlFilter: { filter: { url: url } },
    },
  );

  if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
    return { error: "404" };
  }

  const formMetaId = extractRootIdFromResult(data);

  prepareGraphForWireTransfer(data.graph);
  stripVertexAdjacency(data.graph);
  stripResultFromServerResult(data);

  if (skipComponentData) {
    return { data, formMetaId };
  }

  const componentData = await fetchComponentDataFromGraphCached(
    data,
    dbSession,
    subDomain,
    { cacheSubDomain: subDomain || "" },
  );

  prepareGraphForWireTransfer(componentData?.graph);

  return { data, componentData, formMetaId };
}
