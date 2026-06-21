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

import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function canDropPageDesignerSource(source: { data: Record<string, unknown> }) {
  return isPageDesignerDragSource(source.data.type);
}

function markUseCurrentPosition(element: HTMLElement) {
  // @ts-expect-error used by getIndicatorPosition
  element.useCurrentPosition = true;
}

function getLayoutStore(ctx: {
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
}) {
  return ctx.layoutStoreVertex();
}

function scheduleDropStateCleanup(
  ctx: {
    layoutStoreVertex: () => Vertex<PageLayoutObject>;
    graph: GraphInterface;
    setGraph: SetStoreFunction<GraphInterface>;
  },
) {
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
  const snapshot = createLayoutDropSnapshot(
    getLayoutStore(ctx),
    vertexIds,
  );
  if (!formStore || !snapshot) {
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
  layoutStoreId: Id;
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  openedFormId: Id;
}

export interface TabPanelDropContext {
  layoutStoreId: Id;
  layoutStoreVertex: () => Vertex<PageLayoutObject>;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  mainPanel: Id;
  moveTab: (toPanelId: Id) => void;
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
  updatePosition: (
    input: { clientX: number; clientY: number },
    sourceData: Record<string, unknown>,
  ) => void,
  onExpandChildren?: (dragPosition: string) => void,
) {
  let expandStartTime = 0;

  return dropTargetForElements({
    element,
    canDrop: ({ source }) => canDropPageDesignerSource(source),
    onDragEnter: ({ location, source }) => {
      cancelPendingDropPositionClear();
      ctx.onDragEnter?.();
      expandStartTime = Date.now();
      updatePosition(location.current.input, source.data);
    },
    onDrag: ({ location, source }) => {
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
    onDragLeave: () => {
      scheduleDropPositionClear(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
    },
    onDrop: ({ location, source }) => {
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
  };

  const updatePosition = createPositionUpdater(element, previewCtx);

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
    attachElementDropTarget(element, previewCtx, updatePosition, (dragPosition) =>
      ctx.onExpandChildren?.(dragPosition),
    ),
  );
}

export function attachPreviewDropTarget(
  element: HTMLElement,
  ctx: PreviewDropTargetContext,
): () => void {
  const updatePosition = createPositionUpdater(element, ctx);
  return attachElementDropTarget(element, ctx, updatePosition);
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
    onDragEnter: ({ source }) => {
      cancelPendingDropPositionClear();
      ctx.onDragEnter?.();
      setRootPosition();
    },
    onDragLeave: () => {
      scheduleDropPositionClear(getLayoutStore(ctx), ctx.graph, ctx.setGraph);
      ctx.onDragLeave?.();
    },
    onDrop: ({ source }) => {
      cancelPendingDropPositionClear();
      setRootPosition();
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
    onDragStart: () => {
      mergeVertexProperties<PageLayoutObject>(
        0,
        ctx.layoutStoreId,
        ctx.graph,
        ctx.setGraph,
        { draggedTab: ctx.openedFormId },
      );
    },
    onDrop: () => {
      mergeVertexProperties<PageLayoutObject>(
        0,
        ctx.layoutStoreId,
        ctx.graph,
        ctx.setGraph,
        { draggedTab: null },
      );
    },
  });
}

export function attachTabPanelDropTarget(
  element: HTMLElement,
  ctx: TabPanelDropContext,
): () => void {
  return dropTargetForElements({
    element,
    canDrop: ({ source }) => source.data.type === PAGE_DESIGNER_DRAG_TYPES.TAB,
    onDrop: () => {
      ctx.moveTab(ctx.mainPanel);
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
    onDrop: () => {
      ctx.moveTab(ctx.mainPanel);
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
