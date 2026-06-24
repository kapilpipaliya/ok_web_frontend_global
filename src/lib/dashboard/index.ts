import {
  DASHBOARD_EVENT_TYPES,
  DASHBOARD_INTERACTION_VERSION,
  buildOpenEntityDrawerEvent,
  normalizeInteractionEvent,
  resolveWidgetInteraction,
  substitutePayloadTemplates,
} from "./contracts/interactionContracts";
import {
  buildQueryAst,
  composeWidgetQuery,
  hashQuerySignature,
} from "./query/queryEngine";
import { createDashboardCache } from "./query/cacheManager";
import { createInvalidationBus } from "./runtime/invalidationBus";
import {
  resolveWidgetCapabilities,
  resolveWidgetEditorMeta,
} from "./widget/widgetCapabilities";
import { createQuerySubscriptionGraph } from "./query/subscriptionGraph";
import { createDashboardRuntimeScheduler } from "./runtime/scheduler";
import { createRuntimeScope } from "./runtime/runtimeScope";
import {
  WIDGET_LIFECYCLE,
  transitionLifecycle,
  canTransition,
  type WidgetLifecyclePhase,
} from "./runtime/widgetLifecycle";
import {
  MUTATION_EVENT_TYPES,
  normalizeMutationEvent,
  resolveMutationInvalidationTargets,
} from "./contracts/mutationContracts";
import { createDashboardDevtoolsCollector } from "./observability/devtools";
import { createDashboardExecutionCoordinator } from "./runtime/runtimeExecution";
import { createRuntimeLifetimeTree } from "./runtime/lifetimeTree";
import {
  createDashboardPlatformAPI,
  type DashboardPlatformAPI,
} from "./runtime/platformApi";
import {
  createRealtimeInvalidationBridge,
  type DashboardRealtimeConfig,
  type RealtimeInvalidationBridge,
} from "./realtime/realtimeBridge";
import { createRuntimeCausality } from "./observability/runtimeCausality";
import { createInvalidationCompressionLayer } from "./runtime/invalidationCompression";
import { createDashboardRuntimeTelemetry } from "./observability/runtimeTelemetry";
import { createDashboardRuntimeEventLog } from "./observability/runtimeEventLog";
import { createResourceOwnershipGraph } from "./runtime/resourceOwnership";

export function createDashboardPlatform() {
  return {
    version: 5,
    interaction: {
      VERSION: DASHBOARD_INTERACTION_VERSION,
      EVENT_TYPES: DASHBOARD_EVENT_TYPES,
      normalize: normalizeInteractionEvent,
      resolveWidget: resolveWidgetInteraction,
      substitutePayload: substitutePayloadTemplates,
      buildOpenEntityDrawer: buildOpenEntityDrawerEvent,
    },
    mutation: {
      EVENT_TYPES: MUTATION_EVENT_TYPES,
      normalize: normalizeMutationEvent,
      resolveInvalidationTargets: resolveMutationInvalidationTargets,
    },
    query: {
      buildAst: buildQueryAst,
      compose: composeWidgetQuery,
      hashSignature: hashQuerySignature,
    },
    cache: { create: createDashboardCache },
    invalidation: { createBus: createInvalidationBus },
    subscriptions: { createGraph: createQuerySubscriptionGraph },
    scheduler: { create: createDashboardRuntimeScheduler },
    execution: { createCoordinator: createDashboardExecutionCoordinator },
    lifetime: { createTree: createRuntimeLifetimeTree },
    scope: { create: createRuntimeScope },
    lifecycle: {
      PHASES: WIDGET_LIFECYCLE,
      transition: transitionLifecycle,
      canTransition,
    },
    devtools: { createCollector: createDashboardDevtoolsCollector },
    causality: { create: createRuntimeCausality },
    compression: { createLayer: createInvalidationCompressionLayer },
    telemetry: { create: createDashboardRuntimeTelemetry },
    eventLog: { create: createDashboardRuntimeEventLog },
    ownership: { createGraph: createResourceOwnershipGraph },
    api: { createPublic: createDashboardPlatformAPI },
    realtime: { createBridge: createRealtimeInvalidationBridge },
    widget: {
      resolveCapabilities: resolveWidgetCapabilities,
      resolveEditor: resolveWidgetEditorMeta,
    },
  };
}

export type DashboardPlatform = ReturnType<typeof createDashboardPlatform>;
export type { WidgetLifecyclePhase } from "./runtime/widgetLifecycle";
export type { DashboardPlatformAPI } from "./runtime/platformApi";
export type {
  DashboardRealtimeConfig,
  RealtimeInvalidationBridge,
} from "./realtime/realtimeBridge";
export type {
  DashboardQueryStore,
  DashboardRuntimeStore,
  DashboardWidgetStateSlice,
  DashboardSessionSlice,
} from "./types/dashboardStore";
export type { WidgetCacheEntry } from "./query/cacheManager";
