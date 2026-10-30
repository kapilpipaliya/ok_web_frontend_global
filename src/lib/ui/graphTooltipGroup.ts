import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

export type GraphTooltipRegistry = NonNullable<
  GlobalProperties["tooltipRegistry"]
>;
export type GraphActiveTooltips = NonNullable<
  GlobalProperties["activeTooltips"]
>;

const GLOBAL_STORE_VERTEX_ID = "globalStoreId";

/** Bumped when a new hover-open is scheduled so older delayed opens are ignored. */
const hoverOpenVersion: Record<string, number> = {};

function tooltipGroupKey(groupKey: string | undefined): string {
  return groupKey || "default";
}

export function nextGraphTooltipHoverOpenVersion(groupKey?: string): number {
  const key = tooltipGroupKey(groupKey);
  const next = (hoverOpenVersion[key] ?? 0) + 1;
  hoverOpenVersion[key] = next;
  return next;
}

export function isStaleGraphTooltipHoverOpenVersion(
  groupKey: string | undefined,
  version: number,
): boolean {
  const key = tooltipGroupKey(groupKey);
  return (hoverOpenVersion[key] ?? 0) !== version;
}

function cloneTooltipRegistry(
  p: GlobalProperties["tooltipRegistry"],
): GraphTooltipRegistry {
  return p ? { ...p } : {};
}

function cloneActiveTooltips(
  p: GlobalProperties["activeTooltips"],
): GraphActiveTooltips {
  return p ? { ...p } : {};
}

/**
 * Registers a tooltip id in the global store under `group`. When the component
 * unmounts, call the returned cleanup to remove it from the registry (and from
 * `activeTooltips` if needed).
 */
export function registerGraphTooltipInGroup(
  group: string | undefined,
  tooltipId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): () => void {
  if (!group) {
    return () => {};
  }

  const globalStore = getGlobalStore(graph);
  const tooltipRegistry = cloneTooltipRegistry(globalStore.P.tooltipRegistry);

  const groupTooltips = tooltipRegistry[group] ?? [];
  if (!groupTooltips.includes(tooltipId)) {
    const updatedGroupTooltips = [...groupTooltips, tooltipId];

    mergeVertexProperties(0, GLOBAL_STORE_VERTEX_ID, graph, setGraph, {
      tooltipRegistry: {
        ...tooltipRegistry,
        [group]: updatedGroupTooltips,
      },
    });
  }

  return () => {
    const latestGlobalStore = getGlobalStore(graph);
    const latestRegistry = cloneTooltipRegistry(
      latestGlobalStore.P.tooltipRegistry,
    );

    if (!latestRegistry[group]) {
      return;
    }

    const filteredTooltips = latestRegistry[group].filter(
      (id) => id !== tooltipId,
    );

    const updatedRegistry = { ...latestRegistry };

    if (filteredTooltips.length === 0) {
      delete updatedRegistry[group];
    } else {
      updatedRegistry[group] = filteredTooltips;
    }

    mergeVertexProperties(0, GLOBAL_STORE_VERTEX_ID, graph, setGraph, {
      tooltipRegistry: updatedRegistry,
    });

    const activeTooltips = cloneActiveTooltips(
      latestGlobalStore.P.activeTooltips,
    );
    if (activeTooltips[tooltipId]) {
      const updatedActiveTooltips = { ...activeTooltips };
      delete updatedActiveTooltips[tooltipId];

      mergeVertexProperties(0, GLOBAL_STORE_VERTEX_ID, graph, setGraph, {
        activeTooltips: updatedActiveTooltips,
      });
    }
  };
}

export function setGraphTooltipActive(
  tooltipId: string,
  isActive: boolean,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  const globalStore = getGlobalStore(graph);
  const activeTooltips = cloneActiveTooltips(globalStore.P.activeTooltips);

  mergeVertexProperties(0, GLOBAL_STORE_VERTEX_ID, graph, setGraph, {
    activeTooltips: {
      ...activeTooltips,
      [tooltipId]: isActive,
    },
  });
}

/** Sets every tooltip in `group` inactive except `activeTooltipId`, which becomes active. */
export function closeOtherGraphTooltipsInGroup(
  group: string | undefined,
  activeTooltipId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  if (!group) {
    return;
  }

  const globalStore = getGlobalStore(graph);
  const tooltipRegistry = cloneTooltipRegistry(globalStore.P.tooltipRegistry);
  const activeTooltips = cloneActiveTooltips(globalStore.P.activeTooltips);

  const groupTooltips = tooltipRegistry[group] ?? [];

  const updatedActiveTooltips = { ...activeTooltips };

  groupTooltips.forEach((id) => {
    if (id !== activeTooltipId) {
      updatedActiveTooltips[id] = false;
    }
  });

  updatedActiveTooltips[activeTooltipId] = true;

  mergeVertexProperties(0, GLOBAL_STORE_VERTEX_ID, graph, setGraph, {
    activeTooltips: updatedActiveTooltips,
  });
}
