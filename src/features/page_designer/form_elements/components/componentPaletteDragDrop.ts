import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import {
  PAGE_DESIGNER_DRAG_TYPES,
  isPageDesignerDragSource,
} from "~/features/page_designer/functions/drag_drop/pragmatic/pageDesignerDragTypes";
import { getIndicatorPosition } from "~/features/page_designer/functions/drag_drop/ui/getIndicatorPosition";
import type { PaletteTreeConfig } from "./componentPaletteConfig";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

import { isPaletteCategory, isPaletteContent } from "./componentPaletteUtils";

export type PaletteDropPosition = "before" | "after" | "center";

export interface ComponentPaletteDropSnapshot {
  activeItemId: Id;
  dragPosition: PaletteDropPosition;
  sourceType: string;
  sourceId: Id;
}

function canAcceptPaletteDrag(type: unknown) {
  return (
    type === PAGE_DESIGNER_DRAG_TYPES.PALETTE_CATEGORY ||
    type === PAGE_DESIGNER_DRAG_TYPES.PALETTE_CONTENT_ITEM ||
    type === PAGE_DESIGNER_DRAG_TYPES.PALETTE_PAGE
  );
}

export interface ComponentPaletteDragDropContext {
  config: PaletteTreeConfig;
  item: Vertex;
  setDropState: (
    activeItemId: Id | null,
    dragPosition: PaletteDropPosition | null,
  ) => void;
  onDrop: (snapshot: ComponentPaletteDropSnapshot) => Promise<void>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function attachComponentPaletteTreeDragDrop(
  element: HTMLElement,
  ctx: ComponentPaletteDragDropContext,
): () => void {
  // @ts-expect-error used by getIndicatorPosition
  element.useCurrentPosition = true;

  const dragCleanup = draggable({
    element,
    getInitialData: () => {
      if (isPaletteContent(ctx.item, ctx.config)) {
        const isPage = ctx.config.tableVertexLabel === "Page";
        const dragType = isPage
          ? PAGE_DESIGNER_DRAG_TYPES.PALETTE_PAGE
          : PAGE_DESIGNER_DRAG_TYPES.PALETTE_CONTENT_ITEM;
        return {
          type: dragType,
          itemId: ctx.item.id,
          compId: ctx.item.id,
          vertexId: ctx.item.id,
          vertexIds: [ctx.item.id],
        };
      }
      return {
        type: PAGE_DESIGNER_DRAG_TYPES.PALETTE_CATEGORY,
        itemId: ctx.item.id,
        categoryId: ctx.item.id,
      };
    },
    onDrop: () => {
      ctx.onDragEnd?.();
      ctx.setDropState(null, null);
    },
    onDragStart: () => {
      ctx.onDragStart?.();
    },
  });

  const dropCleanup = dropTargetForElements({
    element,
    canDrop: ({ source }) => canAcceptPaletteDrag(source.data.type),
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDrag: ({ location }) => {
      const position = getIndicatorPosition(
        location.current.input as unknown as MouseEvent,
        element,
      ) as PaletteDropPosition;
      ctx.setDropState(ctx.item.id, position);
    },
    onDrop: async ({ source, location }) => {
      const position = getIndicatorPosition(
        location.current.input as unknown as MouseEvent,
        element,
      ) as PaletteDropPosition;
      const sourceType = String(source.data.type ?? "");
      const sourceId = (source.data.itemId ??
        source.data.categoryId ??
        source.data.compId) as Id;
      ctx.setDropState(null, null);
      if (!sourceId || sourceId === ctx.item.id) return;
      await ctx.onDrop({
        activeItemId: ctx.item.id,
        dragPosition: position,
        sourceType,
        sourceId,
      });
    },
  });

  return combine(dragCleanup, dropCleanup);
}

export function isPaletteTreeDragSource(type: unknown) {
  return canAcceptPaletteDrag(type) || isPageDesignerDragSource(type);
}
