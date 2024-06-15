import {
  type Accessor,
  batch,
  createMemo,
  createSelector,
  useContext,
} from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { useToast } from "~/components/Toast";
import {
  DraggedVertexContext,
  DragOverTargetIdContext,
  HoverIdContext,
  IndicatorPositionContext,
  SelectedCollContext,
  SelectedComponentContext,
  SelectedIdContext,
} from "~/lib/contexts";
import { deleteNestedLayout } from "../graph/mutate/deleteNestedLayout";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { getChildVertex, getParentVertex } from "../graph/get/sync/traverse";
import {
  componentDrop,

} from "~/lib/drag_drop/component_drop/componentDrop";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { validateDragOver } from "~/lib/drag_drop/validateDragOver";
import { getIndicatorPosition } from "~/lib/drag_drop/getIndicatorPosition";
import { loadPageData } from "~/lib/drag_drop/loadPageData";
import { handleDropAtPosition } from "~/lib/drag_drop/handleDropAtPosition";
import { PageDesignerLabels } from "./constant";
import {getComponentFromLayoutRow} from "~/lib/drag_drop/component_drop/getComponentFromLayoutRow";
import type { Setter } from "solid-js";

export function useDragDrop(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  formData: Vertex,
  layoutVertex: Vertex,
  collapsedKeys?: Accessor<Id[]>,
  isPreview?: boolean,
) {
  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [, setSelectedColl] = useContext(SelectedCollContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [, setDragOverTargetId] = useContext(DragOverTargetIdContext);
  const [selectedComponent, setSelectedComponent] = useContext(
    SelectedComponentContext,
  );
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [indicatorPosition, setIndicatorPosition] = useContext(
    IndicatorPositionContext,
  );
  const { showErrorToast, showSuccessToast } = useToast();

  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, layoutVertex),
  );

  const activeItemChanged = createSelector<any, Vertex>(
    indicatorPosition,
    (a, b) => a.id === b.activeItem,
  );
  const isActiveTargetItem = () => activeItemChanged(layoutVertex);

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    // setDraggedVertex(layoutVertex);
    setDraggedVertex((prev) => [...prev, layoutVertex]);
  };

  const handleDragOverAndSetDropPosition = (e: DragEvent) => {
    let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
      | "before"
      | "after"
      | "center"
      | "left"
      | "right"
      | null;
    if (!position) {
      setIndicatorPosition({ activeItem: null, position: null });
      setDragOverTargetId(-1);
      return;
    }

    let activeItem: Id;
    if (position === "before" || position === "left") {
      activeItem = layoutVertex.id;
    } else if (position === "after" || position === "right") {
      if (isPreview || collapsedKeys?.().includes(layoutVertex.id)) {
        // collapsed state
        activeItem = layoutVertex.id;
      } else {
        // expanded State
        if (children().length) {
          activeItem = children()[0].id;
          position = "before";
        } else {
          activeItem = layoutVertex.id;
        }
      }
    } else {
      // drop over
      activeItem = layoutVertex.id;
    }

    const fromVertex = draggedVertex()[0];
    const toVertexId = activeItem;
    if (
      !validateDragOver(
        graph,
        setGraph,
        fromVertex,
        toVertexId,
        formData,
        position,
      )
    ) {
      return;
    }
    setIndicatorPosition({ activeItem, position });
    setDragOverTargetId(layoutVertex.id);
  };

  const handleDragEnter = (e: DragEvent) => {
    // e.stopPropagation();
    handleDragOverAndSetDropPosition(e);
  };

  const handleDragOver = (e: DragEvent) => {
    // when dragOver more than 1 second, if it is layout and collapsed layout, expand it.
    e.stopPropagation();
    handleDragOverAndSetDropPosition(e);

    const position = indicatorPosition().position;
    if (!position) {
      // Don't allow drag and drop
      return;
    }

    for (const vertex of draggedVertex()) {
      const fromVertex = vertex;
      const toVertexId = indicatorPosition().activeItem!;
      if (!fromVertex) {
        // Don't allow drag and drop
        return;
      }

      if (
        !validateDragOver(
          graph,
          setGraph,
          fromVertex,
          toVertexId,
          formData,
          position,
        )
      ) {
        // Don't allow drag and drop
        return;
      }
    }

    // This is necessary to allow the drop action to proceed
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    // e.stopPropagation();
    setIndicatorPosition({ activeItem: null, position: null });
    // console.log('leave',layoutVertex.id)
    // Do not uncomment this, because drag is called before on drop
    // setDraggedVertex(null);
    // resetDragDropState();
  };

  const handleDrop = async (e: DragEvent) => {
    e.stopPropagation();
    for (const vertex of draggedVertex()) {
      const fromVertex = vertex;

      const toVertexId = indicatorPosition().activeItem!;
      const toVertex = graph.vertexes[toVertexId]; // layoutVertex;
      if (!fromVertex) {
        showErrorToast("from Vertex not found when dropping ");
        return;
      }

      if (PageDesignerLabels.includes(fromVertex.L[0])) {
        await loadPageData(graph, setGraph, fromVertex, showErrorToast);
      }

      const position = indicatorPosition().position;
      if (!position) {
        showErrorToast("Position not found when dropping");
        return;
      }
      // NOTE: Multiple selected dragged vertexes may not drop before or after as expected. test it.
      await handleDropAtPosition(
        graph,
        setGraph,
        txnId,
        formData,
        fromVertex,
        toVertex,
        position,
      );
    }

    resetDragDropState();
  };

  const clone = () => {
    let fromVertex = layoutVertex;
    const toVertex = layoutVertex;

    const position = "after";

    const toParentVertex = getParentVertex(["Attr"], toVertex, graph).vertex;

    function sortChildren() {
      let pos = 1;
      const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
      for (const child of childrenAttrs) {
        if (child.id === fromVertex?.id) {
          continue;
        }

        if (child.id === toVertex.id) {
          if (position === "after") {
            mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
            pos++;
            mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
              pos,
            });
            pos++;
          }
        } else {
          mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
          pos++;
        }
      }
    }

    const layoutRowId = componentDrop(
      txnId,
      fromVertex,
      toParentVertex || formData,
      graph,
      setGraph,
    );
    if (layoutRowId === -1) return;

    fromVertex = graph.vertexes[layoutRowId];

    sortChildren();
  };

  const onLayoutItemClick = (layoutVertex: Vertex) => {
    batch(() => {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });

      setSelectedId(layoutVertex.id);
      const collVertex = getChildVertex(
        graph,
        ["$0Coll"],
        graph.vertexes[layoutVertex?.id!],
      );
      setSelectedColl({ vertexId: collVertex?.vertex?.id || -1 });
      const componentVertex = getComponentFromLayoutRow(
        layoutVertex?.id!,
        graph,
        setGraph,
      );
      setSelectedComponent({ vertexId: componentVertex?.id || -1 });
    });
  };

  const deleteLayout = (name: string) => {
    deleteLayoutGlobal(selectedId, layoutVertex, setSelectedId, setSelectedComponent, setSelectedColl, hoverId, setHoverId, graph, setGraph, txnId, name, showSuccessToast);
  };

  function resetDragDropState() {
    batch(() => {
      setDraggedVertex([]);
      setIndicatorPosition({ activeItem: null, position: null });
      setDragOverTargetId(-1);
    });
  }

  return {
    children,
    isActiveTargetItem,
    handleDragStart,
    handleDragEnter,
    handleDragOverAndSetDropPosition,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clone,
    onLayoutItemClick,
    deleteLayout,
  };
}
export function deleteLayoutGlobal(selectedId: Accessor<string | number>, layoutVertex: Vertex, setSelectedId: Setter<Id | number>, setSelectedComponent: Setter<{ vertexId: Id | number }>, setSelectedColl: Setter<{ vertexId: Id | number }>, hoverId: Accessor<string | number>, setHoverId: Setter<Id | number>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, txnId: number, name: string, showSuccessToast: (message: string) => void) {
  batch(() => {
    if (selectedId() === layoutVertex.id) {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });
    }
    if (hoverId() === layoutVertex.id) {
      setHoverId(-1);
    }
  });

  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  if (name) {
    showSuccessToast(`${name} deleted successfully`);
  }
}

