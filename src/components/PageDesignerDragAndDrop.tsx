// TODO: make multiple Fields Drag and Drop once.
import { useParams } from "@solidjs/router";
import { createStore, reconcile } from "solid-js/store";
import {
 addMetaVertexes,
 deleteRow, FieldAttribute,
 getCompProps,
 getRowProps,
 PageContext,
 Record, setValueGlobal
} from "../lib/Record";
import {
 batch,
 createEffect,
 createSignal,
 on, onCleanup,
 onMount,
 Show,
 useContext
} from "solid-js";
import { GenericField, PageItemRender } from "./input/GenaricField";
import TreeView, {
 Item as dxTreeViewItem,
 Node
} from "devextreme/ui/tree_view";
import dxSortable, { DragEndEvent } from "devextreme/ui/sortable";
import {
 getChildVertex,
 getChildVertexes,
 getParentVertex, getSelectionOptions,
 getTreeData
} from "../lib/Traverse";
import {
 getNewGraphId,
 getNewTxnId,
 graph, Id,
 IdAttr, revertTransaction, revertTransactionUpTo,
 setGraph, transactions,
 Vertex
} from "../lib/graph";
import dxDraggable from "devextreme/ui/draggable";
import {
 AbstractSingleForm,
 FormGroup,
 FormGroupProperties
} from "./DynamicForm";
import { setParentValue, setSelectionValue } from "./input/SelectInputField";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId,
 mergeVertexProperties,
 newVertex, replaceVertexProperties
} from "../lib/Vertex";
import { WsContext } from "../utils/ws_events_dispatcher";
import { Portal } from "solid-js/web";
import {
 Button,
 ModalBody,
 ModalContent,
 ModalFooter,
 ModalHeader
} from "solid-blocks";
import { TableInputField } from "./input/TableInputField";
import { AttrsTableData } from "./api";

function sortChildren(childrenItems: dxTreeViewItem[], txnId: number) {
 if (!childrenItems) return;
 for (let i = 0; i < childrenItems.length; i++) {
  const child = childrenItems[i];
  mergeVertexProperties(txnId, child.id! as number, { pos: i + 1 });
 }
}

