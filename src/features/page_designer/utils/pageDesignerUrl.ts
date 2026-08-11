import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";

/** Internal route id so the designer keeps matching `/admin/:entity/:id`. */
export const PAGE_DESIGNER_ROUTE_ID = "open";

export function isPageDesignerRouteId(
  id: string | undefined | null,
): boolean {
  return id === PAGE_DESIGNER_ROUTE_ID;
}

export function isPageDesignerEntity(entity: string | undefined | null): boolean {
  return (
    entity === "Component" ||
    (typeof entity === "string" && PageDesignerLabels.includes(entity))
  );
}

/**
 * Builds a page designer URL.
 * Address-bar sync later rewrites this to `/admin/{entity}?tabs=...`
 * (no single tab key in the path). Entry navigation still uses `/open`
 * so the designer route matches.
 */
export function buildPageDesignerUrl(
  entity: string,
  tabs: Array<{ entity: string; key: string }>,
): string {
  const path = `/admin/${entity}/${PAGE_DESIGNER_ROUTE_ID}`;
  if (tabs.length === 0) {
    return path;
  }
  const tabsParam = tabs.map((tab) => `${tab.entity}:${tab.key}`).join(",");
  return `${path}?tabs=${encodeURIComponent(tabsParam)}`;
}
