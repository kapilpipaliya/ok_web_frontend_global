import jsep from "jsep";
import {
  Accessor,
  batch,
  createMemo,
  createSelector,
  untrack,
  useContext,
} from "solid-js";
import { reconcile, SetStoreFunction, Store } from "solid-js/store";
import { useToast } from "~/components/custom/Toast";
import { setParentValue } from "~/components/dynamic/fields/input/SelectInputField";
import { setSelectionValue } from "~/components/dynamic/fields/static/SelectionUtils";
import {
  DraggedVertexContext,
  HoverIdContext,
  IndicatorPositionContext,
  PropertiesVertexIdContext,
  SelectedCollContext,
  SelectedComponentContext,
  SelectedIdContext,
  TargetIdContext,
} from "~/lib/contexts";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import {
  getCompProps,
  getRowProps,
  getStringComponent,
} from "~/lib/graph/get/sync/graph_functions";
import { deleteNestedLayout } from "./graph/mutate/deleteNestedLayout";
import { GraphInterface, Id, IdAttr, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { evaluate } from "~/lib/expression_eval";

import { cloneRowProps } from "./graph/mutate/form_functions";
import { getNewGraphId } from "./graph/transaction";
import {
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions,
} from "./graph/get/sync/traverse";
import { addNewRow } from "./graph/mutate/form_functions";
import { getFormMetaDataAsync } from "./graph/get/async/graph_functions";
import { getDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "./websocket/ws_events";
import { getEdgesFromRowsAttr } from "./Utils";

const addPropsToLayoutRow = (
  graph: Store<GraphInterface>,
  txnId: number,
  layoutRowId: Id,
  componentVertex: Vertex,
) => {
  const propVertexes = getChildVertexes(graph, ["$0Prop"], [componentVertex]);
  if (propVertexes.vertexes) {
    const initialValues = propVertexes.vertexes.reduce(
      (acc, curr) => {
        if (typeof curr.P.value === "boolean") {
          acc[curr.P.key] = curr.P.value;
        } else if (curr.P.value) {
          acc[curr.P.key] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    // TODO: This has no effect so commenting it.
    // replaceVertexProperties(txnId, layoutRowId, initialValues);
  }
};
// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrag(
  txnId: number,
  fromVertex: Vertex,
  parentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
) {
  const { showErrorToast } = useToast();

  // handle (toNode === null) case.
  if (fromVertex) {
    const attrMetaVertex = newVertex(getNewGraphId(), [], {
      name: "Attr",
      component: "Table",
      tab: "Attribute",
      props: {
        type: "Attr",
        label: "Attr",
      },
    });
    const attrCompMetaVertex = newVertex(getNewGraphId(), [], {
      name: "Comp",
      component: "SelectBox",
      props: {
        collection: "g:'Comp'",
      },
    });

    if (fromVertex.L[0] === "Page") {
      function processChildren(fromVertex: Vertex, toVertex: Vertex) {
        const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
        const results = [];
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            graph,
            setGraph,
            toVertex,
            { pos: child.P.pos },
            false,
            {} as any,
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(
            child.id,
            graph,
            setGraph,
          );
          // set Component to the row
          setSelectionValue(
            txnId,
            rowVertex2,
            graph,
            setGraph,
            attrCompMetaVertex,
            compVertex.id,
          );
          cloneRowProps(graph, setGraph, txnId, child, rowVertex2);
          processChildren(child, rowVertex2);
          results.push(rowResult2.vertexId!);
        }
        return results;
      }

      return processChildren(fromVertex, parentVertex)[0] ?? -1;
    }

    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      parentVertex,
      toIndex ? { pos: toIndex } : {},
      false,
      {} as any,
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
      if (fromVertex.L[0] === "Comp") {
        // set Component to the row
        setSelectionValue(
          txnId,
          rowVertex,
          graph,
          setGraph,
          attrCompMetaVertex,
          fromVertex.id,
        );
        addPropsToLayoutRow(graph, txnId, rowVertex.id, fromVertex);
      } else if (fromVertex.L[0] === "Coll") {
        // set Collection to the row
        const attrCollMetaVertex = newVertex(getNewGraphId(), [], {
          name: "coll",
          displayName: "Collection",
          component: "SelectBox",
          props: {
            collection: "g:'Coll'",
            parentLabel: "Coll",
          },
        });
        setSelectionValue(
          txnId,
          rowVertex,
          graph,
          setGraph,
          attrCollMetaVertex,
          fromVertex.id,
        );
        const formVertex = findVertexByLabelAndUniqueId(
          graph,
          "Comp",
          IdAttr,
          "Form",
        );
        if (!formVertex) {
          showErrorToast("cant find form");
        } else {
          setSelectionValue(
            txnId,
            rowVertex,
            graph,
            setGraph,
            attrCompMetaVertex,
            formVertex.id,
          );
          addPropsToLayoutRow(graph, txnId, rowVertex.id, formVertex);
        }
      }
    } else if (fromVertex.L[0] === "Attr") {
      const compVertex = getComponentFromLayoutRow(
        fromVertex.id,
        graph,
        setGraph,
      );
      // set Component to the row
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        compVertex.id,
      );
      cloneRowProps(graph, setGraph, txnId, fromVertex, rowVertex);

      function processChildren(fromVertex: Vertex, toVertex: Vertex) {
        const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            graph,
            setGraph,
            toVertex,
            { pos: child.P.pos },
            false,
            {} as any,
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(
            child.id,
            graph,
            setGraph,
          );
          // set Component to the row
          setSelectionValue(
            txnId,
            rowVertex2,
            graph,
            setGraph,
            attrCompMetaVertex,
            compVertex.id,
          );
          cloneRowProps(graph, setGraph, txnId, child, rowVertex2);
          processChildren(child, rowVertex2);
        }
      }

      processChildren(fromVertex, rowVertex);
    }

    return rowResult.vertexId!;
  }
  return -1;
}

