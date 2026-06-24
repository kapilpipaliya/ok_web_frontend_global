/**
 * Public platform kernel boundary — widgets and hosts must use only this surface.
 */

import type { InvalidationEvent } from "./invalidationBus";
import type { DashboardInteractionEvent } from "../contracts/interactionContracts";
import type { MutationEvent } from "../contracts/mutationContracts";
import type { DashboardRuntimeStore } from "../types/dashboardStore";

export type DashboardPlatformAPI = {
  invalidate: (
    event: InvalidationEvent & { logicalKeys?: string[]; priority?: string },
  ) => string[];
  publishMutation: (
    mutation: MutationEvent | DashboardInteractionEvent,
  ) => string[];
  dispatchInteraction: (event: DashboardInteractionEvent) => Promise<void>;
  refreshWidget: (
    widgetId: string,
    meta?: Record<string, unknown>,
  ) => Promise<void>;
  refreshCrudWidget: (widgetId: string) => void;
  refreshAllWidgets: () => Promise<void>;
  openEntity: (payload: Record<string, unknown>) => Promise<void>;
  closeEntity: () => void;
  getWidgetState: (widgetId: string) => Record<string, unknown>;
  disposeScope: (scopeId: string) => void;
  dispose: () => void;
};

export type DashboardPlatformAPIInternals = {
  invalidate: DashboardPlatformAPI["invalidate"];
  publishMutation: DashboardPlatformAPI["publishMutation"];
  dispatchInteraction: DashboardPlatformAPI["dispatchInteraction"];
  refreshWidget: (
    widgetId: string,
    meta?: Record<string, unknown>,
  ) => Promise<void>;
  refreshCrudWidget: (widgetId: string) => void;
  refreshAllWidgets: () => Promise<void>;
  closeEntityDrawer: () => void;
  dispatchInteractionRaw: (event: DashboardInteractionEvent) => Promise<void>;
  store: Pick<
    DashboardRuntimeStore,
    | "getWidgetState"
    | "patchWidgetState"
    | "setUi"
    | "getSession"
    | "patchSession"
  >;
  config: { entityDrawer?: { defaultView?: string; enabled?: boolean } };
};

export function createDashboardPlatformAPI(
  internals: DashboardPlatformAPIInternals,
): DashboardPlatformAPI {
  return {
    invalidate: (event) => internals.invalidate(event),
    publishMutation: (mutation) =>
      internals.publishMutation(mutation as MutationEvent),
    dispatchInteraction: (event) => internals.dispatchInteraction(event),
    refreshWidget: (widgetId, meta) => internals.refreshWidget(widgetId, meta),
    refreshCrudWidget: (widgetId) => internals.refreshCrudWidget(widgetId),
    refreshAllWidgets: () => internals.refreshAllWidgets(),
    openEntity: async (payload) => {
      await internals.dispatchInteractionRaw({
        type: "OPEN_ENTITY_DRAWER",
        payload,
      });
    },
    closeEntity: () => internals.closeEntityDrawer(),
    getWidgetState: (widgetId) =>
      internals.store.getWidgetState(widgetId) || {},
    disposeScope: (scopeId) => {
      void scopeId;
      internals.closeEntityDrawer();
    },
    dispose: () => {
      /* Host registers full dispose on lifetime tree */
    },
  };
}
