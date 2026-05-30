# Dashboard runtime platform (`src/lib/dashboard`)

Public entry: `createDashboardPlatform()` from `index.ts` (wired as `args.dashboardPlatform`).

## Layout

| Folder | Modules |
|--------|---------|
| `contracts/` | `interactionContracts`, `mutationContracts` |
| `query/` | `queryEngine`, `cacheManager`, `subscriptionGraph` |
| `runtime/` | `scheduler`, `runtimeExecution`, `runtimeScope`, `widgetLifecycle`, `lifetimeTree`, `resourceOwnership`, `invalidationCompression`, `invalidationBus`, `platformApi` |
| `observability/` | `devtools`, `runtimeTelemetry`, `runtimeEventLog`, `runtimeCausality` |
| `realtime/` | `realtimeBridge` |
| `widget/` | `widgetCapabilities` |

Import from `~/lib/dashboard` only — do not deep-import subpaths unless extending the platform.

## Graph-first data contract

- Server functions use `args.processResult` so vertices populate `args.context`; [`executeNamedServerFunctionCore`](../../cypher/get/executeNamedServerFunctionCore.ts) returns `graph` on every [`ServerResult`](../../cypher/types/ServerResult.ts).
- Dashboard host calls `applyServerGraphToLocalGraph(response)` after each API (merge into reactive `args.graph` via `args.setGraphData`).
- Widget state lives in local graph vertices (`DashboardWidgetState`); the Solid store holds vertex IDs only. Use `store.getWidgetState` / `store.resolveWidgetPresentation` from the host.
- Cache (`cacheManager`) stores `dataResultVertexId` + `rowVertexIds` per query signature (optional TTL from `dataSource.cache.ttl`); graph remains authoritative for vertex payloads.