const getComponentFromLayoutRow = (
  layoutRowId: string | number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) => {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex =
    getSelectionOptions(
      graph,
      setGraph,
      [currentVertex],
      "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default",
    ).vertexes || [];
  if (compVertex[0]) {
    return compVertex[0];
  }
  const collVertex = getChildVertex(graph, ["$0Coll"], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId(graph, "Comp", IdAttr, "Form");
  }

  return getStringComponent(graph);
};
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
  } else if (offset > height * 0.75) {
    return "after";
  } else {
    return "center";
  }
  // if (offset < (height + 10)) {
  //  return 'before';
  // } else if (offset > (height - 10)) {
  //  return 'after';
  // } else {
  //  return 'center';
  // }
}

function getChildrenAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  child: Vertex,
) {
  return (
    evaluate(jsep("->Attr"), { vertexes: [child], graph, setGraph }) || []
  ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
}

export function useDragDrop(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  formData: Vertex,
  vertex: Vertex,
  collapsedKeys?: Accessor<Id[]>,
  isPreview?: boolean,
) {
  const [hoverId, setHoverId] = useContext(HoverIdContext);
  const [selectedColl, setSelectedColl] = useContext(SelectedCollContext);
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
  const propertiesVertexId = useContext(PropertiesVertexIdContext);

  const children = createMemo(() => getChildrenAttrs(graph, setGraph, vertex));

  const activeItemChanged = createSelector<any, Vertex>(
    indicatorPosition,
    (a, b) => a.id === b.activeItem,
  );
  const isActiveItem = () => activeItemChanged(vertex);
  // indicatorPosition().activeItem === vertex.id;
  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    setDraggedVertex(vertex);
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
      activeItem = vertex.id;
    } else if (position === "after") {
      if (isPreview || (collapsedKeys && collapsedKeys().includes(vertex.id))) {
        // collapsed state
        activeItem = vertex.id;
      } else {
        // expanded State
        if (children().length) {
          activeItem = children()[0].id;
          position = "before";
        } else {
          activeItem = vertex.id;
        }
      }
    } else {
      // drop over
      activeItem = vertex.id;
    }

    setIndicatorPosition({ activeItem, position });
    setTargetId(vertex.id);
  };

  const handleDragEnter = (e: DragEvent) => {
    // e.stopPropagation();
    handleDragOverBase(e);
  };

  const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    handleDragOverBase(e);

    let fromVertex = draggedVertex();
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
      if (parentResult.vertex!.id === fromVertex.id) {
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

    console.log("drag over complete");
    // This is necessary to allow the drop action to proceed
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    // e.stopPropagation();
    // setIndicatorPosition({});
    // console.log('leave',vertex.id)
    // Do not uncomment this, because drag is called before on drop
    // setDraggedVertex(null);
  };

  const handleDrop = async (e: DragEvent) => {
    e.stopPropagation();

    let fromVertex = draggedVertex();

    const toVertexId = indicatorPosition().activeItem!;
    const toVertex = graph.vertexes[toVertexId]; // vertex;
    if (!fromVertex) {
      showErrorToast("from vertex not found");
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
      const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
      for (const child of childrenAttrs) {
        if (child.id === fromVertex!.id) {
          continue;
        }
        // const childIndex = child.P.pos;
        // if (childIndex === undefined) {
        //  alert ('childIndex Pos should not be undefined.');
        // }
        if (child.id === toVertex.id) {
          // childIndex === toIndex, childIndex may be undefined.
          if (position === "before") {
            mergeVertexProperties(txnId, fromVertex!.id, graph, setGraph, {
              pos,
            });
            pos++;
            mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
            pos++;
          } else if (position === "after") {
            mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
            pos++;
            mergeVertexProperties(txnId, fromVertex!.id, graph, setGraph, {
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
      fromParentVertex.vertex?.id === toParentVertex!.id
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
        mergeVertexProperties(txnId, fromVertex!.id, graph, setGraph, {
          pos: 9999999,
        }); // move to end
      } else {
        setParentValue(
          graph,
          setGraph,
          txnId,
          fromVertex,
          { P: { props: { type: "Attr" } } } as unknown as Vertex,
          toParentVertex!.id,
        );
      }

      // sort from parent's children
      // sort if required.
      // sort to parent's children
      sortChildren();
    }

    setDraggedVertex(null);

    // Handle drop action here
    setIndicatorPosition({ activeItem: null, position: null });
    setTargetId(-1);
  };

  const clone = () => {
    let fromVertex = vertex;
    const toVertex = vertex;

    const position = "after";

    const toParentVertex = getParentVertex(["Attr"], toVertex, graph).vertex;

    function sortChildren() {
      let pos = 1;
      const childrenAttrs = getChildrenAttrs(graph, setGraph, toParentVertex!);
      for (const child of childrenAttrs) {
        if (child.id === fromVertex!.id) {
          continue;
        }

        if (child.id === toVertex.id) {
          if (position === "after") {
            mergeVertexProperties(txnId, child.id, graph, setGraph, { pos });
            pos++;
            mergeVertexProperties(txnId, fromVertex!.id, graph, setGraph, {
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

      setSelectedId(vertex.id);
      const collVertex = getChildVertex(
        graph,
        ["$0Coll"],
        graph.vertexes[vertex!.id!],
      );
      setSelectedColl({ vertexId: collVertex?.vertex?.id || -1 });
      const componentVertex = getComponentFromLayoutRow(
        vertex!.id!,
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
          propertiesVertexId,
          reconcile({ P: layoutPropRow } as Vertex),
        );
      } else {
        setGraph(
          "vertexes",
          propertiesVertexId,
          reconcile({ P: {} } as Vertex),
        );
      }
    });
  };

  const deleteLayout = (name: string) => {
    batch(() => {
      if (selectedId() === vertex.id) {
        setSelectedId(-1);
        setSelectedComponent({ vertexId: -1 });
        setSelectedColl({ vertexId: -1 });
      }
      if (hoverId() === vertex.id) {
        setHoverId(-1);
      }
    });

    deleteNestedLayout(graph, setGraph, txnId, [vertex]);

    showSuccessToast(`${name} deleted Successfully`);
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
export function setPropertyValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  meta: Vertex,
  layoutVertex: Vertex,
  componentVertex: Vertex,
  value: any,
  valueSet?: boolean,
) {
  return untrack(() => {
    // find existing row;
    const rowProps =
      getChildVertexes(graph, ["$0Prop"], [layoutVertex]).vertexes || [];
    let row = rowProps.find((vertex) => {
      const name = getChildVertex(graph, ["$0Name"], vertex).vertex;
      return name?.P.name === meta.P.name;
    });
    if (row) {
      if (valueSet ?? true)
        mergeVertexProperties(txnId, row.id, graph, setGraph, { value });
    } else {
      const propMetaVertex = newVertex(0, ["Meta"], {
        name: "Prop",
        displayName: "Property",
      });
      const componentProps =
        getChildVertexes(graph, ["$0Prop"], [componentVertex]).vertexes || [];
      const componentProp = componentProps.find((vertex) => {
        return vertex.P.name === meta.P.name;
      });
      if (componentProp) {
        const properties = valueSet ?? true ? { value } : {};
        const addRowResult = addNewRow(
          txnId,
          propMetaVertex,
          graph,
          setGraph,
          layoutVertex,
          properties,
          false,
          {} as any,
        );
        if (addRowResult.vertexId) {
          row = graph.vertexes[addRowResult.vertexId];
          setSelectionValue(
            txnId,
            graph.vertexes[addRowResult.vertexId],
            graph,
            setGraph,
            { P: { name: "Name" } } as unknown as Vertex,
            componentProp.id,
          );
        }
      } else {
        console.error(
          `component prop ${meta.P.name} is not found in component ${componentVertex.P.name}. so skipped inserting property.`,
        );
      }
    }
    // TODO: if reset, delete the row.
    return row;
  });
}
