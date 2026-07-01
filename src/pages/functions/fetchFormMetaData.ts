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
import type { FetchFormMetaDataResult } from "./fetchPageData";
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import { stripGraphTimestamps } from "~/lib/graph/fetch/graphFetchUtils";

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
    const cacheKey = getFormMetaDataCacheKey(subDomain, {
      pageVertexName,
      formId,
      expression,
      pageKeyName,
      url,
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
          url,
          skipComponentData,
        ),
      {
        ttl: getFormMetaDataCacheTtl(),
        shouldCache: (result) => !result.error,
      },
    );
  }

  return fetchFormMetaDataFromDB(
    pageVertexName,
    formId,
    expression,
    pageKeyName,
    url,
    skipComponentData,
    dbSession,
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
      // @ts-expect-error ignore error
      $urlFilter: { filter: { url: url } },
    },
  );

  if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
    return { error: "404" };
  }

  stripGraphTimestamps(data.graph);

  if (skipComponentData) {
    return { data };
  }

  const componentData = await fetchComponentDataFromGraph(data, dbSession);

  stripGraphTimestamps(componentData?.graph);

  return { data, componentData };
}
