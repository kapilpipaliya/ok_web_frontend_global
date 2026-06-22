import type { MutationArgs } from "~/cypher/types/MutationArgs";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import { redisCacheDeleteByPattern } from "./redisCache";

const FORM_META_CACHE_LABELS = new Set([
  "Page",
  "Attr",
  "PageLayout",
  "Component",
  "ComponentVariant",
  "ComponentVariantOption",
]);

const FORM_META_CACHE_EDGE_TYPES = new Set([
  "Attr",
  "PageLayout",
  "ComponentVariant",
  "ComponentVariantOption",
]);

function vertexHasRelevantLabel(vertex: Vertex | undefined): boolean {
  if (!vertex?.L) {
    return false;
  }

  const labels = Array.isArray(vertex.L) ? vertex.L : [vertex.L];
  return labels.some((label) => FORM_META_CACHE_LABELS.has(label));
}

function edgeIsRelevant(edge: Edge | undefined): boolean {
  return !!edge?.T && FORM_META_CACHE_EDGE_TYPES.has(edge.T);
}

export function mutationAffectsFormMetaData(args: MutationArgs): boolean {
  for (const txn of args.transactions) {
    for (const key of ["insert", "replace", "merge", "deleteVertex"] as const) {
      const vertex = txn[key] as Vertex | undefined;
      if (vertexHasRelevantLabel(vertex)) {
        return true;
      }
    }

    for (const key of ["insertEdge", "replaceEdge", "deleteEdge"] as const) {
      const edge = txn[key] as Edge | undefined;
      if (edgeIsRelevant(edge)) {
        return true;
      }
    }
  }

  return false;
}

export async function invalidateFormMetaDataCacheForSubdomain(
  subDomain: string,
): Promise<number> {
  return redisCacheDeleteByPattern(`form-meta:${subDomain}:*`);
}

export async function invalidateFormMetaDataCacheIfNeeded(
  subDomain: string,
  args: MutationArgs,
): Promise<void> {
  if (!mutationAffectsFormMetaData(args)) {
    return;
  }

  const deleted = await invalidateFormMetaDataCacheForSubdomain(subDomain);
  if (deleted > 0) {
    console.log(
      `[RedisCache] Invalidated ${deleted} form metadata cache entries for ${subDomain}`,
    );
  }
}
