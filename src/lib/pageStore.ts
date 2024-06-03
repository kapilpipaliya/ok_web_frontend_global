import {type Accessor, batch, createMemo, createSelector, useContext,} from "solid-js";
import {reconcile, type SetStoreFunction, type Store} from "solid-js/store";
import {useToast} from "~/components/custom/Toast";
import {setParentValue} from "~/components/dynamic/fields/input/SelectInputField";
import {
  DraggedVertexContext,
  HoverIdContext,
  IndicatorPositionContext,
  LoadingContext,
  PropertiesVertexIdContext,
  SelectedCollContext,
  SelectedComponentContext,
  SelectedIdContext,
  TargetIdContext,
} from "~/lib/contexts";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";
import {getCompProps, getRowProps,} from "~/lib/graph/get/sync/graph_functions";
import {deleteNestedLayout} from "./graph/mutate/deleteNestedLayout";
import {type GraphInterface, type Id, IdAttr, type Vertex,} from "~/lib/graph/graph";
import {mergeVertexProperties} from "~/lib/graph/mutate/vertex";
import {getChildVertex, getParentVertex,} from "./graph/get/sync/traverse";
import {getFormMetaDataAsync} from "./graph/get/async/graph_functions";
import {getDataMGCall} from "~/cypher_api/lib/graph/get/async/traverse";
import {setGraphData} from "./websocket/ws_events";
import {getEdgesFromRowsAttr,} from "./Utils";
import {componentDrag, getComponentFromLayoutRow} from "~/lib/drag-drop/componentDrag";
import {getChildrenAttrs} from "~/lib/drag-drop/getChildrenAttrs";

