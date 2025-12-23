import { isServer } from "solid-js/web";

import type {
  OpenFormInfo,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Updates the URL query parameters with all opened form tabs (entity:key format)
 * @param layoutStoreId - The ID of the layout store vertex
 * @param graph - The graph interface containing all vertices
 */
export function updateUrlWithOpenedTabs(
  layoutStoreId: Id,
  graph: GraphInterface,
): void {
  if (isServer || typeof window === "undefined") {
    return;
  }

  const layoutStore = graph.vertexes[layoutStoreId]?.P as
    | PageLayoutObject
    | undefined;
  if (!layoutStore) {
    return;
  }

  const allTabs = layoutStore.openedFormIds
    .map((formId) => {
      const form = graph.vertexes[formId]?.P as OpenFormInfo | undefined;
      if (!form?.dataId || form.dataId === "new" || !form.label) {
        return undefined;
      }
      // Get the vertex by dataId and use its key, fall back to dataId if no key
      const vertex = graph.vertexes[form.dataId];
      const key = vertex?.P?.key || form.dataId;
      return `${form.label}:${key}`;
    })
    .filter((tab): tab is string => Boolean(tab));

  if (allTabs.length === 0) {
    // If no tabs left, remove the tabs parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("tabs");
    window.history.replaceState({}, "", currentUrl.toString());
    return;
  }

  const currentUrl = new URL(window.location.href);
  const firstTab = allTabs[0];
  const [firstEntity, firstKey] = firstTab.split(":");
  const pathParts = currentUrl.pathname.split("/");
  const entityIndex = pathParts.findIndex(
    (part) => part && !part.includes("("),
  );

  // Build new path with first tab's entity and key
  if (entityIndex !== -1 && firstEntity && firstKey) {
    const newPath = `/admin/${firstEntity}/${firstKey}`;
    const newUrl = new URL(window.location.origin + newPath);

    // Set all tabs in query parameter (format: entity:key,entity:key)
    newUrl.searchParams.set("tabs", allTabs.join(","));

    // Update URL without page reload
    window.history.replaceState({}, "", newUrl.toString());
  }
}
