# Dashboard components (Solvo)

Schemas register by **component `key`**, not file path. Subfolders are for organization only.

| Folder | Components |
|--------|------------|
| `host/` | `DashboardHost` — runtime orchestration |
| `shell/` | `DashboardRenderer`, `DashboardFilterBar`, `DashboardLayoutRenderer`, `DashboardWidgetShell`, `DashboardWidgetRenderer` |
| `widgets/` | `DashboardMetricCard`, `DashboardChartWidget`, `DashboardMarkdownWidget`, `DashboardQuickActionsWidget`, `DashboardActivityFeedWidget`, `DashboardTimelineWidget`, `DashboardKanbanWidget` |
| `entity/` | `DashboardEntityDrawer`, `EntityRuntimeHost` |
| `crud/` | `DashboardCrudEmbed`, `CrudRuntimeCore` |
| `devtools/` | `DashboardDevtools` |

## Local graph state (`DashboardHost`)

| Label | Role |
|-------|------|
| `DashboardRuntime` | Root; links config + session + widget states |
| `DashboardConfig` | Full normalized dashboard config (`P.config`) |
| `DashboardSession` | Filters, time range, layout overrides, hidden widgets, entity drawer |
| `DashboardWidgetState` | Per-widget loading/error/lifecycle + `dataResultVertexId`, `rowVertexIds` |
| `DashboardWidgetResult` | Server/client presentation (value, chart, trend) |

- Mount: `generateNewTxnId` + bootstrap vertices via `setGraphData(txnId, …)`.
- Cleanup: `revertTransaction(txnId)` in `disposeDashboardRuntime`.
- Solid `ui` store: `runtimeVertexId`, `configVertexId`, `sessionVertexId`, `widgetStateIds` only.

See parent [README](../README.md) for architecture.
