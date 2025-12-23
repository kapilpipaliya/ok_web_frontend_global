/**
 * Cypher Query Builder Utilities
 *
 * Helper functions for building dynamic Cypher queries
 */

// ==================== QUERY BUILDING ====================

/**
 * Build WHERE clause from filters
 */
export function buildWhereClause(
  filters: Record<string, any>,
  nodeAlias = "n",
): { clause: string; params: Record<string, any> } {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        conditions.push(`${nodeAlias}.${key} IN $${key}`);
        params[key] = value;
      }
    } else {
      conditions.push(`${nodeAlias}.${key} = $${key}`);
      params[key] = value;
    }
  }

  const clause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { clause, params };
}

/**
 * Build ORDER BY clause
 */
export function buildOrderByClause(
  orderBy?: string,
  orderDirection: "ASC" | "DESC" = "DESC",
  nodeAlias = "n",
): string {
  if (!orderBy) return "";

  const direction = orderDirection.toUpperCase();
  if (direction !== "ASC" && direction !== "DESC") {
    throw new Error("Order direction must be ASC or DESC");
  }

  return `ORDER BY ${nodeAlias}.${orderBy} ${direction}`;
}

/**
 * Build pagination clauses (SKIP and LIMIT)
 */
export function buildPaginationClauses(params: {
  page?: number;
  limit?: number;
  skip?: number;
}): {
  skipClause: string;
  limitClause: string;
  params: Record<string, number>;
} {
  const { page, limit, skip } = params;

  const skipValue =
    skip !== undefined ? skip : page && limit ? (page - 1) * limit : 0;

  const skipClause = skipValue > 0 ? "SKIP $skip" : "";
  const limitClause = limit ? "LIMIT $limit" : "";

  const queryParams: Record<string, number> = {};
  if (skipValue > 0) queryParams.skip = skipValue;
  if (limit) queryParams.limit = limit;

  return { skipClause, limitClause, params: queryParams };
}

/**
 * Build MATCH pattern
 */
export function buildMatchPattern(
  nodeLabel: string,
  nodeAlias = "n",
  properties?: Record<string, any>,
): { pattern: string; params: Record<string, any> } {
  const params: Record<string, any> = {};
  let propsPattern = "";

  if (properties && Object.keys(properties).length > 0) {
    const propParts: string[] = [];
    for (const [key, value] of Object.entries(properties)) {
      if (value !== null && value !== undefined) {
        const paramName = `${nodeAlias}_${key}`;
        propParts.push(`${key}: $${paramName}`);
        params[paramName] = value;
      }
    }
    if (propParts.length > 0) {
      propsPattern = ` {${propParts.join(", ")}}`;
    }
  }

  const pattern = `(${nodeAlias}:${nodeLabel}${propsPattern})`;

  return { pattern, params };
}

/**
 * Build relationship pattern
 */
export function buildRelationshipPattern(params: {
  startAlias: string;
  endAlias: string;
  relType?: string;
  relAlias?: string;
  direction?: "out" | "in" | "both";
  relProperties?: Record<string, any>;
}): { pattern: string; params: Record<string, any> } {
  const {
    startAlias,
    endAlias,
    relType,
    relAlias,
    direction = "out",
    relProperties,
  } = params;

  const queryParams: Record<string, any> = {};
  const relAliasStr = relAlias ? relAlias : "";
  const relTypeStr = relType ? `:${relType}` : "";

  let relPropsPattern = "";
  if (relProperties && Object.keys(relProperties).length > 0) {
    const propParts: string[] = [];
    for (const [key, value] of Object.entries(relProperties)) {
      if (value !== null && value !== undefined) {
        const paramName = `${relAliasStr || "rel"}_${key}`;
        propParts.push(`${key}: $${paramName}`);
        queryParams[paramName] = value;
      }
    }
    if (propParts.length > 0) {
      relPropsPattern = ` {${propParts.join(", ")}}`;
    }
  }

  const relPart = `[${relAliasStr}${relTypeStr}${relPropsPattern}]`;

  let pattern: string;
  if (direction === "out") {
    pattern = `(${startAlias})-${relPart}->(${endAlias})`;
  } else if (direction === "in") {
    pattern = `(${startAlias})<-${relPart}-(${endAlias})`;
  } else {
    pattern = `(${startAlias})-${relPart}-(${endAlias})`;
  }

  return { pattern, params: queryParams };
}

