import { isServer } from "@solidjs/web";

import type {
  OpenFormInfo,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import {
  isPageDesignerRouteId,
} from "~/features/page_designer/utils/pageDesignerUrl";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function isInternalId(id: string): boolean {
  return id.includes(":") || id.includes("-");
}

function getKeyFromCurrentUrl(entity: string): string | undefined {
  const currentUrl = new URL(window.location.href);
  const tabs = currentUrl.searchParams.get("tabs");
  if (!tabs) {
    return undefined;
  }

  for (const tab of tabs.split(",")) {
    const [tabEntity, tabKey] = tab.split(":");
    if (tabEntity === entity && tabKey && !isInternalId(tabKey)) {
      return tabKey;
    }
  }

  return undefined;
}

function resolveTabKey(
  form: OpenFormInfo,
  graph: GraphInterface,
): string | undefined {
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

  if (!isInternalId(form.dataId) && !isPageDesignerRouteId(form.dataId)) {
    return form.dataId;
  }

  return getKeyFromCurrentUrl(form.label);
}

/**
 * Updates the URL query parameters with all opened form tabs (entity:key format).
 * The path stays `/admin/{entity}` so no single tab key is encoded in the path.
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

  const focusedForm = openForms.find(
    (form) => form.formId === layoutStore.focusedFormId,
  );
  const pathEntity = focusedForm?.label || allTabs[0]?.split(":")[0];
  if (!pathEntity) {
    return;
  }

  const newUrl = new URL(window.location.href);
  // Keep only the entity in the path; tab keys live in the query string.
  newUrl.pathname = `/admin/${pathEntity}`;
  newUrl.searchParams.set("tabs", allTabs.join(","));

  const nextUrl = newUrl.toString();
  if (nextUrl !== window.location.href) {
    window.history.replaceState({}, "", nextUrl);
  }
}
