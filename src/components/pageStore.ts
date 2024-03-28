import {Accessor, batch, createMemo, createSelector, createSignal} from "solid-js";
import {getNewGraphId, graph, Id, IdAttr, setGraph, Vertex} from "../lib/graph";
import {addNewRow, getChildVertex, getChildVertexes, getParentVertex, getSelectionOptions, Record} from "../lib/Utils";
import {findVertexByLabelAndUniqueId, mergeVertexProperties, newVertex, replaceVertexProperties} from "../lib/Vertex";
import {setParentValue} from "./input/SelectInputField";
import {cloneRowProps, getCompProps, getRowProps, getStringComponent} from "../lib/Record";
import {reconcile} from "solid-js/store";
import {evaluate} from "../lib/jsep";
import jsep from "jsep";
import {setSelectionValue} from "./input/SelectionUtils";
import {deleteNestedLayout} from "../lib/Traverse";
import {toast} from "solid-toast";
import {useToast} from "./Toast/toast";

export const [selectedColl, setSelectedColl] = createSignal({ vertexId: -1 });

export const [hoverId, setHoverId] = createSignal<Id>(-1);
export const [selectedId, setSelectedId] = createSignal<Id>(-1);
export const [targetId, setTargetId] = createSignal<Id>(-1);
export const [hiddenNodes, setHiddenNodes] = createSignal([] as Id[]);

export const [selectedComponent, setSelectedComponent] = createSignal({
  vertexId: -1,
});
export const [draggedVertex, setDraggedVertex] = createSignal<Vertex | null>(null);

export const [indicatorPosition, setIndicatorPosition] = createSignal({
  activeItem: null as null | Id,
  position: null as "before" | "after" | "center" | null,
});
export const propertiesVertexId = getNewGraphId();


const addPropsToLayoutRow = (
  txnId: number,
  layoutRowId: Id,
  componentVertex: Vertex
) => {
  const propVertexes = getChildVertexes(["$0Prop"], [componentVertex]);
  if (propVertexes.vertexes) {
    const initialValues = propVertexes.vertexes.reduce((acc, curr) => {
      if (typeof curr.P.value === "boolean") {
        acc[curr.P.key] = curr.P.value;
      } else if (curr.P.value) {
        acc[curr.P.key] = curr.P.value;
      }
      return acc;
    }, {} as { [key: string]: any });
    // TODO: This has no effect so commenting it.
    // replaceVertexProperties(txnId, layoutRowId, initialValues);
  }
};
// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export const componentDrag = (
  txnId: number,
  fromVertex: Vertex,
  parentVertex: Vertex,
  toIndex?: number
) => {
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
        const childrenVertexes = getChildrenAttrs(fromVertex);
        const results = [];
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            toVertex,
            {pos: child.P.pos},
            false,
            {} as any
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(child.id);
          // set Component to the row
          setSelectionValue(txnId, rowVertex2, attrCompMetaVertex, compVertex.id);
          cloneRowProps(txnId, child, rowVertex2);
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
      parentVertex,
      toIndex ? {pos: toIndex} : {},
      false,
      {} as any
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];


    if (fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
      if (fromVertex.L[0] === "Comp") {
        // set Component to the row
        setSelectionValue(txnId, rowVertex, attrCompMetaVertex, fromVertex.id);
        addPropsToLayoutRow(txnId, rowVertex.id, fromVertex);
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
        setSelectionValue(txnId, rowVertex, attrCollMetaVertex, fromVertex.id);
        const formVertex = findVertexByLabelAndUniqueId("Comp", IdAttr, "Form");
        if (!formVertex) {
          alert("cant find form");
        } else {
          setSelectionValue(
            txnId,
            rowVertex,
            attrCompMetaVertex,
            formVertex.id
          );
          addPropsToLayoutRow(txnId, rowVertex.id, formVertex);
        }
      }
    } else if (fromVertex.L[0] === "Attr") {
      const compVertex = getComponentFromLayoutRow(fromVertex.id);
      // set Component to the row
      setSelectionValue(txnId, rowVertex, attrCompMetaVertex, compVertex.id);
      cloneRowProps(txnId, fromVertex, rowVertex);

      function processChildren(fromVertex: Vertex, toVertex: Vertex) {
        const childrenVertexes = getChildrenAttrs(fromVertex);
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            toVertex,
            {pos: child.P.pos},
            false,
            {} as any
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(child.id);
          // set Component to the row
          setSelectionValue(txnId, rowVertex2, attrCompMetaVertex, compVertex.id);
          cloneRowProps(txnId, child, rowVertex2);
          processChildren(child, rowVertex2);
        }
      }
      processChildren(fromVertex, rowVertex);
    }

    return rowResult.vertexId!;
  }
  return -1;
};

