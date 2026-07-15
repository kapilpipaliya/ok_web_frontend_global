import type { Session } from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import {
  getFormMetaDataCacheTtl,
  redisCacheGetOrSet,
} from "~/server/redis/redisCache";

// Only simple label characters are safe to interpolate into a Cypher label.
const LABEL_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

interface CompiledPattern {
  /** Original url pattern, e.g. "/users/:parent/:id". */
  url: string;
  /** Non-empty path segments, e.g. ["users", ":parent", ":id"]. */
  segments: string[];
  /** Number of dynamic (":") segments; fewer = more specific. */
  dynamicCount: number;
}

/**
 * L1 in-process cache of the (usually tiny or empty) list of dynamic page url
 * patterns per subdomain+label. This keeps the hot path free of Redis/DB round
 * trips: most sites have no dynamic pages, so resolution is a Map lookup that
 * short-circuits immediately.
 *
 * Redis is the shared L2 (invalidated on Page/Attr mutations). The short L1 TTL
 * bounds cross-process staleness; same-process mutations clear L1 explicitly
 * via {@link clearDynamicPageUrlCache}.
 */
const MEMORY_TTL_MS = 15_000;

interface MemoryEntry {
  patterns: CompiledPattern[];
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();
const inFlight = new Map<string, Promise<CompiledPattern[]>>();

function safeLabel(pageVertexName?: string): string {
  return pageVertexName && LABEL_PATTERN.test(pageVertexName)
    ? pageVertexName
    : "Page";
}

function toSegments(path: string): string[] {
  return path.split("/").filter((segment) => segment.length > 0);
}

function compilePattern(url: string): CompiledPattern {
  const segments = toSegments(url);
  let dynamicCount = 0;
  for (const segment of segments) {
    if (segment.startsWith(":")) {
      dynamicCount++;
    }
  }
  return { url, segments, dynamicCount };
}

function matchesPattern(pattern: CompiledPattern, pathSegments: string[]): boolean {
  if (pattern.segments.length !== pathSegments.length) {
    return false;
  }
  for (let i = 0; i < pattern.segments.length; i++) {
    const patternSegment = pattern.segments[i];
    if (patternSegment.charCodeAt(0) === 58 /* ":" */) {
      continue;
    }
    if (patternSegment !== pathSegments[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Kept under the `form-meta:` namespace so the existing form metadata cache
 * invalidation (`form-meta:<subDomain>:*`) also clears this index.
 */
function getCacheKey(subDomain: string, label: string): string {
  return `form-meta:${subDomain}:__dynamic-page-urls__:${label}`;
}

async function queryDynamicPatterns(
  session: Session,
  label: string,
): Promise<string[]> {
  const result = await session.run(
    `MATCH (p:\`${label}\`)
     WHERE p.url IS NOT NULL AND p.url CONTAINS ':'
     RETURN DISTINCT p.url AS url`,
  );

  return result.records
    .map((record) => String(record.get("url") ?? "").trim())
    .filter((url) => url.length > 0);
}

/** Load + sort dynamic patterns from Redis (L2), falling back to the DB. */
async function loadDynamicPatterns(
  subDomain: string,
  label: string,
): Promise<CompiledPattern[]> {
  const urls = await redisCacheGetOrSet(
    getCacheKey(subDomain, label),
    async () => {
      const { dbSession } = await getDBSessionForSubdomain();
      try {
        return await queryDynamicPatterns(dbSession, label);
      } finally {
        await dbSession.close();
      }
    },
    { ttl: getFormMetaDataCacheTtl() },
  );

  // Most specific (fewest dynamic segments) first, so the first match wins.
  return urls
    .map(compilePattern)
    .sort((a, b) => a.dynamicCount - b.dynamicCount);
}

async function getDynamicPatterns(
  subDomain: string,
  label: string,
): Promise<CompiledPattern[]> {
  const key = `${subDomain}:${label}`;
  const now = Date.now();

  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.patterns;
  }

  // Dedupe concurrent cold loads so only one Redis/DB round trip happens.
  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }

  const promise = loadDynamicPatterns(subDomain, label)
    .then((patterns) => {
      memoryCache.set(key, { patterns, expiresAt: Date.now() + MEMORY_TTL_MS });
      return patterns;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

/** Clear the L1 dynamic-pattern cache (all subdomains, or a single one). */
export function clearDynamicPageUrlCache(subDomain?: string): void {
  if (!subDomain) {
    memoryCache.clear();
    return;
  }
  const prefix = `${subDomain}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Resolve a concrete request url to the page url stored in the database.
 *
 * Static urls resolve to themselves; dynamic urls such as
 * `/users/john/12/profile.html` resolve to the page's url pattern
 * `/users/:parent/:id/:withHtmlExtension`. Returning the pattern lets the
 * caller (a) run the existing exact-match DB query and (b) key the metadata
 * cache by pattern so every concrete url of the same page shares one entry and
 * is not refetched.
 *
 * On the first request the client graph is empty, so this server-side
 * resolution is what actually makes dynamic page urls load.
 *
 * Fast path: sites with no dynamic pages resolve in a single Map lookup with no
 * Redis or DB access.
 */
export async function resolveDynamicPageUrl(
  subDomain: string,
  url: string,
  pageVertexName?: string,
  dbSession?: Session,
): Promise<string> {
  if (!url) {
    return url;
  }

  const label = safeLabel(pageVertexName);

  try {
    // Explicit session (design/internal flows): query directly, no caching.
    const patterns = dbSession
      ? (await queryDynamicPatterns(dbSession, label))
          .map(compilePattern)
          .sort((a, b) => a.dynamicCount - b.dynamicCount)
      : await getDynamicPatterns(subDomain, label);

    if (patterns.length === 0) {
      return url;
    }

    const pathSegments = toSegments(url);
    for (const pattern of patterns) {
      if (matchesPattern(pattern, pathSegments)) {
        return pattern.url;
      }
    }

    return url;
  } catch (error) {
    console.warn("[resolveDynamicPageUrl] Failed to resolve url:", url, error);
    return url;
  }
}
