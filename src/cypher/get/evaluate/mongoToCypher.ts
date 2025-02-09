export interface CypherQueryResult {
  params: { [key: string]: any };
  query: string;
}

export type MongoFilter =
  | { $and?: MongoFilter[] }
  | { $not?: MongoFilter }
  | { $or?: MongoFilter[] }
  | { [key: string]: any }
  | {
      [key: string]: {
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
        $ne?: any;
      };
    };

export function mongoToCypher(filter: MongoFilter): CypherQueryResult {
  if (!filter || Object.keys(filter).length === 0) {
    return {
      params: {},
      query: "",
    };
  }

  const params: { [key: string]: any } = {};
  let paramIndex = 0;

  const translateFilter = (filter: MongoFilter): string => {
    return Object.entries(filter)
      .map(([key, value]) => {
        if (key === "$and" && Array.isArray(value)) {
          return "(" + value.map(translateFilter).join(" AND ") + ")";
        }
        if (key === "$or" && Array.isArray(value)) {
          return "(" + value.map(translateFilter).join(" OR ") + ")";
        }
        if (key === "$not" && typeof value === "object") {
          return "NOT (" + translateFilter(value as MongoFilter) + ")";
        }
        if (typeof value === "object" && !Array.isArray(value)) {
          return handleOperators(key, value);
        }
        // Direct equality
        const paramName = `param${paramIndex++}`;
        params[paramName] = value;
        return `n.${key} = $${paramName}`;
      })
      .join(" AND ");
  };

  const handleOperators = (
    field: string,
    conditions: { [operator: string]: any },
  ): string => {
    return Object.entries(conditions)
      .map(([operator, value]) => {
        const paramName = `param${paramIndex++}`;
        params[paramName] = value;
        switch (operator) {
          case "$gt":
            return `n.${field} > $${paramName}`;
          case "$gte":
            return `n.${field} >= $${paramName}`;
          case "$lt":
            return `n.${field} < $${paramName}`;
          case "$lte":
            return `n.${field} <= $${paramName}`;
          case "$ne":
            return `n.${field} <> $${paramName}`;
          default:
            throw new Error(`Unsupported operator: ${operator}`);
        }
      })
      .join(" AND ");
  };

  const whereClause = translateFilter(filter);
  return {
    params,
    query: whereClause,
  };
}