const getComponentFromLayoutRow = (layoutRowId: string | number) => {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex =
    getSelectionOptions(
      [currentVertex],
      "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default"
    ).vertexes || [];
  if (compVertex[0]) {
    return compVertex[0];
  }
  const collVertex = getChildVertex(["$0Coll"], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId("Comp", IdAttr, "Form");
  }

  return getStringComponent();
};
export const getIndicatorPosition = (e: MouseEvent, node: HTMLElement) => {
  let bounds: DOMRect;
  if (node.classList.contains('contents')) {
    bounds = node.lastElementChild!.getBoundingClientRect();
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
};
function getChildrenAttrs(child: Vertex) {
  return (evaluate(jsep("->Attr"), { vertexes: [child] }) || []).sort(
    (a: Vertex, b: Vertex) => a.P.pos - b.P.pos
  );
}

export const useDragDrop = (record: Record, vertex: Vertex, collapsedKeys: Accessor<Id[]>, isPreview?: boolean) => {
  const {
    showSuccessToast
  } = useToast();
  const children = createMemo(() => getChildrenAttrs(vertex));

  const activeItemChanged = createSelector<any, Vertex>(indicatorPosition, (a,b) => a.id === b.activeItem)
  const isActiveItem = () => activeItemChanged(vertex);
    // indicatorPosition().activeItem === vertex.id;

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    setDraggedVertex(vertex);
  };

  const handleDragOverBase = (e: DragEvent) => {
    let position = getIndicatorPosition(e, e.currentTarget as HTMLElement);

    let activeItem: Id;
    if (position === "before") {
      activeItem = vertex.id;
    } else if (position === "after") {
      if (isPreview || collapsedKeys().includes(vertex.id)) {
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

    // Don't allow parent to move inside children.
    let parentVertex = graph.vertexes[toVertexId];
    while(true) {
      const parentResult = getParentVertex(['Attr'], parentVertex);
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
      const compVertex = getComponentFromLayoutRow(toVertexId);
      if (!compVertex?.P.child) {
        // Don't allow drag and drop
        return;
      }
    }

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

  const handleDrop = (e: DragEvent) => {
    e.stopPropagation();

    let fromVertex = draggedVertex();
    const toVertexId = indicatorPosition().activeItem!;
    const toVertex = graph.vertexes[toVertexId]; // vertex;
    if (!fromVertex) {
      alert("from vertex not found");
      return;
    }
    const fromVertexLabel = fromVertex.L[0];
    const txnId = record.txnId;
    const position = indicatorPosition().position;

    const fromParentVertex = getParentVertex(["Attr"], fromVertex);
    const toParentVertex =
      position === "center"
        ? toVertex
        : getParentVertex(["Attr"], toVertex).vertex;

    // const fromIndex = fromVertex.P.pos as number;
    // const toIndex = toVertex.P.pos as number;
    // if (fromIndex === undefined || toIndex === undefined) {
    //  alert('from and to index should have position set')
    //  return;
    // }

    function sortChildren() {
      let pos = 1;
      const childrenAttrs = getChildrenAttrs(toParentVertex!);
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
            mergeVertexProperties(txnId, fromVertex!.id, { pos });
            pos++;
            mergeVertexProperties(txnId, child.id, { pos });
            pos++;
          } else if (position === "after") {
            mergeVertexProperties(txnId, child.id, { pos });
            pos++;
            mergeVertexProperties(txnId, fromVertex!.id, { pos });
            pos++;
          }
        } else {
          mergeVertexProperties(txnId, child.id, { pos });
          pos++;
        }
      }
    }

    if (fromVertexLabel === "Comp") {
      if (position === "center") {
        const compVertex = getComponentFromLayoutRow(toVertexId);
        if (!compVertex?.P.child) {
          return;
        }
      }

      const parentVertex =
        position !== "center"
          ? getParentVertex(["Attr"], toVertex).vertex!
          : toVertex;

      const rowId = componentDrag(
        record.txnId,
        fromVertex,
        parentVertex || record.vertex
      );
      if (rowId === -1) return;

      fromVertex = graph.vertexes[rowId];

      sortChildren();
    } else if (fromVertexLabel === "Page") {
      if (position === "center") {
        const compVertex = getComponentFromLayoutRow(toVertexId);
        if (!compVertex?.P.child) {
          return;
        }
      }

      const parentVertex =
        position !== "center"
          ? getParentVertex(["Attr"], toVertex).vertex!
          : toVertex;

      const rowId = componentDrag(
        record.txnId,
        fromVertex,
        parentVertex || record.vertex
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
      if (position === "center") {
        const compVertex = getComponentFromLayoutRow(toVertexId);
        if (!compVertex?.P.child) {
          return;
        }
      }

      // remove previous incoming edge if present.
      if (fromParentVertex.vertex) {
        setParentValue(record.txnId, fromVertex, {
          P: { props: { type: "Attr" } },
        } as unknown as Vertex);
      }
      // add new edge.
      if (position === "center") {
        setParentValue(
          record.txnId,
          fromVertex,
          { P: { props: { type: "Attr" } } } as unknown as Vertex,
          toVertexId
        );
        mergeVertexProperties(txnId, fromVertex!.id, { pos: 9999999 }); // move to end
      } else {
        setParentValue(
          record.txnId,
          fromVertex,
          { P: { props: { type: "Attr" } } } as unknown as Vertex,
          toParentVertex!.id
        );
      }

      // sort from parent's children
      // sort if required.

      // sort to parent's children
      sortChildren();
    }

    setDraggedVertex(null);

    // Handle drop action here
    setIndicatorPosition({});
    setTargetId(undefined);
  };

  const clone = () => {
    let fromVertex = vertex;
    const toVertex = vertex;

    const txnId = record.txnId;
    const position = "after";

    const toParentVertex = getParentVertex(["Attr"], toVertex).vertex;

    function sortChildren() {
      let pos = 1;
      const childrenAttrs = getChildrenAttrs(toParentVertex!);
      for (const child of childrenAttrs) {
        if (child.id === fromVertex!.id) {
          continue;
        }

        if (child.id === toVertex.id) {
          if (position === "after") {
            mergeVertexProperties(txnId, child.id, { pos });
            pos++;
            mergeVertexProperties(txnId, fromVertex!.id, { pos });
            pos++;
          }
        } else {
          mergeVertexProperties(txnId, child.id, { pos });
          pos++;
        }
      }
    }


      const rowId = componentDrag(
        record.txnId,
        fromVertex,
        toParentVertex || record.vertex
      );
      if (rowId === -1) return;

      fromVertex = graph.vertexes[rowId];

      sortChildren();
  }

  const onLayoutItemClick = () => {
    batch(() => {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });

      setSelectedId(vertex.id);
      const collVertex = getChildVertex(
        ["$0Coll"],
        graph.vertexes[vertex!.id!]
      );
      setSelectedColl({ vertexId: collVertex?.vertex?.id || -1 });
      const componentVertex = getComponentFromLayoutRow(vertex!.id!);
      setSelectedComponent({ vertexId: componentVertex?.id || -1 });

      if (
        selectedId() !== -1 &&
        selectedComponent() &&
        selectedComponent().vertexId !== -1
      ) {
        const componentProps = getCompProps(
          graph.vertexes[selectedComponent().vertexId]
        );
        const layoutPropRows = getRowProps(graph.vertexes[selectedId()]);
        const layoutPropRow = Object.assign(componentProps, layoutPropRows);
        // set existing layout props
        setGraph(
          "vertexes",
          propertiesVertexId,
          "P",
          reconcile(layoutPropRow)
        );
      } else {
        setGraph("vertexes", propertiesVertexId, "P", reconcile({}));
      }
    });
  };

  const deleteLayout = (name) => {
      batch(() => {
        if (selectedId() === vertex.id) {
          setSelectedId(-1);
          setSelectedComponent({vertexId: -1});
          setSelectedColl({vertexId: -1});
        }
        if (hoverId() === vertex.id) {
          setHoverId(-1);
        }
      });

      deleteNestedLayout(record.txnId, [vertex]);

    showSuccessToast(`${name} deleted Successfully`)
  };

  
  return {
    children, isActiveItem, handleDragStart, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, clone, onLayoutItemClick, deleteLayout
  }
}
export const setPropertyValueGlobal = (
  txnId: number,
  meta: Vertex,
  layoutVertex: Vertex,
  componentVertex: Vertex,
  value: any,
  valueSet?: boolean
) => {
  // find existing row;
  const rowProps = getChildVertexes(["$0Prop"], [layoutVertex]).vertexes || [];
  let row = rowProps.find((vertex) => {
    const name = getChildVertex(["$0Name"], vertex).vertex;
    return name?.P.name === meta.P.name;
  });
  if (row) {
    if (valueSet ?? true) mergeVertexProperties(txnId, row.id, {value});
  } else {
    const propMetaVertex = newVertex(0, ["Meta"], {
      name: "Prop",
      displayName: "Property",
    });
    const componentProps =
      getChildVertexes(["$0Prop"], [componentVertex]).vertexes || [];
    const componentProp = componentProps.find((vertex) => {
      return vertex.P.name === meta.P.name;
    });
    if (componentProp) {
      const properties = valueSet ?? true ? {value} : {};
      const addRowResult = addNewRow(
        txnId,
        propMetaVertex,
        layoutVertex,
        properties,
        false,
        {} as any
      );
      if (addRowResult.vertexId) {
        row = graph.vertexes[addRowResult.vertexId];
        setSelectionValue(
          txnId,
          graph.vertexes[addRowResult.vertexId],
          {P: {name: "Name"}} as unknown as Vertex,
          componentProp.id
        );
      }
    } else {
      console.error(
        `component prop ${meta.P.name} is not found in component ${componentVertex.P.name}. so skipped inserting property.`
      );
    }
  }
  // TODO: if reset, delete the row.

  return row;
};