export function getIndicatorPosition(e: MouseEvent, node: HTMLElement) {
  let bounds: DOMRect;
  if (node.classList.contains("contents")) {
    if (node.lastElementChild) {
      bounds = node.lastElementChild.getBoundingClientRect();
    } else {
      return undefined;
    }
  } else {
    bounds = node.getBoundingClientRect();
  }
  const offset = e.clientY - bounds.top;
  const height = bounds.bottom - bounds.top;
  if (offset < height * 0.25) {
    return "before";
  }
  if (offset > height * 0.75) {
    return "after";
  }
  return "center";
  // if (offset < (height + 10)) {
  //  return 'before';
  // } else if (offset > (height - 10)) {
  //  return 'after';
  // } else {
  //  return 'center';
  // }
}

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
  const [selectedColl, setSelectedColl] = useContext(SelectedCollContext);
  const [loadingSite, setLoadingSite] = useContext(LoadingContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [targetId, setTargetId] = useContext(TargetIdContext);
  const [selectedComponent, setSelectedComponent] = useContext(
    SelectedComponentContext,
  );
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [indicatorPosition, setIndicatorPosition] = useContext(
    IndicatorPositionContext,
  );
  const { showErrorToast, showSuccessToast } = useToast();
  const [propertiesVertexId, _] = useContext(PropertiesVertexIdContext);

  const children = createMemo(() => getChildrenAttrs(graph, setGraph, layoutVertex));

  const activeItemChanged = createSelector<any, Vertex>(
    indicatorPosition,
    (a, b) => a.id === b.activeItem,
  );
  const isActiveItem = () => activeItemChanged(layoutVertex);
  // indicatorPosition().activeItem === layoutVertex.id;
  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    // setDraggedVertex(layoutVertex);
    setDraggedVertex((prev) => [...prev, layoutVertex]);
  };

  const handleDragOverBase = (e: DragEvent) => {
    let position = getIndicatorPosition(e, e.currentTarget as HTMLElement) as
      | "before"
      | "after"
      | "center"
      | null;
    if (!position) {
      setIndicatorPosition({ activeItem: null, position: null });
      setTargetId(-1);
      return;
    }

    let activeItem: Id;
    if (position === "before") {
      activeItem = layoutVertex.id;
    } else if (position === "after") {
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

    setIndicatorPosition({ activeItem, position });
    setTargetId(layoutVertex.id);
  };

  const handleDragEnter = (e: DragEvent) => {
    // e.stopPropagation();
    handleDragOverBase(e);
  };

  const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    handleDragOverBase(e);

    for (const vertex of draggedVertex()) {
      const fromVertex = vertex;
      const toVertexId = indicatorPosition().activeItem!;
      if (!fromVertex) {
        // Don't allow drag and drop
        return;
      }
      const fromVertexLabel = fromVertex.L[0];
      const position = indicatorPosition().position;
      if (!position) {
        // Don't allow drag and drop
        showErrorToast("Position not found when dropping");
        return;
      }
      // Don't allow parent to move inside children.
      let parentVertex = graph.vertexes[toVertexId];
      while (true) {
        const parentResult = getParentVertex(["Attr"], parentVertex, graph);
        if (parentResult.error) {
          break;
        }
        if (parentResult.vertex?.id === fromVertex.id) {
          // Don't allow drag and drop
          return;
        }
        parentVertex = parentResult.vertex!;
      }

      if (position === "center") {
        // is Top Layer:
        if (toVertexId === formData.id) {
          // Allow drag over it
        } else {
          const compVertex = getComponentFromLayoutRow(
            toVertexId,
            graph,
            setGraph,
          );
          if (!compVertex?.P.child) {
            // Don't allow drag and drop
            return;
          }
        }
      }
    }

    console.log("drag over complete");
    // This is necessary to allow the drop action to proceed
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    // e.stopPropagation();
    // setIndicatorPosition({});
    // console.log('leave',layoutVertex.id)
    // Do not uncomment this, because drag is called before on drop
    // setDraggedVertex(null);
  };

  const handleDrop = async (e: DragEvent) => {
    e.stopPropagation();
    setLoadingSite(true);
    //new Promise((resolve) => setTimeout(resolve, 2000));
    for (const vertex of draggedVertex()) {
      let fromVertex = vertex;

      const toVertexId = indicatorPosition().activeItem!;
      const toVertex = graph.vertexes[toVertexId]; // layoutVertex;
      if (!fromVertex) {
        showErrorToast("from Vertex not found when dropping ");
        return;
      }
      const fromVertexLabel = fromVertex.L[0];

      // When Page is dropped, fetch its layout and add to the current place
      if (fromVertexLabel === "Page") {
        const form: any = await getFormMetaDataAsync(
          graph,
          setGraph,
          fromVertexLabel,
        );
        if (form.error) {
          showErrorToast(form.error);
          return;
        }
        const { incoming, outgoing }: { incoming: any; outgoing: any } =
          getEdgesFromRowsAttr(form.form.attributes);
        const result = await getDataMGCall({
          expression: `id:'${fromVertex.id}'`,
          incoming,
          outgoing,
        });

        if (result.error) {
          showErrorToast(result.error);
          return;
        }

        setGraphData(graph, setGraph, result.graph);
      }

      const position = indicatorPosition().position;
      if (!position) {
        showErrorToast("Position not found when dropping");
        return;
      }

      const fromParentVertex = getParentVertex(["Attr"], fromVertex, graph);
      const toParentVertex =
        position === "center"
          ? toVertex
          : getParentVertex(["Attr"], toVertex, graph).vertex;

      // is Top Layer:
      if (position === "center" && toVertexId === formData.id) {
        // Allow drag over it
      } else if (!toParentVertex) {
        // Dont allow drag before and after first element
        return;
      }

      // const fromIndex = fromVertex.P.pos as number;
      // const toIndex = toVertex.P.pos as number;
      // if (fromIndex === undefined || toIndex === undefined) {
      //  alert('from and to index should have position set')
      //  return;
      // }
      function sortChildren() {
        let pos = 1;
        const childrenAttrs = getChildrenAttrs(
          graph,
          setGraph,
          toParentVertex!,
        );
        for (const child of childrenAttrs) {
          if (child.id === fromVertex?.id) {
            continue;
          }
          // const childIndex = child.P.pos;
          // if (childIndex === undefined) {
          //  alert ('childIndex Pos should not be undefined.');
          // }
          if (child.id === toVertex.id) {
            // childIndex === toIndex, childIndex may be undefined.
            if (position === "before") {
              mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
                pos,
              });
              pos++;
              mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
              pos++;
            } else if (position === "after") {
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

      if (position === "center") {
        // is Top Layer:
        if (toVertexId === formData.id) {
          // Allow drag over it
        } else {
          const compVertex = getComponentFromLayoutRow(
            toVertexId,
            graph,
            setGraph,
          );
          if (!compVertex?.P.child) {
            return;
          }
        }
      }

      if (fromVertexLabel === "Comp") {
        // when component is input add label
        const labelParentVertex = getParentVertex(
          ["CompCategory$0"],
          fromVertex,
          graph,
        );
        if (
          labelParentVertex?.vertex?.P.name === "Form" ||
          labelParentVertex?.vertex?.P.name === "Join"
        ) {
          const labelVertex = findVertexByLabelAndUniqueId(
            graph,
            "Comp",
            IdAttr,
            "Label",
          );
          const rowId = componentDrag(
            txnId,
            labelVertex!,
            toParentVertex || formData,
            graph,
            setGraph,
          );
          if (rowId === -1) return;

          const rowId2 = componentDrag(
            txnId,
            fromVertex,
            graph.vertexes[rowId] || formData,
            graph,
            setGraph,
          );
          if (rowId2 === -1) return;

          fromVertex = graph.vertexes[rowId];

          sortChildren();
        } else {
          const rowId = componentDrag(
            txnId,
            fromVertex,
            toParentVertex || formData,
            graph,
            setGraph,
          );
          if (rowId === -1) return;

          fromVertex = graph.vertexes[rowId];

          sortChildren();
        }
      } else if (fromVertexLabel === "Page") {
        const rowId = componentDrag(
          txnId,
          fromVertex,
          toParentVertex || formData,
          graph,
          setGraph,
        );
        if (rowId === -1) return;

        fromVertex = graph.vertexes[rowId];

        sortChildren();
      } else if (
        position !== "center" &&
        fromParentVertex.vertex?.id === toParentVertex?.id
      ) {
        // Sort Children:
        sortChildren();

        ///sortChildren(childrenItems, record.txnId);
      } else {
        console.log("when this case is run?");
        // remove previous incoming edge if present.
        if (fromParentVertex.vertex) {
          setParentValue(graph, setGraph, txnId, fromVertex, {
            P: { props: { type: "Attr" } },
          } as unknown as Vertex);
        }
        // add new edge.
        if (position === "center") {
          setParentValue(
            graph,
            setGraph,
            txnId,
            fromVertex,
            { P: { props: { type: "Attr" } } } as unknown as Vertex,
            toVertexId,
          );
          mergeVertexProperties(txnId, fromVertex?.id, graph, setGraph, {
            pos: 9999999,
          }); // move to end
        } else {
          setParentValue(
            graph,
            setGraph,
            txnId,
            fromVertex,
            { P: { props: { type: "Attr" } } } as unknown as Vertex,
            toParentVertex?.id,
          );
        }

        // sort from parent's children
        // sort if required.
        // sort to parent's children
        sortChildren();
      }
    }

    // setDraggedVertex(null);
    setDraggedVertex([]);

    // Handle drop action here
    setIndicatorPosition({ activeItem: null, position: null });
    setTargetId(-1);
    setLoadingSite(false);
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

    const rowId = componentDrag(
      txnId,
      fromVertex,
      toParentVertex || formData,
      graph,
      setGraph,
    );
    if (rowId === -1) return;

    fromVertex = graph.vertexes[rowId];

    sortChildren();
  };

  const onLayoutItemClick = () => {
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

      if (
        selectedId() !== -1 &&
        selectedComponent() &&
        selectedComponent().vertexId !== -1
      ) {
        const componentProps = getCompProps(
          graph,
          graph.vertexes[selectedComponent().vertexId],
        );
        const layoutPropRows = getRowProps(
          graph,
          setGraph,
          graph.vertexes[selectedId()],
        );
        const layoutPropRow = Object.assign(componentProps, layoutPropRows);
        // set existing layout props
        setGraph(
          "vertexes",
          propertiesVertexId(),
          reconcile({ P: layoutPropRow } as Vertex),
        );
      } else {
        setGraph(
          "vertexes",
          propertiesVertexId(),
          reconcile({ P: {} } as Vertex),
        );
      }
    });
  };

  const deleteLayout = (name: string) => {
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
  };

  return {
    children,
    isActiveItem,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clone,
    onLayoutItemClick,
    deleteLayout,
  };
}
