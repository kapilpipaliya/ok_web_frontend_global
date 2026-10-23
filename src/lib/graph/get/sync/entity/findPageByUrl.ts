import type { Store } from "solid-js";

import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface PageUrlMatch {
  /** The resolved page vertex. */
  vertex: Vertex;
  /** Values extracted from dynamic (":") segments, keyed by segment name. */
  params: Record<string, string>;
  /**
   * The page's configured url pattern (e.g. "/users/:parent/:id/:withHtmlExtension").
   * This is stable across concrete param values, so it can be used as a cache key.
   */
  pattern: string;
  /** True when the match consumed one or more dynamic (":") segments. */
  isDynamic: boolean;
}

const splitSegments = (path: string): string[] =>
  path.split("/").filter((segment) => segment.length > 0);

/**
 * Match a concrete path against a single page url pattern.
 * Returns the extracted params, or null when the pattern does not match.
 *
 * A ":segment" matches exactly one path segment regardless of its value
 * (including values that carry a ".html" style extension). A trailing
 * ":segment?" is optional, so "/gallery/:category?" matches both "/gallery"
 * and "/gallery/animals".
 */
export function matchUrlPattern(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternSegments = splitSegments(pattern);
  const pathSegments = splitSegments(path);

  let requiredCount = 0;
  for (const segment of patternSegments) {
    const isOptional = segment.startsWith(":") && segment.endsWith("?");
    if (!isOptional) {
      requiredCount++;
    }
  }
  if (
    pathSegments.length < requiredCount ||
    pathSegments.length > patternSegments.length
  ) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    if (patternSegment.startsWith(":")) {
      const isOptional = patternSegment.endsWith("?");
      const key = patternSegment.slice(1, isOptional ? -1 : undefined);
      if (!key) {
        return null;
      }
      if (pathSegment === undefined) {
        if (isOptional) {
          continue;
        }
        return null;
      }
      try {
        params[key] = decodeURIComponent(pathSegment);
      } catch {
        params[key] = pathSegment;
      }
      continue;
    }

    if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

/**
 * Resolve a Page vertex for a concrete url.
 *
 * Resolution order:
 *   1. Exact url match (e.g. "/about" -> page with url "/about").
 *   2. Dynamic ":param" pattern match (e.g. "/users/john/12/profile.html" ->
 *      page with url "/users/:parent/:id/:withHtmlExtension"). When several
 *      patterns match, the most specific one (fewest dynamic segments) wins.
 *
 * The returned `pattern` is identical for every concrete url that maps to the
 * same page, letting callers key page metadata by pattern and avoid refetching
 * on each navigation between param values.
 */
export function findPageMatchByUrl(
  graph: Store<GraphInterface>,
  path: string,
  label = "Page",
): PageUrlMatch | undefined {
  if (!path) {
    return undefined;
  }

  const pageIds = graph.vertexLabelIdMap[label] || [];

  for (const id of pageIds) {
    const vertex = graph.vertexes[id];
    if (vertex?.P?.url === path) {
      return { vertex, params: {}, pattern: path, isDynamic: false };
    }
  }

  let best: PageUrlMatch | undefined;
  let bestDynamicCount = Number.POSITIVE_INFINITY;
  for (const id of pageIds) {
    const vertex = graph.vertexes[id];
    const pattern = vertex?.P?.url;
    if (typeof pattern !== "string" || !pattern.includes(":")) {
      continue;
    }

    const params = matchUrlPattern(pattern, path);
    if (!params) {
      continue;
    }

    const dynamicCount = Object.keys(params).length;
    if (dynamicCount < bestDynamicCount) {
      best = { vertex, params, pattern, isDynamic: true };
      bestDynamicCount = dynamicCount;
    }
  }

  return best;
}
