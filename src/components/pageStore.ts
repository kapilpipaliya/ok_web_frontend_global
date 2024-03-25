import {Accessor, batch, createMemo, createSelector, createSignal} from "solid-js";
import {getNewGraphId, graph, Id, IdAttr, setGraph, Vertex} from "../lib/graph";
import {getChildVertex, getParentVertex, getSelectionOptions, Record} from "../lib/Utils";
import {findVertexByLabelAndUniqueId, mergeVertexProperties} from "../lib/Vertex";
import {setParentValue} from "./input/SelectInputField";
import {getCompProps, getRowProps} from "../lib/Record";
import {reconcile} from "solid-js/store";
import {componentDrag} from "./PageDesignerDragAndDrop";
import {evaluate} from "../lib/jsep";
import jsep from "jsep";

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

  return findVertexByLabelAndUniqueId("DataType", "name", "String");
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
    e.preventDefault();
    handleDragOverBase(e);
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
    } else if (
      position !== "center" &&
      fromParentVertex.vertex?.id === toParentVertex!.id
    ) {
      // Sort Children:
      sortChildren();

      ///sortChildren(childrenItems, record.txnId);
    } else {
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
  
  return {
    children, isActiveItem, handleDragStart, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, onLayoutItemClick
  }
}