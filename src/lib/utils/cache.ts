/**
 * Caching Layer
 *
 * Simple in-memory cache with TTL for server functions
 */

/*
Cache Improvements
  - Redis adapter (for distributed caching)
  - Cache tags/groups
  - Cache warming strategies
  - Dependency invalidation
*/

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache statistics
 */
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 60)
  namespace?: string; // Namespace for cache keys
}

/**
 * Global cache store
 */
class CacheStore {
  private store: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
  };

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.size--;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlSeconds = 60): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;

    // Update size if new key
    if (!this.store.has(key)) {
      this.stats.size++;
    }

    this.store.set(key, { value, expiresAt });
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.stats.size--;
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.size--;
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
    this.stats.size = 0;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleared++;
        this.stats.size--;
      }
    }

    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: this.stats.size,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }
}

/**
 * Global cache instance
 */
const globalCache = new CacheStore();

/**
 * Create namespaced cache key
 */
function createKey(key: string, namespace?: string): string {
  return namespace ? `${namespace}:${key}` : key;
}

/**
 * Get value from cache
 */
export function cacheGet<T>(key: string, options: CacheOptions = {}): T | null {
  const cacheKey = createKey(key, options.namespace);
  return globalCache.get<T>(cacheKey);
}

/**
 * Set value in cache
 */
export function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {},
): void {
  const cacheKey = createKey(key, options.namespace);
  const ttl = options.ttl || 60;
  globalCache.set(cacheKey, value, ttl);
}

/**
 * Delete value from cache
 */
export function cacheDelete(key: string, options: CacheOptions = {}): boolean {
  const cacheKey = createKey(key, options.namespace);
  return globalCache.delete(cacheKey);
}

/**
 * Check if key exists in cache
 */
export function cacheHas(key: string, options: CacheOptions = {}): boolean {
  const cacheKey = createKey(key, options.namespace);
  return globalCache.has(cacheKey);
}

/**
 * Clear all cache
 */
export function cacheClear(namespace?: string): void {
  if (!namespace) {
    globalCache.clear();
    return;
  }

  // Clear namespace
  const keys = globalCache.keys();
  const prefix = `${namespace}:`;
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  }
}

/**
 * Get or set value in cache
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => T | Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const cached = cacheGet<T>(key, options);

  if (cached !== null) {
    return cached;
  }

  const value = await factory();
  cacheSet(key, value, options);
  return value;
}

/**
 * Memoize function with cache
 */
export function cacheMemoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions & {
    keyFn?: (...args: Parameters<T>) => string;
  } = {},
): T {
  const keyFn = options.keyFn || ((...args: any[]) => JSON.stringify(args));

  return ((...args: Parameters<T>) => {
    const key = keyFn(...args);
    return cacheGetOrSet(key, () => fn(...args), options);
  }) as T;
}

/**
 * Clear expired entries from cache
 */
export function cacheClearExpired(): number {
  return globalCache.clearExpired();
}

/**
 * Get cache statistics
 */
export function cacheStats(): CacheStats {
  return globalCache.getStats();
}

/**
 * Reset cache statistics
 */
export function cacheResetStats(): void {
  globalCache.resetStats();
}

/**
 * Get cache size
 */
export function cacheSize(): number {
  return globalCache.size();
}

/**
 * Cache decorator for class methods
 */
export function Cached(options: CacheOptions = {}) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      return cacheGetOrSet(
        key,
        () => originalMethod.apply(this, args),
        options,
      );
    };

    return descriptor;
  };
}

/**
 * Cache manager with namespace isolation
 */
export class CacheManager {
  constructor(private namespace: string) {}

  get<T>(key: string, ttl?: number): T | null {
    return cacheGet<T>(key, { namespace: this.namespace, ttl });
  }

  set<T>(key: string, value: T, ttl?: number): void {
    cacheSet(key, value, { namespace: this.namespace, ttl });
  }

  delete(key: string): boolean {
    return cacheDelete(key, { namespace: this.namespace });
  }

  has(key: string): boolean {
    return cacheHas(key, { namespace: this.namespace });
  }

  clear(): void {
    cacheClear(this.namespace);
  }

  async getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return cacheGetOrSet(key, factory, { namespace: this.namespace, ttl });
  }

  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string,
    ttl?: number,
  ): T {
    return cacheMemoize(fn, {
      namespace: this.namespace,
      keyFn,
      ttl,
    });
  }
}

/**
 * Create cache manager for namespace
 */
export function createCacheManager(namespace: string): CacheManager {
  return new CacheManager(namespace);
}

/**
 * Cache utilities factory
 */
export const cache = {
  /**
   * Get value
   */
  get: cacheGet,

  /**
   * Set value
   */
  set: cacheSet,

  /**
   * Delete value
   */
  delete: cacheDelete,

  /**
   * Check if exists
   */
  has: cacheHas,

  /**
   * Clear cache
   */
  clear: cacheClear,

  /**
   * Get or set
   */
  getOrSet: cacheGetOrSet,

  /**
   * Memoize function
   */
  memoize: cacheMemoize,

  /**
   * Clear expired
   */
  clearExpired: cacheClearExpired,

  /**
   * Get stats
   */
  stats: cacheStats,

  /**
   * Reset stats
   */
  resetStats: cacheResetStats,

  /**
   * Get size
   */
  size: cacheSize,

  /**
   * Create manager
   */
  createManager: createCacheManager,
};

/**
 * Auto-cleanup expired entries every 5 minutes
 */
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const cleared = cacheClearExpired();
      if (cleared > 0) {
        console.log(`[Cache] Cleared ${cleared} expired entries`);
      }
    },
    5 * 60 * 1000,
  );
}