// ==================== QUERY HELPERS ====================

/**
 * Build a complete query with common patterns
 */
export function buildQuery(config: {
  match: string;
  where?: string;
  optionalMatch?: string[];
  with?: string;
  return: string;
  orderBy?: string;
  skip?: number;
  limit?: number;
}): string {
  const parts: string[] = [];

  parts.push(`MATCH ${config.match}`);

  if (config.where) {
    parts.push(config.where);
  }

  if (config.optionalMatch && config.optionalMatch.length > 0) {
    for (const om of config.optionalMatch) {
      parts.push(`OPTIONAL MATCH ${om}`);
    }
  }

  if (config.with) {
    parts.push(`WITH ${config.with}`);
  }

  parts.push(`RETURN ${config.return}`);

  if (config.orderBy) {
    parts.push(config.orderBy);
  }

  if (config.skip && config.skip > 0) {
    parts.push(`SKIP ${config.skip}`);
  }

  if (config.limit) {
    parts.push(`LIMIT ${config.limit}`);
  }

  return parts.join("\n");
}

/**
 * Escape special characters in Cypher string
 */
export function escapeCypherString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Build regex pattern for case-insensitive search
 */
export function buildRegexPattern(
  searchTerm: string,
  caseInsensitive = true,
): string {
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefix = caseInsensitive ? "(?i)" : "";
  return `${prefix}.*${escaped}.*`;
}

/**
 * Build full-text search condition
 */
export function buildSearchCondition(
  fields: string[],
  searchTerm: string,
  nodeAlias = "n",
): { condition: string; params: Record<string, any> } {
  const pattern = buildRegexPattern(searchTerm);
  const conditions = fields.map(
    (field) => `${nodeAlias}.${field} =~ $searchPattern`,
  );
  const condition = conditions.join(" OR ");

  return {
    condition: `(${condition})`,
    params: { searchPattern: pattern },
  };
}

// ==================== COMMON QUERIES ====================

/**
 * Build count query
 */
export function buildCountQuery(
  nodeLabel: string,
  filters?: Record<string, any>,
  nodeAlias = "n",
): { query: string; params: Record<string, any> } {
  const { pattern, params: matchParams } = buildMatchPattern(
    nodeLabel,
    nodeAlias,
    filters,
  );

  const query = `
    MATCH ${pattern}
    RETURN count(${nodeAlias}) as count
  `;

  return { query, params: matchParams };
}

/**
 * Build exists query
 */
export function buildExistsQuery(
  nodeLabel: string,
  filters: Record<string, any>,
  nodeAlias = "n",
): { query: string; params: Record<string, any> } {
  const { pattern, params: matchParams } = buildMatchPattern(
    nodeLabel,
    nodeAlias,
    filters,
  );

  const query = `
    MATCH ${pattern}
    RETURN count(${nodeAlias}) > 0 as exists
  `;

  return { query, params: matchParams };
}

/**
 * Build delete query with safety check
 */
export function buildDeleteQuery(
  nodeLabel: string,
  filters: Record<string, any>,
  nodeAlias = "n",
  detachDelete = true,
): { query: string; params: Record<string, any> } {
  const { pattern, params: matchParams } = buildMatchPattern(
    nodeLabel,
    nodeAlias,
    filters,
  );

  if (Object.keys(filters).length === 0) {
    throw new Error(
      "Delete query requires at least one filter to prevent accidental deletion of all nodes",
    );
  }

  const deleteClause = detachDelete ? "DETACH DELETE" : "DELETE";

  const query = `
    MATCH ${pattern}
    ${deleteClause} ${nodeAlias}
    RETURN count(${nodeAlias}) as deletedCount
  `;

  return { query, params: matchParams };
}

// ==================== EXPORT ====================

export const cypherUtils = {
  buildWhereClause,
  buildOrderByClause,
  buildPaginationClauses,
  buildMatchPattern,
  buildRelationshipPattern,
  buildQuery,
  escapeCypherString,
  buildRegexPattern,
  buildSearchCondition,
  buildCountQuery,
  buildExistsQuery,
  buildDeleteQuery,
};
