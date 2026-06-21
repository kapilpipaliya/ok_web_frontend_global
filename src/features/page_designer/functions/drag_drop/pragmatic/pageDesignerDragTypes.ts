export const PAGE_DESIGNER_DRAG_TYPES = {
  LAYOUT_ITEM: "page-designer-layout-item",
  PALETTE_COMPONENT: "page-designer-palette-component",
  PALETTE_PAGE: "page-designer-palette-page",
  TAB: "page-designer-tab",
} as const;

export type PageDesignerDragType =
  (typeof PAGE_DESIGNER_DRAG_TYPES)[keyof typeof PAGE_DESIGNER_DRAG_TYPES];

const PAGE_DESIGNER_DRAG_TYPE_VALUES = new Set<string>(
  Object.values(PAGE_DESIGNER_DRAG_TYPES),
);

export function isPageDesignerDragSource(
  type: unknown,
): type is PageDesignerDragType {
  return typeof type === "string" && PAGE_DESIGNER_DRAG_TYPE_VALUES.has(type);
}
