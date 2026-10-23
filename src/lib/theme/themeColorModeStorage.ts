import type { StoreSetter as SetStoreFunction } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { ColorMode } from "~/lib/styles/types/types";

const STORAGE_KEY = "themeColorMode";

function isValidColorMode(value: unknown): value is ColorMode {
  return value === "light" || value === "dark" || value === "system";
}

function readFromLocalStorage(): ColorMode | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isValidColorMode(stored) ? stored : null;
}

function writeToLocalStorage(mode: ColorMode): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function hasUserSetting(graph: GraphInterface): boolean {
  const userSettingId = getGlobalStore(graph).P.userSettingId;
  return Boolean(userSettingId && graph.vertexes[userSettingId]);
}

export function getThemeColorMode(graph: GraphInterface): ColorMode {
  const userSettingId = getGlobalStore(graph).P.userSettingId;
  const userThemeColorMode =
    userSettingId && graph.vertexes[userSettingId]?.P?.themeColorMode;
  if (userThemeColorMode) {
    return userThemeColorMode;
  }
  return getGlobalStore(graph).P.themeColorMode || "light";
}

export function setGlobalStoreThemeColorMode(
  mode: ColorMode,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
    themeColorMode: mode,
  });
}

export function setLocalThemeColorMode(
  mode: ColorMode,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  setGlobalStoreThemeColorMode(mode, graph, setGraph);
  writeToLocalStorage(mode);
}

export function hydrateThemeColorModeFromLocalStorage(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  if (hasUserSetting(graph)) {
    return;
  }

  const stored = readFromLocalStorage();
  if (!stored || getGlobalStore(graph).P.themeColorMode === stored) {
    return;
  }

  setGlobalStoreThemeColorMode(stored, graph, setGraph);
}

export function initThemeColorModeStorageSync(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !isValidColorMode(event.newValue)) {
      return;
    }
    if (hasUserSetting(graph)) {
      return;
    }
    setGlobalStoreThemeColorMode(event.newValue, graph, setGraph);
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
