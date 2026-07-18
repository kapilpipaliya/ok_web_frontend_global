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
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import { prepareGraphForWireTransfer } from "~/lib/graph/fetch/graphFetchUtils";
import {
  extractRootIdFromResult,
  stripResultFromServerResult,
} from "~/lib/graph/fetch/wirePayloadUtils";
import { stripVertexAdjacency } from "~/lib/graph/transfer/stripVertexAdjacency";

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
    const { subDomain } = await getSubdomainForRequest();

    // Resolve dynamic ":param" urls (e.g. /users/john/12/profile.html) to the
    // page's stored url pattern so all concrete urls share one cache entry and
    // one DB query, and dynamic pages load on the first request (empty graph).
    const resolvedUrl = url
      ? await resolveDynamicPageUrl(subDomain, url, pageVertexName)
      : url;

    const cacheKey = getFormMetaDataCacheKey(subDomain, {
      pageVertexName,
      formId,
      expression,
      pageKeyName,
      url: resolvedUrl,
      skipComponentData,
    });

    return redisCacheGetOrSet(
      cacheKey,
      () =>
        fetchFormMetaDataFromDB(
          pageVertexName,
          formId,
          expression,
          pageKeyName,
          resolvedUrl,
          skipComponentData,
          undefined,
          subDomain,
        ),
      {
        ttl: getFormMetaDataCacheTtl(),
        shouldCache: (result) => !result.error,
      },
    );
  }

  const resolvedUrl = url
    ? await resolveDynamicPageUrl("", url, pageVertexName, dbSession)
    : url;

  return fetchFormMetaDataFromDB(
    pageVertexName,
    formId,
    expression,
    pageKeyName,
    resolvedUrl,
    skipComponentData,
    dbSession,
    subDomain,
  );
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

  const componentData = await fetchComponentDataFromGraph(
    data,
    dbSession,
    subDomain,
  );

  prepareGraphForWireTransfer(componentData?.graph);

  return { data, componentData, formMetaId };
}
