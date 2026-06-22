/**
 * Redis cache for server-side data caching.
 * Falls back gracefully when Redis is unavailable.
 */

import Redis from "ioredis";
import { redisConnection } from "~/server/queue/redisConfig";

declare global {
  var __redisCacheClient: Redis | undefined;
  var __redisCacheDisabled: boolean | undefined;
}

const DEFAULT_TTL_SECONDS = 300;

function getRedisClient(): Redis | null {
  if (global.__redisCacheDisabled) {
    return null;
  }

  if (!global.__redisCacheClient) {
    try {
      global.__redisCacheClient = new Redis({
        ...redisConnection,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        connectTimeout: 2000,
      });

      global.__redisCacheClient.on("error", (error) => {
        console.warn("[RedisCache] Redis error, disabling cache:", error.message);
        global.__redisCacheDisabled = true;
      });
    } catch (error) {
      console.warn("[RedisCache] Failed to create Redis client:", error);
      global.__redisCacheDisabled = true;
      return null;
    }
  }

  return global.__redisCacheClient;
}

async function ensureConnected(client: Redis): Promise<boolean> {
  if (client.status === "ready") {
    return true;
  }

  try {
    await client.connect();
    return true;
  } catch (error) {
    console.warn("[RedisCache] Connection failed, disabling cache:", error);
    global.__redisCacheDisabled = true;
    return false;
  }
}

export async function redisCacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    if (!(await ensureConnected(client))) {
      return null;
    }

    const data = await client.get(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`[RedisCache] Get failed for key "${key}":`, error);
    return null;
  }
}

export async function redisCacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    if (!(await ensureConnected(client))) {
      return;
    }

    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.warn(`[RedisCache] Set failed for key "${key}":`, error);
  }
}

export async function redisCacheDelete(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    if (!(await ensureConnected(client))) {
      return;
    }

    await client.del(key);
  } catch (error) {
    console.warn(`[RedisCache] Delete failed for key "${key}":`, error);
  }
}

export async function redisCacheDeleteByPattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) {
    return 0;
  }

  try {
    if (!(await ensureConnected(client))) {
      return 0;
    }

    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.warn(`[RedisCache] Pattern delete failed for "${pattern}":`, error);
    return 0;
  }
}

export function isRedisCacheAvailable(): boolean {
  return !global.__redisCacheDisabled && !!getRedisClient();
}

export interface RedisCacheGetOrSetOptions<T> {
  ttl?: number;
  shouldCache?: (value: T) => boolean;
}

export async function redisCacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  options: RedisCacheGetOrSetOptions<T> = {},
): Promise<T> {
  if (!isRedisCacheAvailable()) {
    return factory();
  }

  const cached = await redisCacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await factory();

  if (!options.shouldCache || options.shouldCache(value)) {
    await redisCacheSet(key, value, options.ttl ?? DEFAULT_TTL_SECONDS);
  }

  return value;
}

export function getFormMetaDataCacheKey(
  subDomain: string,
  params: {
    pageVertexName?: string;
    formId?: string;
    expression?: string;
    pageKeyName?: string;
    url?: string;
    skipComponentData?: boolean;
  },
): string {
  return `form-meta:${subDomain}:${JSON.stringify(params)}`;
}

export function getFormMetaDataCacheTtl(): number {
  const ttl = parseInt(process.env.FORM_METADATA_CACHE_TTL || "", 10);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_SECONDS;
}
