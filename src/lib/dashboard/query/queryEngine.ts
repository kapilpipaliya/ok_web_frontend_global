/**
 * Dashboard query AST + signatures for cache, dedup, and invalidation.
 */

import type { DashboardQueryStore } from "../types/dashboardStore";

export type QueryFilterRow = {
  field: string;
  operator?: string;
  value?: unknown;
};

export type DashboardQueryAst = {
  type: "query";
  version: 1;
  source: {
    kind: "crud" | "neo4j" | "none";
    crudConfigRef?: string | null;
    dataSource?: unknown;
  };
  where: {
    global: Record<string, unknown>;
    widget: Record<string, unknown>;
    overrides: QueryFilterRow[];
    neq: QueryFilterRow[];
  };
  orderBy: { column: string | null; direction: string | null };
  limit: number | null;
  timeRange?: unknown;
};

function stableStringify(value: unknown): string {
  if (value == null) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value as object).sort();
  const parts = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
  );
  return `{${parts.join(",")}}`;
}

/** FNV-1a 32-bit hash — sufficient for cache keys (not cryptographic). */
export function hashQuerySignature(normalized: unknown): string {
  const str = stableStringify(normalized);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `q${(hash >>> 0).toString(16)}`;
}

export function buildQueryAst(
  widgetConfig: {
    id?: string;
    type?: string;
    crudConfigRef?: string;
    dataSource?: unknown;
    queryOverrides?: {
      filters?: QueryFilterRow[];
      sort?: { field: string; direction?: string }[];
      limit?: number;
    };
  },
  store: DashboardQueryStore,
): DashboardQueryAst {
  const globalFilters = store.filters() || {};
  const queryOverrides = widgetConfig?.queryOverrides || {};
  const widgetId = widgetConfig.id || "";
  const widgetUi =
    (typeof store.getWidgetState === "function" ? store.getWidgetState(widgetId) : null) ||
    {};
  const widgetScoped = widgetUi.filters || {};

  const eqFilters: Record<string, unknown> = {};
  for (const key of Object.keys(globalFilters)) {
    const value = globalFilters[key];
    if (value != null && value !== "") eqFilters[key] = value;
  }
  const overrideFilters = Array.isArray(queryOverrides.filters) ? queryOverrides.filters : [];
  const neqFilters: QueryFilterRow[] = [];
  for (const row of overrideFilters) {
    if (!row?.field) continue;
    if (row.operator === "neq") {
      neqFilters.push(row);
      continue;
    }
    eqFilters[row.field] = row.value;
  }
  for (const key of Object.keys(widgetScoped)) {
    if (widgetScoped[key] != null && widgetScoped[key] !== "") {
      eqFilters[key] = widgetScoped[key];
    }
  }

  let sort = widgetUi.sorting || { column: null, direction: null };
  if (Array.isArray(queryOverrides.sort) && queryOverrides.sort.length > 0) {
    const first = queryOverrides.sort[0];
    sort = {
      column: first.field,
      direction: first.direction === "asc" ? "asc" : "desc",
    };
  }

  const kind =
    widgetConfig.type === "crudTable"
      ? "crud"
      : widgetConfig.dataSource
        ? "neo4j"
        : "none";

  return {
    type: "query",
    version: 1,
    source: {
      kind,
      crudConfigRef: widgetConfig.crudConfigRef ?? null,
      dataSource: widgetConfig.dataSource,
    },
    where: {
      global: { ...globalFilters },
      widget: { ...widgetScoped },
      overrides: overrideFilters.filter((r) => r?.operator !== "neq"),
      neq: neqFilters,
    },
    orderBy: sort,
    limit: Number(queryOverrides.limit || 0) || null,
    timeRange: store.timeRange(),
  };
}

export function composeWidgetQuery(
  widgetConfig: Parameters<typeof buildQueryAst>[0],
  store: Parameters<typeof buildQueryAst>[1],
  dashboardKey?: string,
) {
  const ast = buildQueryAst(widgetConfig, store);
  const filters: Record<string, unknown> = {};
  for (const key of Object.keys(ast.where.global)) {
    const value = ast.where.global[key];
    if (value != null && value !== "") filters[key] = value;
  }
  for (const row of ast.where.overrides) {
    if (!row?.field || row.operator === "neq") continue;
    filters[row.field] = row.value;
  }
  for (const key of Object.keys(ast.where.widget)) {
    if (ast.where.widget[key] != null && ast.where.widget[key] !== "") {
      filters[key] = ast.where.widget[key];
    }
  }

  const signature = hashQuerySignature({
    dashboardKey: dashboardKey || "dashboard",
    widgetId: widgetConfig.id,
    ast,
  });

  return {
    ast,
    filters,
    sort: ast.orderBy,
    limit: ast.limit,
    timeRange: ast.timeRange,
    neqFilters: ast.where.neq,
    querySignature: signature,
    cacheKey: `${dashboardKey || "dashboard"}:${widgetConfig.id}:${signature}`,
  };
}
