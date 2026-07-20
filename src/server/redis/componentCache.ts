import type { ServerResult } from "~/cypher/types/ServerResult";
import {
  getFormMetaDataCacheTtl,
  redisCacheDeleteByPattern,
  redisCacheGet,
  redisCacheSet,
} from "~/server/redis/redisCache";

/**
 * Per-component metadata cache (separate from page form-meta cache).
 * Keyed by subdomain + component key so client navigations can skip
 * components already present in the browser graph.
 */

const MEMORY_TTL_MS = 15_000;
const MAX_MEMORY_ENTRIES = 500;

type ComponentCacheValue = Pick<ServerResult, "graph">;

interface MemoryEntry {
  value: ComponentCacheValue;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();

export function getComponentCacheKey(
  subDomain: string,
  componentKey: string,
): string {
  return `component-meta:${subDomain}:${componentKey}`;
}

function getFromMemory(key: string): ComponentCacheValue | undefined {
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

function setInMemory(key: string, value: ComponentCacheValue): void {
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey !== undefined) {
      memoryCache.delete(oldestKey);
    }
  }
  memoryCache.set(key, { value, expiresAt: Date.now() + MEMORY_TTL_MS });
}

export function clearComponentMemoryCache(subDomain?: string): void {
  if (!subDomain) {
    memoryCache.clear();
    return;
  }
  const prefix = `component-meta:${subDomain}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function getCachedComponent(
  subDomain: string,
  componentKey: string,
): Promise<ComponentCacheValue | null> {
  const key = getComponentCacheKey(subDomain, componentKey);
  const memoryHit = getFromMemory(key);
  if (memoryHit) {
    return memoryHit;
  }

  const redisHit = await redisCacheGet<ComponentCacheValue>(key);
  if (redisHit?.graph) {
    setInMemory(key, redisHit);
    return redisHit;
  }
  return null;
}

export async function setCachedComponent(
  subDomain: string,
  componentKey: string,
  value: ComponentCacheValue,
): Promise<void> {
  if (!value.graph) {
    return;
  }
  const key = getComponentCacheKey(subDomain, componentKey);
  setInMemory(key, value);
  await redisCacheSet(key, value, getFormMetaDataCacheTtl());
}

export async function invalidateComponentCacheForSubdomain(
  subDomain: string,
): Promise<number> {
  clearComponentMemoryCache(subDomain);
  return redisCacheDeleteByPattern(`component-meta:${subDomain}:*`);
}
