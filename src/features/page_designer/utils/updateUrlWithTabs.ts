import { isServer } from "solid-js/web";

import type {
  OpenFormInfo,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function isInternalId(id: string): boolean {
  return id.includes(":") || id.includes("-");
}

function getKeyFromCurrentUrl(entity: string): string | undefined {
  const currentUrl = new URL(window.location.href);
  const pathParts = currentUrl.pathname.split("/").filter(Boolean);
  const adminIndex = pathParts.indexOf("admin");

  if (adminIndex !== -1 && pathParts[adminIndex + 1] === entity) {
    const pathKey = pathParts[adminIndex + 2];
    if (pathKey && !isInternalId(pathKey)) {
      return pathKey;
    }
  }

  const tabs = currentUrl.searchParams.get("tabs");
  if (tabs) {
    for (const tab of tabs.split(",")) {
      const [tabEntity, tabKey] = tab.split(":");
      if (tabEntity === entity && tabKey && !isInternalId(tabKey)) {
        return tabKey;
      }
    }
  }

  return undefined;
}

function resolveTabKey(form: OpenFormInfo, graph: GraphInterface): string | undefined {
  const dataVertex = graph.vertexes[form.dataId];
  if (dataVertex?.P?.key) {
    return dataVertex.P.key as string;
  }

  const formStore = graph.vertexes[form.formId]?.P;
  const formDataId = formStore?.formDataId as Id | undefined;
  if (formDataId) {
    const formDataVertex = graph.vertexes[formDataId];
    if (formDataVertex?.P?.key) {
      return formDataVertex.P.key as string;
    }
  }

  if (!isInternalId(form.dataId)) {
    return form.dataId;
  }

  return getKeyFromCurrentUrl(form.label);
}

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

  const openForms = layoutStore.openedFormIds
    .map((formId) => graph.vertexes[formId]?.P as OpenFormInfo | undefined)
    .filter((form): form is OpenFormInfo =>
      Boolean(form?.dataId && form.dataId !== "new" && form.label),
    );

  const allTabs = openForms
    .map((form) => {
      const key = resolveTabKey(form, graph);
      if (!key) {
        return undefined;
      }
      return `${form.label}:${key}`;
    })
    .filter((tab): tab is string => Boolean(tab));

  const currentUrl = new URL(window.location.href);

  if (allTabs.length === 0) {
    // Keep the current URL while tabs are still loading and keys are unresolved.
    if (openForms.length > 0) {
      return;
    }

    currentUrl.searchParams.delete("tabs");
    const nextUrl = currentUrl.toString();
    if (nextUrl !== window.location.href) {
      window.history.replaceState({}, "", nextUrl);
    }
    return;
  }

  const firstTab = allTabs[0];
  const [firstEntity, firstKey] = firstTab.split(":");
  if (!firstEntity || !firstKey) {
    return;
  }

  const newPath = `/admin/${firstEntity}/${firstKey}`;
  const newUrl = new URL(window.location.href);
  newUrl.pathname = newPath;
  newUrl.searchParams.set("tabs", allTabs.join(","));

  const nextUrl = newUrl.toString();
  if (nextUrl !== window.location.href) {
    window.history.replaceState({}, "", nextUrl);
  }
}
