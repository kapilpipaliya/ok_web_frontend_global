import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import { resetDragDropState } from "~/features/page_designer/event_handler/resetDragDropState";
import {
  cancelPendingDropPositionClear,
  createLayoutDropSnapshot,
  scheduleDropPositionClear,
} from "~/features/page_designer/functions/drag_drop/pragmatic/dropPositionState";
import { executeLayoutDrop } from "~/features/page_designer/functions/drag_drop/pragmatic/executeLayoutDrop";
import {
  getPaletteDragVertices,
  getVertexIdsFromSourceData,
  type PaletteDragContext,
} from "~/features/page_designer/functions/drag_drop/pragmatic/paletteDragHelpers";
import {
  isPageDesignerDragSource,
  PAGE_DESIGNER_DRAG_TYPES,
} from "~/features/page_designer/functions/drag_drop/pragmatic/pageDesignerDragTypes";
import {
  getFormDataVertex,
  setDropPositionFromPointer,
  setRootDropPosition,
} from "~/features/page_designer/functions/drag_drop/pragmatic/setDropPositionFromPointer";
import { syncLayoutTreeDragHover } from "~/features/page_designer/functions/layout/layoutHoverState";
import {
  cancelPendingPreviewHoverClear,
  schedulePreviewHoverClear,
} from "~/features/page_designer/functions/layout/previewHover";

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function canDropPageDesignerSource(source: { data: Record<string, unknown> }) {
  return isPageDesignerDragSource(source.data.type);
}

function markUseCurrentPosition(element: HTMLElement) {
  // Enables 4px edge zones in getIndicatorPosition (layout tree + preview).
  // @ts-expect-error used by getIndicatorPosition
  element.useCurrentPosition = true;
}

function getLayoutStore(ctx: {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
}) {
  return ctx.layoutStoreVertex();
}

type DropTargetLocation = {
  current: {
    dropTargets: Array<{ element: Element }>;
    input: { clientX: number; clientY: number };
  };
};

type PositionUpdater = (
  input: { clientX: number; clientY: number },
  sourceData: Record<string, unknown>,
) => void;

// Nested wrappers (parent + child Attr) all register drop targets. This map
// lets us promote the next innermost target when leaving a nested child.
const dropTargetHandlers = new WeakMap<
  HTMLElement,
  {
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    updatePosition: PositionUpdater;
  }
>();

// Pragmatic lists drop targets innermost-first. Parent targets must not
// overwrite position/drop when a child target is also under the pointer.
function isInnermostDropTarget(element: Element, location: DropTargetLocation) {
  return location.current.dropTargets[0]?.element === element;
}

// Moving from a child wrapper to its parent leaves the child but the parent
// is still a valid target — refresh position/hover on the new innermost.
function promoteInnermostDropTarget(
  location: DropTargetLocation,
  sourceData: Record<string, unknown>,
) {
  cancelPendingDropPositionClear();
  const innermost = location.current.dropTargets[0]?.element;
  if (!(innermost instanceof HTMLElement)) {
    return;
  }

  const handlers = dropTargetHandlers.get(innermost);
  handlers?.onDragEnter?.();
  handlers?.updatePosition(location.current.input, sourceData);
}

