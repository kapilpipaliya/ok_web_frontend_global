# Dashboard server functions (Solvo)

Functions register by **`key`**, not file path.

| Folder | Function key |
|--------|----------------|
| `data/` | `executeDashboardDataSource` |
| `preference/` | `loadDashboardPreference`, `saveDashboardPreference` |
| `realtime/` | `pollDashboardRealtimeEvents` |

## `executeDashboardDataSource`

### Supported `dataSource.type`

| Type | Status |
|------|--------|
| `neo4j` | Supported — rows via `processResult`; presentation in `DashboardWidgetResult` vertex |
| `static` | Supported — rows materialized as local graph vertices |
| `crud` | Placeholder (CRUD widgets load via `DashboardCrudEmbed`) |

Client merges `response.graph` with dashboard `txnId`. Widget UI store holds **vertex IDs only** (`dataResultVertexId`, `rowVertexIds`); read presentation via `store.resolveWidgetPresentation(widgetId)`.
| `computed`, `pipeline`, `api`, `graphql`, `ai`, `realtime` | **Not implemented** — returns `success: false` |

### Query filter operators (`query.filters` + dashboard filters)

| Operator | Cypher |
|----------|--------|
| `eq` | `v.field = $param` |
| `neq` | `v.field <> $param` |
| `in` | `v.field IN $param` (array) |
| `gt`, `gte`, `lt`, `lte` | comparison |
| `contains`, `like` | `toLower(toString(v.field)) CONTAINS ...` |
| `startsWith` | `STARTS WITH` |
| `isNull`, `isNotNull` | `IS NULL` / `IS NOT NULL` |
| `between` | `value: [from, to]` |

Reserved dashboard filter keys (not mapped to vertex fields): `dateRange` — use `timeRange` context instead.

### Time range presets

`last_7_days`, `last_30_days`, `last_90_days`, `last_year` — applied to `timestampField` (default `updatedAt`).