export const PageDesignerDragAndDrop = () => {
 const itemsExpr = "children";
 const params = useParams();
 const pageConfig = createStore({} as { record: Record });
 const [count, setCount] = createSignal(1);
 const { Ws } = useContext(WsContext);
 const [selectedLayout, setSelectedLayout] = createSignal({vertexId: -1, itemIndex: -1} as {vertexId: number, itemIndex?: number});
 const [selectedComponent, setSelectedComponent] = createSignal({vertexId: -1});
 const [selectedColl, setSelectedColl] = createSignal({vertexId: -1});
 const rerender = () => {
  setCount(prev => prev + 1);
 };

 const addPropsToLayoutRow = (txnId: number, layoutRowId: Id, componentVertex: Vertex) => {
  const propVertexes =  getChildVertexes(['$0Prop'], [componentVertex]);
  if (propVertexes.vertexes) {
   const initialValues = propVertexes.vertexes.reduce((acc, curr) => {
    if (typeof curr.P.value === "boolean") {
     acc[curr.P.key] = curr.P.value;
    } else if (curr.P.value) {
     acc[curr.P.key] = curr.P.value;
    }
    return acc;
   }, {} as {[key: string]: any});
   replaceVertexProperties(txnId, layoutRowId, initialValues);
  }
 }
 // @Note:
 // From Component To Layout drag:
 // 1. Create a Row to proper parent.
 // 2. Sort properly
 const componentDrag = (fromVertex: Vertex, index: number, parentVertex?: Vertex, childrenItems: dxTreeViewItem[]) => {
  // handle (toNode === null) case.
  if (fromVertex) {
   parentVertex = parentVertex || pageConfig[0].record.vertex;
   const attrMetaVertex =      newVertex(getNewTxnId(), [],{
    name: "Attr",
    component: "Table",
    tab: "Attribute",
    props: {
     type: 'Attr',
     label: "Attr",
    },
   });
   const rowResult = pageConfig[0].record.addNewRowUI(attrMetaVertex, parentVertex, {pos: index});
   const rowVertex = graph.vertexes[rowResult.vertexId!];

   if(fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
    const attrCompMetaVertex = newVertex(getNewTxnId(), [],{
     name: "Comp",
     component: "SelectBox",
     props: {
      collection: "Comp",
     },
    });

    if (fromVertex.L[0] === "Comp") {
     // set Component to the row
     setSelectionValue(pageConfig[0].record.txnId, rowVertex, attrCompMetaVertex, fromVertex.id);
     addPropsToLayoutRow(pageConfig[0].record.txnId, rowVertex.id, fromVertex);
    } else if (fromVertex.L[0] === "Coll") {
     // set Collection to the row
     const attrCollMetaVertex = newVertex(getNewTxnId(), [], {
      name: "coll",
      displayName: "Collection",
      component: "SelectBox",
      props: {
       collection: "Coll",
       parentLabel: "Coll",
      },
     });
     setSelectionValue(pageConfig[0].record.txnId, rowVertex, attrCollMetaVertex, fromVertex.id);
     const formVertex = findVertexByLabelAndUniqueId('Comp', IdAttr, "Form");
     if (!formVertex) {
      alert('cant find form');
     } else {
      setSelectionValue(pageConfig[0].record.txnId, rowVertex, attrCompMetaVertex, formVertex.id);
      addPropsToLayoutRow(pageConfig[0].record.txnId, rowVertex.id, formVertex);
     }
    }
   } else if (fromVertex.L[0] === "Attr") {
    // set Collection Attribute to the row
    const attMetaVertex = newVertex(getNewTxnId(), [], {
     name: "Att",
     displayName: "Attribute",
     component: "SelectBox",
     props: {
      displayExpr: "$P.displayName ($P.name)",
      collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
     }
    });
    setSelectionValue(pageConfig[0].record.txnId, rowVertex, attMetaVertex, fromVertex.id);
    // TODO add comp prop default values
    // addPropsToLayoutRow(pageConfig[0].record.txnId, rowVertex.id, formVertex);
   }

   return rowResult.vertexId!
  }
  return -1;
 }

 let componentsTreeViewInstance: TreeView;
 let collectionFieldsTreeViewInstance: TreeView;
 let layoutTreeViewInstance: TreeView;

 function getTreeView(data: string) {
  if (data === "components") {
   return componentsTreeViewInstance;
  } else if (data === "collectionFields") {
   return collectionFieldsTreeViewInstance;
  } else if (data === "preview") {
   return "";
  } else if (data === "layout") {
   return layoutTreeViewInstance;
  } else {
   return "";
  }
 }

 function calculateToIndex(e: DragEndEvent) {
  // great
  if (e.fromComponent !== e.toComponent || e.dropInsideItem) {
   return e.toIndex;
  }

  return e.fromIndex >= e.toIndex
   ? e.toIndex
   : e.toIndex + 1;
 }

 function findNode(treeView: TreeView, index: number) {
  const nodeElement = treeView.element().querySelectorAll(".dx-treeview-node")[index];
  if (nodeElement) {
   return findNodeById(treeView.getNodes(), nodeElement.getAttribute("data-item-id"));
  }
  return null;
 }

 function findNodeById(nodes: Node<any>[], id: string | null): Node<any> | null {
  for (let i = 0; i < nodes.length; i += 1) {
   if (nodes[i].itemData?.id == id) {
    return nodes[i];
   }
   if (nodes[i].children) {
    const node = findNodeById(nodes[i].children!, id);
    if (node != null) {
     return node;
    }
   }
  }
  return null;
 }

 // toNode === null means end of the list.
 function moveNode(fromNode: Node<any> | null, toNode: Node<any> | null, fromItems?: dxTreeViewItem[], toItems?: dxTreeViewItem[], isDropInsideItem?: boolean, move?: boolean) {
  if (!fromNode || !fromItems || !toItems) return;
  if (move) {
   const fromNodeContainingArray = getNodeContainingArray(fromNode, fromItems);
   if (!fromNodeContainingArray) return;
   const fromIndex = findIndex(fromNodeContainingArray, fromNode.itemData!.id as string);
   fromNodeContainingArray?.splice(fromIndex, 1);
  }

  const fromItemData = JSON.parse(JSON.stringify(fromNode.itemData));
  if (isDropInsideItem) {
   if (fromNode.itemData && toNode?.itemData) {
    if (toNode.itemData![itemsExpr]) {
     toNode.itemData[itemsExpr].splice(toNode.itemData[itemsExpr].length, 0, fromItemData);
    } else {
     toNode.itemData.expanded = true;
     toNode.itemData[itemsExpr] = [fromItemData];
    }
   }
  } else {
   const toNodeContainingArray = getNodeContainingArray(toNode, toItems);
   if (!toNodeContainingArray) return;
   const toIndex = toNode === null
    ? toItems.length
    : findIndex(toNodeContainingArray, toNode.itemData!.id as string);
   fromNode.itemData && toNodeContainingArray?.splice(toIndex, 0, fromItemData);
  }
 }

 function getNodeContainingArray(node: Node<any> | null, rootArray: dxTreeViewItem[] | undefined): dxTreeViewItem[] {
  return node === null || node.parent === null
   ? rootArray
   : node.parent?.itemData?.children; // itemsExpr: "children"
 }

 function findIndex(array: dxTreeViewItem[], id: number | string) {
  const idsArray = array.map((elem) => elem.id);
  return idsArray.indexOf(id);
 }

 function getTopVisibleNode(component: dxSortable) {
  const treeViewElement = component.element();
  const treeViewTopPosition = treeViewElement.getBoundingClientRect().top;
  const nodes = treeViewElement.querySelectorAll(".dx-treeview-node");
  for (let i = 0; i < nodes.length; i += 1) {
   const nodeTopPosition = nodes[i].getBoundingClientRect().top;
   if (nodeTopPosition >= treeViewTopPosition) {
    return nodes[i];
   }
  }

  return null;
 }

 const OneComponents = () => {
  return     <div ref={el => {
   // TODO: How to drag and drop several/multiple items using dxSortable
   // https://supportcenter.devexpress.com/ticket/details/t874232/how-to-drag-and-drop-several-multiple-items-using-dxsortable
   // https://supportcenter.devexpress.com/ticket/details/t923393/drag-drop-for-plain-data-structure-treeview-showcheckboxesmode-problem
   onMount(() => {
    new dxSortable(el, {
     data: "components", // identifier
     group: "componentDrag",

     allowReordering: false,
     // If we set allowDropInsideItem false, it re-position instantly when dragging.
     allowDropInsideItem: true,
     moveItemOnDrop: false,
     dropFeedbackMode: 'push',
     filter: ".dx-treeview-item",
     onDragChange(e) {
      // if (e.fromComponent === e.toComponent) {
       // doesn't support re-order and a drop from other components.
       e.cancel = true;
      // }
     },
     onDragStart: (e) => {
      console.log("start");
     },
     onDragMove: (e) => {
      console.log("move");
      // when drop over preview, draw the outline properly to indicate drop position
     },
     onDragEnd(e) {
      // TODO: Handle when drop over Preview, insert in the proper place.
      // allowDropInsideItem is false

      const fromTreeView = getTreeView(e.fromData);
      const toTreeView = getTreeView(e.toData);
      if (!fromTreeView || !toTreeView) return;
      if (e.toData !== 'layout') return;

      // Cant Use JSON.parse(JSON.stringify()), circular reference.
      const fromNode = findNode(fromTreeView, e.fromIndex);
      const toNode = findNode(toTreeView, calculateToIndex(e));

      // If we JSON.parse(JSON.stringify()), drop inside tree is not working.
      const fromItems = fromTreeView.option("items");
      const toItems = toTreeView.option("items");

      // toNode === null means end of the list

      const fromTopVisibleNode = getTopVisibleNode(e.fromComponent as dxSortable);
      const toTopVisibleNode = getTopVisibleNode(e.toComponent as dxSortable);

      // disable dropping Component Category Node
      const fromVertex = graph.vertexes[fromNode!.itemData!.id!];
      if (fromVertex.L[0] !== 'Comp') return;

      let toIndex = 0;


      let parentAttrVertex: Vertex | undefined;
      let childrenItems: dxTreeViewItem[];
      if (e.dropInsideItem) {
       parentAttrVertex = graph.vertexes[toNode?.itemData!.id!];
       childrenItems = toNode!.itemData![itemsExpr];
       const compVertex = getComponentFromLayoutRow(toNode?.itemData!.id!);
       if (!compVertex?.P.child) {
        return;
       }
      } else {
       const toNodeContainingArray = getNodeContainingArray(toNode, toItems);
       if (!toNodeContainingArray) return;
       if (toNode === null) {
        toIndex = toNodeContainingArray.length;
        childrenItems = toNodeContainingArray;
       } else {
        toIndex = findIndex(toNodeContainingArray, toNode.itemData!.id as string);
        childrenItems = toNodeContainingArray;
       }

       if (toNode?.parent?.itemData?.id) {
        parentAttrVertex = graph.vertexes[toNode!.parent.itemData.id]
       } else if (toNode === null) {
        parentAttrVertex = pageConfig[0].record?.vertex;
       }
      }

      const rowId = componentDrag(fromVertex,  toIndex, parentAttrVertex, childrenItems);
      if (rowId === -1) return;
      // key value should be unique in the array.
      const originalId = fromNode!.itemData!.id;
      fromNode!.itemData!.id = rowId;

      moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem, false);
      fromNode!.itemData!.id = originalId;

      // we need to reset fromItems because, there is a bug it removes the dragged item from the tree.
      fromTreeView.option("items", fromItems);
      toTreeView.option("items", toItems);

      sortChildren(childrenItems, pageConfig[0].record.txnId);

      fromTreeView.scrollToItem(fromTopVisibleNode);
      toTreeView.scrollToItem(toTopVisibleNode);
     }
    });
   });
  }}>
   <div
    class="h:30rem"
    ref={el => {
     onMount(() => {
      /*const instance = new dxList(el, {
       items: graph.vertexLabelIdMap["Comp"].map(id => graph.vertexes[id]),
       keyExpr: 'id',
       // if searchExpr is not specified, search will not work
       searchExpr: 'P.name',
       displayExpr: 'P.name',
       // scrollBottom don't work if we not use onMount
       pageLoadMode: 'scrollBottom',
       searchEnabled: true,
       width: '20rem',
       searchMode: 'contains',
       // hoverStateEnabled: false,
       activeStateEnabled: false,
       // focusStateEnabled: false,
       // https://supportcenter.devexpress.com/ticket/details/t622207/scheduler-how-to-drag-and-drop-an-item-from-list-and-vice-versa
       onItemRendered: (el) => {
        el.itemElement.draggable = true;
        el.itemElement.addEventListener("dragstart", (event) =>
         event.dataTransfer!.setData("text/plain", `${el.itemData?.id || ''}`)
        );
       },
       // Note:
       // cant enable dragging with itemTemplate
       // because parent cancels drag event.
       // And error received when searching with itemTemplate:
       // computations created outside a `createRoot`
       // or `render` will never be disposed
       onItemClick: (e) => {
        console.log(e.itemData);
       },
      })*/
      const data = getTreeData({
       collection: "*CompCategory",
       // TODO: Dont display "Form" Component
       child: { collection: "->CompCategoryComp" }
      });
      componentsTreeViewInstance = new TreeView(el, {
       items: data,
       dataStructure: "tree",
       keyExpr: "id",
       displayExpr: "name",
       itemsExpr: "children",
       width: 200,
       searchEnabled: true,
       activeStateEnabled: false,
       // focusStateEnabled: false,
       onItemClick(e) {

       }
      });
     });
    }}
   />
  </div>
 }
 const TwoCollections = () => {
  return      <div ref={el => {
   onMount(() => {
    new dxSortable(el, {
     data: "collectionFields", // identifier
     group: "componentDrag",
     allowReordering: false,
     // If we set allowDropInsideItem false, it re-position instantly when dragging.
     allowDropInsideItem: true,
     moveItemOnDrop: false,
     filter: ".dx-treeview-item",
     onDragChange(e) {
      // doesn't support re-order and a drop from other components.
      e.cancel = true;
     },
     onDragStart: (e) => {
      console.log("start");
     },
     onDragMove: (e) => {
      console.log("move");
     },
     onDragEnd: (e) => {
      if (e.fromComponent === e.toComponent && e.fromIndex === e.toIndex) {
       return;
      }

      const fromTreeView = getTreeView(e.fromData);
      const toTreeView = getTreeView(e.toData);
      if (!fromTreeView || !toTreeView) return;
      if (e.toData !== 'layout') return;

      // Cant Use JSON.parse(JSON.stringify()), circular reference.
      const fromNode = findNode(fromTreeView, e.fromIndex);
      const toNode = findNode(toTreeView, calculateToIndex(e));

      // If we JSON.parse(JSON.stringify()), drop inside tree is not working.
      const fromItems = fromTreeView.option("items");
      const toItems = toTreeView.option("items");

      // TODO: disable dropping1 Component Category Node
      // toNode === null means end of the list

      const fromTopVisibleNode = getTopVisibleNode(e.fromComponent as dxSortable);
      const toTopVisibleNode = getTopVisibleNode(e.toComponent as dxSortable);

      // disable dropping some vertex
      const fromVertex = graph.vertexes[fromNode!.itemData!.id!];
      // if (!['Coll', 'Attr'].includes(fromVertex.L[0])) return;

      let toIndex = 0;


      let parentAttrVertex: Vertex | undefined;
      let childrenItems: dxTreeViewItem[];
      if (e.dropInsideItem) {
       parentAttrVertex = graph.vertexes[toNode?.itemData!.id!];
       childrenItems = toNode!.itemData![itemsExpr];
       const compVertex = getComponentFromLayoutRow(toNode?.itemData!.id!);
       if (!compVertex?.P.child) {
        return;
       }
      } else {
       const toNodeContainingArray = getNodeContainingArray(toNode, toItems);
       if (!toNodeContainingArray) return;
       if (toNode === null) {
        toIndex = toNodeContainingArray.length;
        childrenItems = toNodeContainingArray;
       } else {
        toIndex = findIndex(toNodeContainingArray, toNode.itemData!.id as string);
        childrenItems = toNodeContainingArray;
       }

       if (toNode?.parent?.itemData?.id) {
        parentAttrVertex = graph.vertexes[toNode!.parent.itemData.id]
       } else if (toNode === null) {
        parentAttrVertex = pageConfig[0].record?.vertex;
       }
      }

      const rowId = componentDrag(fromVertex,  toIndex, parentAttrVertex, childrenItems);
      if (rowId === -1) return;
      // key value should be unique in the array.
      const originalId = fromNode!.itemData!.id;
      fromNode!.itemData!.id = rowId;

      moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem, false);
      fromNode!.itemData!.id = originalId;

      // we need to reset fromItems because, there is a bug it removes the dragged item from the tree.
      fromTreeView.option("items", fromItems);
      toTreeView.option("items", toItems);

      // sort
      for (let i = 0; i < childrenItems.length; i++){
       const child = childrenItems[i];
       mergeVertexProperties(pageConfig[0].record.txnId, child.id! as number, {pos: i +1});
      }

      fromTreeView.scrollToItem(fromTopVisibleNode);
      toTreeView.scrollToItem(toTopVisibleNode);

     }
    });
   });
  }}>
   <div
    class="h:30rem"
    ref={el => {
     onMount(() => {
      // This is very slow, because we have very big data.

      const data = getTreeData({
       collection: "Coll",
       // TODO: First level add Incoming Fields.
       // child: { collection: "->Attr",
       //  child: {
       //   collection: "->Attr",
       //   child: { collection: "->Attr", child: { collection: "->Attr" } }
       //  }
       // }
      }, [], {
       nameExpr: (v: Vertex) => {
        const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
        return `${v.P.name}${component ? ` (${component})` : ""}`;
       }
      });
      collectionFieldsTreeViewInstance = new TreeView(el, {
       items: data,
       dataStructure: "tree",
       keyExpr: "id",
       displayExpr: "name",
       itemsExpr: "children",
       width: 200,
       searchEnabled: true,
       activeStateEnabled: false,
       // focusStateEnabled: false,
       expandNodesRecursive: false,
       onItemClick(e) {

       }
      });
     });
    }}
   />
  </div>
 }

 const getComponentFromLayoutRow = (layoutRowId: string | number) => {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex = (getSelectionOptions(currentVertex, "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default").vertexes || []);
  if (compVertex[0]) {
   return compVertex[0];
  }
  const collVertex = getChildVertex(['$0Coll'], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId('Comp', IdAttr, "Form");
  }

  return findVertexByLabelAndUniqueId("DataType", "name", "String");
 }

 const FourLayout = () => {
  return     <div ref={el => {
   onMount(() => {
    new dxSortable(el, {
     data: "layout", // identifier
     group: "componentDrag",
     allowDropInsideItem: true,
     allowReordering: true,
     filter: ".dx-treeview-item",
     onDragChange(e) {
      if (e.fromComponent === e.toComponent) {
       const nodes = e.element.querySelectorAll(".dx-treeview-node");
       if (e.fromIndex === undefined || e.toIndex === undefined) return;
       const parent = nodes[e.fromIndex];
       const child = nodes[e.toIndex];
       const isDescendant = parent.contains(child);
       if (isDescendant) {
        e.cancel = true;
       }
      }
      if (e.dropInsideItem) {
       const toTreeView = getTreeView(e.toData);
       if (!toTreeView) return;
       const toNode = findNode(toTreeView, calculateToIndex(e as any));
       const parentAttrVertex = graph.vertexes[toNode?.itemData!.id!];
       if (!parentAttrVertex) return;
       const compVertex = getComponentFromLayoutRow(toNode?.itemData!.id!);
       if (!compVertex?.P.child) {
        e.cancel = true;
        return;
       }
      }
     },
     onDragStart: (e) => {
      console.log("start");
     },
     onDragMove: (e) => {
      console.log("move");
     },
     onDragEnd: (e) => {
      if (e.fromComponent !== e.toComponent || e.fromIndex === e.toIndex) {
       return;
      }

      const fromTreeView = getTreeView(e.fromData);
      const toTreeView = getTreeView(e.toData);
      if (!fromTreeView || !toTreeView) return;

      const fromNode = findNode(fromTreeView, e.fromIndex);
      const toNode = findNode(toTreeView, calculateToIndex(e));

      const fromItems = fromTreeView.option("items");
      const toItems = toTreeView.option("items");

      // toNode === null means end of the list

      const fromTopVisibleNode = getTopVisibleNode(e.fromComponent as dxSortable);
      const toTopVisibleNode = getTopVisibleNode(e.toComponent as dxSortable);

      moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem, true);


      let childrenItems: dxTreeViewItem[];
      if (e.dropInsideItem) {
       childrenItems = toNode!.itemData![itemsExpr];
      } else {
       const toNodeContainingArray = getNodeContainingArray(toNode, toItems);
       if (!toNodeContainingArray) return;
       if (toNode === null) {
        childrenItems = toNodeContainingArray;
       } else {
        childrenItems = toNodeContainingArray;
       }
      }

      if(!e.dropInsideItem && fromNode?.parent === toNode?.parent) {
       sortChildren(childrenItems, pageConfig[0].record.txnId);
      } else {
       const fromId = fromNode?.itemData!.id;
       const fromVertex = graph.vertexes[fromId!];
       const fromParentVertex = getParentVertex(['Attr'], fromVertex);
       if (fromParentVertex.vertex) {
        // remove previous incoming edge if present.
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}})
       }
       const toId = toNode?.itemData!.id;
       // add new edge.
       if (e.dropInsideItem) {
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}}, toId)
       } else {
        const toParentVertex = toNode === null ? pageConfig[0].record?.vertex :  getParentVertex(['Attr'], graph.vertexes[toId!]).vertex;
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}}, toParentVertex?.id)
       }

       // sort from parent's children
       // sort if required.

       // sort to parent's children
       sortChildren(childrenItems, pageConfig[0].record.txnId);
      }

      fromTreeView.option("items", fromItems);
      toTreeView.option("items", toItems);
      fromTreeView.scrollToItem(fromTopVisibleNode);
      toTreeView.scrollToItem(toTopVisibleNode);

     }
    });
   });
  }}>
   <div
    //class="max-h:30rem"

    ref={el => {
     onMount(() => {
      let selectedElement: HTMLDivElement;
      const data = getTreeData({
       collection: "!Attr",
       child: { collection: "!Attr",
        child: {
         collection: "!Attr",
         child: { collection: "!Attr", child: { collection: "!Attr" } }
        }
       }
      }, pageConfig[0].record?.vertex ? [pageConfig[0].record.vertex] : [], {
       nameExpr: (v: Vertex) => {
        const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
        return `${v.P.name}${component ? ` (${component})` : ""}`;
       }
      });

      layoutTreeViewInstance = new TreeView(el, {
       items: data,
       dataStructure: "tree",
       keyExpr: "id",
       displayExpr: "name",
       itemsExpr: "children",
       // width: 200,
       // searchEnabled: true,
       activeStateEnabled: false,
       // focusStateEnabled: false,
       expandNodesRecursive: false,
       // selectByClick: true,
       // @ts-ignore
       onFocusOut() {
        setTimeout(() => selectedElement?.classList.add("dx-state-focused"));
       },
       onItemClick: function(args) {
        // @ts-ignore
        selectedElement = args.itemElement!.parentElement!
        if (!args.itemData?.id) {
         alert('Layout Id not Found');
         return;
        }
        batch(() => {
         setSelectedLayout({vertexId: -1});
         setSelectedComponent({vertexId: -1});
         setSelectedColl({vertexId: -1});

         setSelectedLayout({vertexId: args.itemData!.id! as number, itemIndex: args.itemIndex});
         const collVertex = getChildVertex(['$0Coll'], graph.vertexes[args.itemData!.id!]);
         setSelectedColl({vertexId: collVertex?.vertex?.id || -1});
         const componentVertex = getComponentFromLayoutRow(args.itemData!.id!);
         setSelectedComponent({vertexId: componentVertex?.id || -1});
        })
       },
      });
     });
    }}
   />
  </div>
 }



 const FiveProperties = () => {
  const [isRulesOpen, setIsRulesOpen] = createSignal(false);
  const vertexId = getNewGraphId();
  const addNewVertexResult = addNewVertex(0, newVertex(vertexId, ['PropsJson'], {sample: true}));
  if (addNewVertexResult.error) {
   console.warn('error while inserting');
  }

  createEffect(on(selectedComponent, v => {
   if (selectedLayout().vertexId && selectedLayout().vertexId !== -1) {
    const componentProps = getCompProps(graph.vertexes[selectedComponent().vertexId]);
    const rowProps = getRowProps(graph.vertexes[selectedLayout().vertexId]);
    const props = Object.assign(componentProps, rowProps);
    // set existing layout props
    setGraph('vertexes', vertexId, 'P', reconcile(props));
   } else {
    setGraph('vertexes', vertexId, 'P', reconcile( {}));
   }

  }));

  // @ts-ignore
  const setPropertyValue = (meta: Vertex, data: Vertex, value: any, valueSet?: boolean) => {
   if (valueSet ?? true) setGraph('vertexes', data.id, 'P', meta.P.name, value);
   if (selectedLayout().vertexId) {

    // find existing row;
    const layoutVertex = graph.vertexes[selectedLayout().vertexId];
    const componentVertex = graph.vertexes[selectedComponent().vertexId];
    const rowProps = getChildVertexes(["$0Prop"], [layoutVertex]).vertexes || [];
    let row = rowProps.find(vertex => {
     const name = getChildVertex(['$0Name'], vertex).vertex;
     return name?.P.name === meta.P.name
    });
    if (row) {
     if (valueSet ?? true) mergeVertexProperties(pageConfig[0].record.txnId, row.id, {value});
    } else {
     const propMetaVertex = newVertex(0, ['Meta'], {
      name: "Prop",
      displayName: "Property",
     });
     const v = (valueSet ?? true) ? {value} : {};
     const addRowResult = pageConfig[0].record.addNewRowUI(propMetaVertex, layoutVertex, v);
     if (addRowResult.vertexId) {
      row = graph.vertexes[addRowResult.vertexId];
      const componentProps = getChildVertexes(["$0Prop"], [componentVertex]).vertexes || [];
      const componentProp = componentProps.find(vertex => {
       return vertex.P.name === meta.P.name
      });
      if (componentProp) {
       setSelectionValue(pageConfig[0].record.txnId, graph.vertexes[addRowResult.vertexId], {P: {name: 'Name'}} as unknown as Vertex, componentProp.id);
      }
     }
    }
    // TODO: if reset, delete the row.

    return row;
   }
  }
  const selectedComponentProperties = () => {
   const selectedComp = graph.vertexes[selectedComponent().vertexId];

   if (!selectedComp) {
    return { error: true }
   }

   return getChildVertexes(['$0Prop'], [selectedComp]);
  }

  const toggle = () => setIsRulesOpen(prev => !prev);
  let prevTxnIndex = -1;
  const onSubmit = () => {
   // hack to refresh the select fields. no option is refereshing the label.
   setGraph('vertexes', selectedLayout().vertexId, 'OUT', 'Rules', v => v ? [...v] : v);
   toggle();
  }
  const onCancel = () => {
   if (prevTxnIndex !== -1) revertTransactionUpTo(pageConfig[0].record.txnId, prevTxnIndex);
   toggle();
  }

  const Body = () => {
   prevTxnIndex = transactions.get(pageConfig[0].record.txnId)?.steps?.length || 0


   const metaVertexId = getNewGraphId();
   const txnId = getNewTxnId();
   const metaAttributes = AttrsTableData.Coll.attributes.find(x => x.name === "Rules");

   addNewVertex(txnId, newVertex(metaVertexId, ["MetaAttr"], {name: metaAttributes?.name, props: metaAttributes?.props}));
   addMetaVertexes(txnId, graph.vertexes[metaVertexId], metaAttributes!.attributes!);
   onCleanup(() => {
    revertTransaction(txnId);
   })

   return <TableInputField meta={graph.vertexes[metaVertexId]}
                           data={graph.vertexes[selectedLayout().vertexId!]}
                           txnId={pageConfig[0].record.txnId}
                           setValue={pageConfig[0].record.setValue}
                           isRealTime={false}  />
  }



  return <>
   <Show when={selectedLayout().vertexId !== -1}>
    <GenericField
     meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Rules" }}} as any}
     onClick={toggle}
    />
   </Show>
   <FormGroupProperties
    txnId={pageConfig[0].record.txnId}
    metaAttributes={selectedComponentProperties().vertexes || []}
    vertex={graph.vertexes[vertexId]}
    setValue={setPropertyValue}
    setValueGeneric={(attribute: Vertex, vertex: Vertex, data: any) => setValueGlobal(pageConfig[0].record.txnId, attribute, vertex, data, Ws, pageConfig[0].record.isRealTime)}
    selectedLayout={graph.vertexes[selectedLayout().vertexId]}
   />
   <Show when={isRulesOpen()}>
    <Portal>
     <div role="dialog" tabIndex={-1} class="sb-modal">
      <ModalContent>
       <ModalHeader>
        Header
        <Button
         variant="icon"
         onclick={toggle}
         style={{ float: "right" }}
        >
         ✕
        </Button>
       </ModalHeader>
       <ModalBody>
        <Body/>
       </ModalBody>
       <ModalFooter>
        {/*<Button onclick={toggle}>OK</Button>*/}
        <div class="flex gap:4">
         <GenericField
          meta={{
           P: {
            component: "Button",
            props: {
             stylingMode: "contained",
             type: "success",
             text: "Submit"
            }
           }
          } as any}
          onClick={onSubmit}
         />

         <GenericField
          meta={{
           P: {
            component: "Button",
            props: {
             stylingMode: "contained",
             type: "danger",
             text: "Cancel"
            }
           }
          } as any}
          onClick={onCancel}
         />
        </div>

       </ModalFooter>
      </ModalContent>
     </div>
    </Portal>
   </Show>
  </>
 }
 const deleteLayout = () => {
  if(selectedLayout().vertexId !== -1) {
   // TODO: delete layout and all its properties and all the childrens.
   deleteRow(graph.vertexes[selectedLayout().vertexId], pageConfig[0].record.isRealTime, pageConfig[0].record.txnId, Ws);

   const fromNode = findNode(layoutTreeViewInstance, selectedLayout().itemIndex!);
   const fromItems = layoutTreeViewInstance.option("items");
   if (!fromItems) return;
   const fromIndex = findIndex(fromItems, fromNode!.itemData!.id as string);
   fromItems?.splice(fromIndex, 1);

   layoutTreeViewInstance.option("items", fromItems);
  }
 }
 return (
  <div class="flex">
   <div class="border:1|solid|blue-60 p:10 m:5 flex:col">
    <div class="mb:10">Components:</div>
    <OneComponents/>

    <div class="bt:1|solid|gray py:10 mt:5 flex-grow:1">
     <div class="mb:10">Collection Fields:</div>
     <TwoCollections/>
    </div>
   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 min-w:400 flex-grow:1">
    <div class={"text:center mb:12"} onClick={rerender}>Preview</div>
    <PageContext.Provider value={{ events: {} }}>
     <Show when={count() && pageConfig[0].record?.vertex && count()} keyed>
      <PageItemRender metaVertex={pageConfig[0].record.vertex} />
     </Show>
    </PageContext.Provider>
   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 flex flex:col">


    <div class="flex-grow:1">
     <div class={"mb:12"}>Layout</div>
     <FourLayout/>
    </div>
    <div class="bt:1|solid|gray p:10 mt:5 flex-grow:1">
     <div class={"mb:12 flex ai:center justify-content:space-between"}>
      <span>Properties</span>
      <Show when={selectedLayout().vertexId !== -1}>
       <GenericField
        meta={{ P: {component: "Button", props: { stylingMode: 'text', type: "danger", icon: "trash" }}} as any}
        onClick={deleteLayout}
       />
      </Show>
     </div>
     <FiveProperties/>
    </div>

    <div class="bt:1|solid|gray p:10 mt:5 ">
     <AbstractSingleForm
      formId={"Page"}
      id={params.id}
      config={pageConfig}
      showMainFieldsOnly={true}
      importExportButtons={false}
      // TODO: add dry option
     />
    </div>

   </div>

  </div>
 );
};