function scheduleDropStateCleanup(ctx: {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  // Drop target onDrop runs before draggable onDrop; defer cleanup so the
  // snapshot is captured before activeItem/dragPosition are cleared.
  queueMicrotask(() => {
    resetDragDropState(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
  });
}

async function runLayoutDrop(
  ctx: {
    layoutStoreVertex: () => Vertex<PageLayoutObject>;
    formStoreVertex: () => Vertex<FormStoreObject> | undefined;
    graph: GraphInterface;
    setGraph: SetStoreFunction<GraphInterface>;
    showErrorToast: (message: string) => void;
    onDragLeave?: () => void;
  },
  vertexIds: Id[],
) {
  ctx.onDragLeave?.();
  cancelPendingDropPositionClear();

  const formStore = ctx.formStoreVertex();
  // Snapshot is taken synchronously at drop time; vertexIds come from source.data.
  const snapshot = createLayoutDropSnapshot(getLayoutStore(ctx), vertexIds);
  if (!(formStore && snapshot)) {
    return;
  }

  await executeLayoutDrop(
    getLayoutStore(ctx),
    formStore,
    ctx.graph,
    ctx.setGraph,
    ctx.showErrorToast,
    snapshot,
  );
  resetDragDropState(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
}

export interface LayoutTreeDragDropContext {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  formStoreVertex: () => Vertex<FormStoreObject> | undefined;
  layoutVertex: Vertex;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  collapsedKeys: Accessor<Id[]>;
  children: Accessor<Vertex[]>;
  showErrorToast: (message: string) => void;
  onExpandChildren?: (dragPosition: string) => void;
}

export interface PreviewDropTargetContext {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  formStoreVertex: () => Vertex<FormStoreObject> | undefined;
  layoutVertex: Vertex;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  isDesignMode?: boolean;
  collapsedKeys?: Accessor<Id[]> | boolean;
  children: Accessor<Vertex[]>;
  showErrorToast: (message: string) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

export interface RootDropTargetContext {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  formStoreVertex: () => Vertex<FormStoreObject> | undefined;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  showErrorToast: (message: string) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

export interface PaletteComponentDragContext extends PaletteDragContext {}

export interface PalettePageDragContext extends PaletteDragContext {}

export interface LayoutItemDragContext {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  layoutVertex: Vertex;
}

export interface TabDragContext {
  openedFormId: Id;
}

export interface TabPanelDropContext {
  mainPanel: Id;
  moveTab: (toPanelId: Id, openedFormId: Id) => void;
}

function createPositionUpdater(
  element: HTMLElement,
  ctx: PreviewDropTargetContext,
) {
  return (
    input: { clientX: number; clientY: number },
    sourceData: Record<string, unknown>,
  ) => {
    const layoutStore = getLayoutStore(ctx);
    const formStore = ctx.formStoreVertex();
    const vertexIds = getVertexIdsFromSourceData(sourceData);

    setDropPositionFromPointer(
      input,
      element,
      layoutStore,
      ctx.layoutVertex,
      ctx.isDesignMode,
      ctx.collapsedKeys ?? false,
      ctx.children,
      ctx.graph,
      ctx.setGraph,
      getFormDataVertex(formStore, ctx.graph),
      vertexIds[0],
    );
  };
}

function attachElementDropTarget(
  element: HTMLElement,
  ctx: PreviewDropTargetContext,
  updatePosition: PositionUpdater,
  onExpandChildren?: (dragPosition: string) => void,
) {
  let expandStartTime = 0;

  dropTargetHandlers.set(element, {
    onDragEnter: ctx.onDragEnter,
    onDragLeave: ctx.onDragLeave,
    updatePosition,
  });

  return dropTargetForElements({
    element,
    canDrop: ({ source }) => canDropPageDesignerSource(source),
    onDragEnter: ({ location, source }) => {
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      cancelPendingDropPositionClear();
      ctx.onDragEnter?.();
      expandStartTime = Date.now();
      updatePosition(location.current.input, source.data);
    },
    onDrag: ({ location, source }) => {
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      cancelPendingDropPositionClear();
      updatePosition(location.current.input, source.data);
      const dragPosition = getLayoutStore(ctx).P.dragPosition;
      if (
        onExpandChildren &&
        dragPosition === "center" &&
        Date.now() - expandStartTime > 1000
      ) {
        onExpandChildren(dragPosition);
      }
    },
    onDragLeave: ({ location, source }) => {
      // Still over a parent/ancestor target — promote instead of clearing.
      if (location.current.dropTargets.length > 0) {
        promoteInnermostDropTarget(location, source.data);
        return;
      }

      // Left all drop targets (e.g. dragged out of preview).
      scheduleDropPositionClear(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
      ctx.onDragLeave?.();
    },
    onDrop: ({ location, source }) => {
      // Pragmatic fires onDrop on every nested target; only innermost executes.
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      cancelPendingDropPositionClear();
      updatePosition(location.current.input, source.data);
      void runLayoutDrop(ctx, getVertexIdsFromSourceData(source.data));
    },
  });
}

function createPaletteDraggable(
  element: HTMLElement,
  ctx: PaletteDragContext,
  type:
    | typeof PAGE_DESIGNER_DRAG_TYPES.PALETTE_COMPONENT
    | typeof PAGE_DESIGNER_DRAG_TYPES.PALETTE_PAGE,
): () => void {
  return draggable({
    element,
    getInitialData: () => {
      const vertexIds = getPaletteDragVertices(ctx).map((vertex) => vertex.id);

      return {
        type,
        vertexId: ctx.vertexId,
        vertexIds,
      };
    },
    onDragStart: () => {
      ctx.clearSelectedVertices?.();
    },
  });
}

export function attachPaletteComponentDraggable(
  element: HTMLElement,
  ctx: PaletteComponentDragContext,
): () => void {
  return createPaletteDraggable(
    element,
    ctx,
    PAGE_DESIGNER_DRAG_TYPES.PALETTE_COMPONENT,
  );
}

export function attachPalettePageDraggable(
  element: HTMLElement,
  ctx: PalettePageDragContext,
): () => void {
  return createPaletteDraggable(
    element,
    ctx,
    PAGE_DESIGNER_DRAG_TYPES.PALETTE_PAGE,
  );
}

export function attachLayoutTreeItemDragDrop(
  element: HTMLElement,
  ctx: LayoutTreeDragDropContext,
): () => void {
  markUseCurrentPosition(element);

  const previewCtx: PreviewDropTargetContext = {
    layoutStoreVertex: ctx.layoutStoreVertex,
    formStoreVertex: ctx.formStoreVertex,
    layoutVertex: ctx.layoutVertex,
    graph: ctx.graph,
    setGraph: ctx.setGraph,
    isDesignMode: false,
    collapsedKeys: ctx.collapsedKeys,
    children: ctx.children,
    showErrorToast: ctx.showErrorToast,
    // Mouse events don't fire during pragmatic drag — mirror preview hover for tree rows.
    onDragEnter: () => {
      cancelPendingPreviewHoverClear();
      mergeVertexProperties<PageLayoutObject>(
        0,
        ctx.layoutStoreVertex().id,
        ctx.graph,
        ctx.setGraph,
        {
          previewHoverId: ctx.layoutVertex.id,
          layoutTreeScrollSource: "layoutTree",
        },
      );
    },
    onDragLeave: () => {
      const formStore = ctx.formStoreVertex();
      if (formStore?.id) {
        schedulePreviewHoverClear(
          ctx.layoutStoreVertex().id,
          formStore.id,
          ctx.graph,
          ctx.setGraph,
        );
      }
    },
  };

  const baseUpdatePosition = createPositionUpdater(element, previewCtx);
  const updatePosition: PositionUpdater = (input, sourceData) => {
    baseUpdatePosition(input, sourceData);
    syncLayoutTreeDragHover(
      ctx.layoutStoreVertex(),
      ctx.layoutVertex,
      ctx.formStoreVertex(),
      ctx.graph,
      ctx.setGraph,
    );
  };

  const dragCleanup = draggable({
    element,
    getInitialData: () => ({
      type: PAGE_DESIGNER_DRAG_TYPES.LAYOUT_ITEM,
      vertexId: ctx.layoutVertex.id,
      vertexIds: [ctx.layoutVertex.id],
    }),
    onDrop: () => {
      scheduleDropStateCleanup(ctx);
    },
  });

  return combine(
    dragCleanup,
    attachElementDropTarget(
      element,
      previewCtx,
      updatePosition,
      (dragPosition) => ctx.onExpandChildren?.(dragPosition),
    ),
  );
}

export function attachPreviewDropTarget(
  element: HTMLElement,
  ctx: PreviewDropTargetContext,
): () => void {
  // Preview canvas uses tight edge zones like the layout tree.
  markUseCurrentPosition(element);
  const updatePosition = createPositionUpdater(element, ctx);
  return attachElementDropTarget(element, ctx, updatePosition);
}

function isRootDropTargetActive(
  layoutStore: Vertex<PageLayoutObject>,
  formDataId: Id | undefined,
) {
  // Root only owns the drop when no nested item has set activeItem, or when
  // activeItem is the page root (append-to-page / empty-area drop).
  if (!formDataId) {
    return true;
  }

  const { activeItem, dragPosition } = layoutStore.P;
  if (activeItem == null || dragPosition == null) {
    return true;
  }

  return activeItem === formDataId;
}

export function attachRootDropTarget(
  element: HTMLElement,
  ctx: RootDropTargetContext,
): () => void {
  const setRootPosition = () => {
    const formStore = ctx.formStoreVertex();
    const formDataId = formStore?.P.formDataId;
    if (!formDataId) {
      return;
    }
    setRootDropPosition(
      getLayoutStore(ctx),
      formDataId,
      ctx.graph,
      ctx.setGraph,
    );
  };

  return dropTargetForElements({
    element,
    canDrop: ({ source }) => canDropPageDesignerSource(source),
    onDragEnter: () => {
      cancelPendingDropPositionClear();
      ctx.onDragEnter?.();
      // Do not set root position here — nested item targets set activeItem.
    },
    onDrag: ({ location }) => {
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      cancelPendingDropPositionClear();
      const layoutStore = getLayoutStore(ctx);
      const formDataId = ctx.formStoreVertex()?.P.formDataId;
      if (isRootDropTargetActive(layoutStore, formDataId)) {
        setRootPosition();
      }
    },
    onDragLeave: ({ location }) => {
      if (location.current.dropTargets.length > 0) {
        return;
      }

      scheduleDropPositionClear(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
      ctx.onDragLeave?.();
    },
    onDrop: ({ location, source }) => {
      // Only handle when pointer is over empty preview (no nested item target).
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      cancelPendingDropPositionClear();
      const layoutStore = getLayoutStore(ctx);
      const formDataId = ctx.formStoreVertex()?.P.formDataId;

      if (!isRootDropTargetActive(layoutStore, formDataId)) {
        return;
      }

      if (
        layoutStore.P.activeItem == null ||
        layoutStore.P.dragPosition == null
      ) {
        setRootPosition();
      }

      void runLayoutDrop(ctx, getVertexIdsFromSourceData(source.data));
    },
  });
}

export function attachLayoutItemDraggable(
  element: HTMLElement,
  ctx: LayoutItemDragContext,
): () => void {
  return draggable({
    element,
    getInitialData: () => ({
      type: PAGE_DESIGNER_DRAG_TYPES.LAYOUT_ITEM,
      vertexId: ctx.layoutVertex.id,
      vertexIds: [ctx.layoutVertex.id],
    }),
    onDrop: () => {
      scheduleDropStateCleanup(ctx);
    },
  });
}

export function attachTabDraggable(
  element: HTMLElement,
  ctx: TabDragContext,
): () => void {
  return draggable({
    element,
    getInitialData: () => ({
      type: PAGE_DESIGNER_DRAG_TYPES.TAB,
      openedFormId: ctx.openedFormId,
    }),
  });
}

function getTabDropOpenedFormId(source: { data: Record<string, unknown> }) {
  const openedFormId = source.data.openedFormId;
  return typeof openedFormId === "string" ? openedFormId : null;
}

function scheduleTabMove(
  ctx: TabPanelDropContext,
  source: { data: Record<string, unknown> },
) {
  const openedFormId = getTabDropOpenedFormId(source);
  if (!openedFormId) {
    return;
  }

  const { mainPanel: toPanelId, moveTab } = ctx;

  // Defer graph updates until pragmatic DnD finishes the drop gesture.
  queueMicrotask(() => {
    moveTab(toPanelId, openedFormId);
  });
}

export function attachTabPanelDropTarget(
  element: HTMLElement,
  ctx: TabPanelDropContext,
): () => void {
  return dropTargetForElements({
    element,
    canDrop: ({ source }) => source.data.type === PAGE_DESIGNER_DRAG_TYPES.TAB,
    onDrop: ({ location, source }) => {
      if (!isInnermostDropTarget(element, location)) {
        return;
      }

      scheduleTabMove(ctx, source);
    },
  });
}

export function attachTabDropTarget(
  element: HTMLElement,
  ctx: TabPanelDropContext,
): () => void {
  return dropTargetForElements({
    element,
    canDrop: ({ source }) => source.data.type === PAGE_DESIGNER_DRAG_TYPES.TAB,
    onDrop: ({ source }) => {
      scheduleTabMove(ctx, source);
    },
  });
}

export function attachTabDragDrop(
  element: HTMLElement,
  ctx: TabDragContext & TabPanelDropContext,
): () => void {
  return combine(
    attachTabDraggable(element, ctx),
    attachTabDropTarget(element, ctx),
  );
}
