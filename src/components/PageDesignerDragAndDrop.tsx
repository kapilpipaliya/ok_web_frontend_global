// TODO: make multiple Fields Drag and Drop once.
import {useParams} from "@solidjs/router";
import {createStore, reconcile} from "solid-js/store";
import {
 addMetaVertexes,
 addNewRow,
 FieldAttribute,
 getCompProps,
 getRowProps,
 Record,
 setValueGlobal
} from "../lib/Record";
import {batch, createEffect, createSignal, For, on, onCleanup, Switch, Match, onMount, Show, useContext} from "solid-js";
import {GenericField, PageView} from "./input/GenaricField";
// Comment This Lines in web build
import TreeView, {Item as dxTreeViewItem, Node} from "devextreme/ui/tree_view";
import dxSortable, {DragEndEvent} from "devextreme/ui/sortable";
import {
 deleteNestedLayout,
 getChildVertex,
 getChildVertexes,
 getParentVertex,
 getSelectionOptions,
 getTreeData
} from "../lib/Traverse";
import {
 getNewGraphId,
 getNewTxnId,
 graph,
 Id,
 IdAttr,
 revertTransaction,
 revertTransactionUpTo,
 setGraph,
 transactions,
 Vertex,
} from "../lib/graph";
import {AbstractSingleForm} from "./DynamicForm";
import {SelectInputField, setParentValue, setSelectionValue} from "./input/SelectInputField";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId,
 mergeVertexProperties,
 newVertex,
 replaceVertexProperties
} from "../lib/Vertex";
import {WsContext} from "../utils/ws_events_dispatcher";
import {Portal} from "solid-js/web";
// @ts-ignore
import {Button, ModalBody, ModalContent, ModalFooter, ModalHeader} from "solid-blocks";
import {TableInputField} from "./input/TableInputField";
import {AttrsTableData} from "../lib/api";
import {GenericInputField} from "./input/GenaricInputField";
import JsxParser from "../lib/jsx_parser/source/components/JsxParser";
import {selectedLayout, setSelectedLayout} from "../pages/PageView"
import {FormGroupProperties} from "../pages/FormsAdmin";
import {createDragHandle} from "./solid_dnd_directive";

import { TableTabs } from "./TableTabs";

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
export const componentDrag = (txnId: number, fromVertex: Vertex, index: number, parentVertex: Vertex) => {
 // handle (toNode === null) case.
 if (fromVertex) {
  const attrMetaVertex =      newVertex(getNewTxnId(), [],{
   name: "Attr",
   component: "Table",
   tab: "Attribute",
   props: {
    type: 'Attr',
    label: "Attr",
   },
  });
  const rowResult = addNewRow(txnId, attrMetaVertex, parentVertex, {pos: index}, false, {} as any);
  const rowVertex = graph.vertexes[rowResult.vertexId!];

  if(fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
   const attrCompMetaVertex = newVertex(getNewTxnId(), [],{
    name: "Comp",
    component: "SelectBox",
    props: {
     collection: "g:'Comp'",
    },
   });

   if (fromVertex.L[0] === "Comp") {
    // set Component to the row
    setSelectionValue(txnId, rowVertex, attrCompMetaVertex, fromVertex.id);
    addPropsToLayoutRow(txnId, rowVertex.id, fromVertex);
   } else if (fromVertex.L[0] === "Coll") {
    // set Collection to the row
    const attrCollMetaVertex = newVertex(getNewTxnId(), [], {
     name: "coll",
     displayName: "Collection",
     component: "SelectBox",
     props: {
      collection: "g:'Coll'",
      parentLabel: "Coll",
     },
    });
    setSelectionValue(txnId, rowVertex, attrCollMetaVertex, fromVertex.id);
    const formVertex = findVertexByLabelAndUniqueId('Comp', IdAttr, "Form");
    if (!formVertex) {
     alert('cant find form');
    } else {
     setSelectionValue(txnId, rowVertex, attrCompMetaVertex, formVertex.id);
     addPropsToLayoutRow(txnId, rowVertex.id, formVertex);
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
   setSelectionValue(txnId, rowVertex, attMetaVertex, fromVertex.id);
   // TODO add comp prop default values
   // addPropsToLayoutRow(pageConfig[0].record.txnId, rowVertex.id, formVertex);
  }

  return rowResult.vertexId!
 }
 return -1;
}
export function sortChildren(childrenItems: dxTreeViewItem[], txnId: number) {
 if (!childrenItems) return;
 for (let i = 0; i < childrenItems.length; i++) {
  const child = childrenItems[i];
  mergeVertexProperties(txnId, child.id! as number, { pos: i + 1 });
 }
}

// @ts-ignore

export const setPropertyValueGlobal = (txnId: number, meta: Vertex, layoutVertex: Vertex, componentVertex: Vertex, value: any, valueSet?: boolean) => {
 // find existing row;
 const rowProps = getChildVertexes(["$0Prop"], [layoutVertex]).vertexes || [];
 let row = rowProps.find(vertex => {
  const name = getChildVertex(['$0Name'], vertex).vertex;
  return name?.P.name === meta.P.name
 });
 if (row) {
  if (valueSet ?? true) mergeVertexProperties(txnId, row.id, {value});
 } else {
  const propMetaVertex = newVertex(0, ['Meta'], {
   name: "Prop",
   displayName: "Property",
  });
  const componentProps = getChildVertexes(["$0Prop"], [componentVertex]).vertexes || [];
  const componentProp = componentProps.find(vertex => {
   return vertex.P.name === meta.P.name
  });
  if (componentProp) {
   const properties = (valueSet ?? true) ? {value} : {};
   const addRowResult = addNewRow(txnId, propMetaVertex, layoutVertex, properties, false, {} as any);
   if (addRowResult.vertexId) {
    row = graph.vertexes[addRowResult.vertexId];
    setSelectionValue(txnId, graph.vertexes[addRowResult.vertexId], {P: {name: 'Name'}} as unknown as Vertex, componentProp.id);
   }
  } else {
   console.error(`component prop ${meta.P.name} is not found in component ${componentVertex.P.name}. so skipped inserting property.`);
  }
 }
 // TODO: if reset, delete the row.

 return row;

}


function getLayoutTreeJson() {
 return {
  collection: "->Attr",
  child: {
   collection: "->Attr",
   child: {
    collection: "->Attr",
    child: {
     collection: "->Attr",
     child: {
      collection: "->Attr",
      child: {
       collection: "->Attr",
       child: {
        collection: "->Attr",
        child: {
         collection: "->Attr",
         child: {
          collection: "->Attr",
          child: {
           collection: "->Attr",
           child: {
            collection: "->Attr",
            child: {
             collection: "->Attr",
             child: {
              collection: "->Attr",
              child: {
               collection: "->Attr",
               child: {
                collection: "->Attr",
                child: {
                 collection: "->Attr",
                 child: {
                  collection: "->Attr",
                  child: {
                   collection: "->Attr",
                   child: {
                    collection: "->Attr",
                    child: {
                     collection: "->Attr",
                     child: {
                      collection: "->Attr",
                      child: {
                       collection: "->Attr",
                       child: {
                        collection: "->Attr",
                        child: {
                         collection: "->Attr",
                         child: {
                          collection: "->Attr",
                          child: {
                           collection: "->Attr",
                           child: {
                            collection: "->Attr",
                            child: {
                             collection: "->Attr",
                             child: {
                              collection: "->Attr",
                              child: {
                               collection: "->Attr",
                               child: {
                                collection: "->Attr",
                                child: {collection: "->Attr", child: {collection: "->Attr"}}
                               }
                              }
                             }
                            }
                           }
                          }
                         }
                        }
                       }
                      }
                     }
                    }
                   }
                  }
                 }
                }
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    }
   }
  }
 };
}

export const PageDesignerDragAndDrop = () => {
 const itemsExpr = "children";
 const params = useParams();
 const pageConfig = createStore({} as { record: Record });
 const [count, setCount] = createSignal(1);
 const { Ws } = useContext(WsContext);

 const [selectedComponent, setSelectedComponent] = createSignal({vertexId: -1});
 // @ts-ignore
 const [selectedColl, setSelectedColl] = createSignal({vertexId: -1});
 const rerender = () => {
  setCount(prev => prev + 1);
 };




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

      const rowId = componentDrag(pageConfig[0].record.txnId, fromVertex,  toIndex, parentAttrVertex || pageConfig[0].record.vertex);
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
       collection: "g:'CompCategory'",
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

      const rowId = componentDrag(pageConfig[0].record.txnId, fromVertex,  toIndex, parentAttrVertex!);
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
       collection: "g:'Coll'",
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
  const compVertex = (getSelectionOptions([currentVertex], "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default").vertexes || []);
  if (compVertex[0]) {
   return compVertex[0];
  }
  const collVertex = getChildVertex(['$0Coll'], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId('Comp', IdAttr, "Form");
  }

  return findVertexByLabelAndUniqueId("DataType", "name", "String");
 }

 function getLayoutTreeData() {
  return getTreeData(getLayoutTreeJson(), pageConfig[0].record?.vertex ? [pageConfig[0].record.vertex] : [], {
   nameExpr: (v: Vertex) => {
    const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
    return `${v.P.name}${component ? ` (${component})` : ""}`;
   }
  });
 }

 const FourLayout = () => {
  return     <div ref={el => {
   onMount(() => {
    new dxSortable(el, {
     data: "layout", // identifier
     group: "componentDrag",
     allowDropInsideItem: true,
     height: '40vh',
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
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}} as unknown as Vertex)
       }
       const toId = toNode?.itemData!.id;
       // add new edge.
       if (e.dropInsideItem) {
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}} as unknown as Vertex, toId as number)
       } else {
        const toParentVertex = toNode === null ? pageConfig[0].record?.vertex :  getParentVertex(['Attr'], graph.vertexes[toId!]).vertex;
        setParentValue(pageConfig[0].record.txnId, fromVertex, {P: {props: {type: "Attr"}}} as unknown as Vertex, toParentVertex?.id)
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
      // TODO: This should be infinite
      const data = getLayoutTreeData();

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
  const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
  const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);
  const vertexId = getNewGraphId();
  const addNewVertexResult = addNewVertex(0, newVertex(vertexId, ['PropsJson'], {sample: true}));
  if (addNewVertexResult.error) {
   console.warn('error while inserting');
  }

  createEffect(on(selectedComponent, v => {
   if (selectedLayout().vertexId && selectedLayout().vertexId !== -1 && selectedComponent() && selectedComponent().vertexId !== -1) {
    const componentProps = getCompProps(graph.vertexes[selectedComponent().vertexId]);
    const layoutPropRows = getRowProps(graph.vertexes[selectedLayout().vertexId]);
    const layoutPropRow = Object.assign(componentProps, layoutPropRows);
    // set existing layout props
    setGraph('vertexes', vertexId, 'P', reconcile(layoutPropRow));
   } else {
    setGraph('vertexes', vertexId, 'P', reconcile({}));
   }

  }));

  const setPropertyValue = (meta: Vertex, data: Vertex, value: any, valueSet?: boolean) => {
   if (selectedLayout().vertexId !== -1 && selectedComponent().vertexId !== -1) {
    if (valueSet ?? true) setGraph('vertexes', data.id, 'P', meta.P.name, value);
    return setPropertyValueGlobal(pageConfig[0].record.txnId, meta, graph.vertexes[selectedLayout().vertexId], graph.vertexes[selectedComponent().vertexId], value, valueSet);
   }
   return;
  }
  const selectedComponentProperties = () => {
   const selectedComp = graph.vertexes[selectedComponent().vertexId];

   if (!selectedComp) {
    return { error: true }
   }

   return getChildVertexes(['$0Prop'], [selectedComp]);
  }

  const toggleRulesModal = () => setIsRulesModalOpen(prev => !prev);
  const toggleImportsModal = () => setIsImportModalOpen(prev => !prev);
  let prevTxnIndex = -1;
  const onRulesSubmit = () => {
   // hack to refresh the select fields. no option is refereshing the label.
   setGraph('vertexes', selectedLayout().vertexId, 'OUT', 'Rules', v => v ? [...v] : v);
   toggleRulesModal();
  }
  const onRulesCancel = () => {
   if (prevTxnIndex !== -1) revertTransactionUpTo(pageConfig[0].record.txnId, prevTxnIndex);
   toggleRulesModal();
  }
  const onImportsSubmit = () => {
   layoutTreeViewInstance.option("items", getLayoutTreeData());
   // hack to refresh the select fields. no option is refereshing the label.
   setGraph('vertexes', selectedLayout().vertexId, 'OUT', 'Rules', v => v ? [...v] : v);
   toggleImportsModal();
  }
  const onImportsCancel = () => {
   if (prevTxnIndex !== -1) revertTransactionUpTo(pageConfig[0].record.txnId, prevTxnIndex);
   layoutTreeViewInstance.option("items", getLayoutTreeData());
   toggleImportsModal();
  }

  const RulesModalBody = () => {
   prevTxnIndex = transactions.get(pageConfig[0].record.txnId)?.steps?.length || 0


   const metaVertexId = getNewGraphId();
   const txnId = getNewTxnId();
   const metaAttributes = AttrsTableData.Coll.attributes.find(x => x.name === "Rules");

   addNewVertex(txnId, newVertex(metaVertexId, ["MetaAttr"], {name: metaAttributes?.name, props: metaAttributes?.props}));
   const attributes: FieldAttribute[] = JSON.parse(JSON.stringify(metaAttributes!.attributes!));

   for (const attribute of attributes) {
    if (attribute.name === "Rule") {
     for (const ruleattribute of attribute.attributes!) {
      if (ruleattribute.name === "cond") {
       for (const condAttribute of ruleattribute.attributes!) {
        if (condAttribute.name === "layout") {
         const data = getTreeData({
          collection: "->Attr",
          child: { collection: "->Attr",
           child: {
            collection: "->Attr",
            child: { collection: "->Attr", child: { collection: "->Attr" } }
           }
          }
         }, pageConfig[0].record?.vertex ? [pageConfig[0].record.vertex] : [], {
          nameExpr: (v: Vertex) => {
           const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
           return `${v.P.name}${component ? ` (${component})` : ""}`;
          }
         });


         condAttribute!.props = {
          dataSource: data,
          valueExpr: "id",
          displayExpr: "name",
          itemsExpr: "children",
          showClearButton: true,
          treeProps: {
           dataStructure: "tree",
           keyExpr: "id",
           displayExpr: "name",
           itemsExpr: "children",
           selectionMode: 'single',
           // width: 200,
           // searchEnabled: true,
           // activeStateEnabled: false,
           // focusStateEnabled: false,
           expandNodesRecursive: false,
          },

         }
        }
       }
      }
     }
    }
   }



   addMetaVertexes(txnId, graph.vertexes[metaVertexId], attributes);
   onCleanup(() => {
    revertTransaction(txnId);
   })

   return <TableInputField meta={graph.vertexes[metaVertexId]}
                           data={graph.vertexes[selectedLayout().vertexId!]}
                           txnId={pageConfig[0].record.txnId}
                           setValue={pageConfig[0].record.setValue}
                           isRealTime={false}  />
  }
  const ImportModalBody = () => {
   prevTxnIndex = transactions.get(pageConfig[0].record.txnId)?.steps?.length || 0

   const metaVertexId = getNewGraphId();
   const dataVertexId = getNewGraphId();

   setGraph("vertexes", metaVertexId, {P: {name: "jsx", props: {width: 700, height: 700}}});
   setGraph("vertexes", dataVertexId, {id: dataVertexId, P: {}});

   onCleanup(() => {
    // @ts-ignore
    setGraph("vertexes", metaVertexId, undefined);
    // @ts-ignore
    setGraph("vertexes", dataVertexId, undefined);
   })
   const footerButtons = [
    {
     meta: { P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Import", type: "success", }}} as any,
     onClick: () => {
      const jsxParser = new JsxParser({showWarnings: true, txnId: pageConfig[0].record.txnId, jsx: graph.vertexes[dataVertexId].P.jsx || '', parent: graph.vertexes[selectedLayout().vertexId]});
      jsxParser.render();
      layoutTreeViewInstance.option("items", getLayoutTreeData());
     }
    },
    {
     meta: {P: {component: "Button", props: {stylingMode: "contained", type: "success", text: "Submit"}}} as any,
     onClick: onImportsSubmit
    },
    {
     meta: {P: {component: "Button", props: {stylingMode: "contained", type: "danger", text: "Cancel"}}} as any,
     onClick: onImportsCancel
    }
   ]
   return <>
    <Portal>
     <div role="dialog" tabIndex={-1} class="sb-modal">
      <ModalContent>
       <ModalHeader>
        Import HTML
        <Button
            variant="icon"
            onclick={toggleImportsModal}
            style={{ float: "right" }}
        >
         ✕
        </Button>
       </ModalHeader>
       <ModalBody>
        <GenericInputField component="TextArea" meta={graph.vertexes[metaVertexId]}
                           data={graph.vertexes[dataVertexId]}
                           setValue={(attribute: Vertex, vertex: Vertex, data: any) => setGraph('vertexes', vertex.id, 'P', {jsx: data})} disabled={false}/>
       </ModalBody>
       <ModalFooter>
        <div class="flex gap:4">
         <For each={footerButtons}>
          {item => <GenericField meta={item.meta} onClick={item.onClick}/>}
         </For>
        </div>

       </ModalFooter>
      </ModalContent>
     </div>
    </Portal>
   </>
  }

  const CollAndData = () => {

   const metaVertexId = getNewGraphId();
   const txnId = getNewTxnId();

   addNewVertex(txnId, newVertex(metaVertexId, ["MetaAttr"], {name: "Attr", props: {
     type: 'Attr',
     label: "Attr",
    }}));
   const attributes: FieldAttribute[] = [
    {
     name: "coll",
     displayName: "Collection",
     component: "SelectBox",
     props: {
      collection: "g:'Coll'",
      parentLabel: "Coll",
     },
    },
    {
     name: "data",
     component: "SelectBox",
     props: {
      collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
     },
    },
    {
     name: "data",
     component: "TextBox",
    },
   ];
   addMetaVertexes(txnId, graph.vertexes[metaVertexId], attributes);
   onCleanup(() => {
    revertTransaction(txnId);
   });
   const metaVertex = graph.vertexes[metaVertexId];
   const collMetaVertex = getChildVertexes(["MetaAttr"], [metaVertex]);


   return <>
    <span>Collection:</span>
    <SelectInputField
      data={graph.vertexes[selectedLayout().vertexId!]}
      meta={collMetaVertex.vertexes![0]!}
      disabled={false}
      component={"SelectBox"}
      txnId={pageConfig[0].record.txnId}
      // passed setValue when we have a string value in select field
      setValue={pageConfig[0].record.setValue}
      isRealTime={false}
    />
    <span>Data:</span>
    <SelectInputField
      data={graph.vertexes[selectedLayout().vertexId!]}
      meta={collMetaVertex.vertexes![1]!}
      disabled={false}
      component={"SelectBox"}
      txnId={pageConfig[0].record.txnId}
      // passed setValue when we have a string value in select field
      setValue={pageConfig[0].record.setValue}
      isRealTime={false}
    />
    <span>Expression:</span>
    <GenericInputField
      data={graph.vertexes[selectedLayout().vertexId!]}
      meta={collMetaVertex.vertexes![2]!}
      disabled={false}
      component={"TextBox"}
      setValue={pageConfig[0].record.setValue}
    />
   </>
  }

  return <>
   <Show when={selectedLayout().vertexId !== -1}>
    <GenericField
     meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Rules" }}} as any}
     onClick={toggleRulesModal}
    />
    <GenericField
     meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Import" }}} as any}
     onClick={toggleImportsModal}
    />
    <CollAndData/>

    <FormGroupProperties
      txnId={pageConfig[0].record.txnId}
      metaAttributes={selectedComponentProperties().vertexes || []}
      vertex={graph.vertexes[vertexId]}
      setValue={setPropertyValue}
      setValueGeneric={(attribute: Vertex, vertex: Vertex, data: any) => setValueGlobal(pageConfig[0].record.txnId, attribute, vertex, data, Ws, pageConfig[0].record.isRealTime)}
      selectedLayout={graph.vertexes[selectedLayout().vertexId]}
    />
   </Show>
   <Show when={isRulesModalOpen()}>
    <Portal>
     <div role="dialog" tabIndex={-1} class="sb-modal">
      <ModalContent>
       <ModalHeader>
        Header
        <Button
         variant="icon"
         onclick={toggleRulesModal}
         style={{ float: "right" }}
        >
         ✕
        </Button>
       </ModalHeader>
       <ModalBody>
        <RulesModalBody/>
       </ModalBody>
       <ModalFooter>
        {/*<Button onclick={toggleRulesModal}>OK</Button>*/}
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
          onClick={onRulesSubmit}
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
          onClick={onRulesCancel}
         />
        </div>

       </ModalFooter>
      </ModalContent>
     </div>
    </Portal>
   </Show>
   <Show when={isImportModalOpen()}>
     <ImportModalBody/>
   </Show>
  </>
 }
 const deleteLayout = () => {
  if(selectedLayout().vertexId !== -1) {
   const layoutVertexId = selectedLayout().vertexId;
   batch(() => {
    setSelectedLayout({vertexId: -1});
    setSelectedComponent({vertexId: -1});
    setSelectedColl({vertexId: -1});
   })

   deleteNestedLayout(pageConfig[0].record.txnId, [graph.vertexes[layoutVertexId]]);
/*
   const layoutItemIndex = selectedLayout().itemIndex;
   const fromNode = findNode(layoutTreeViewInstance, layoutItemIndex!);
   const fromItems = layoutTreeViewInstance.option("items");
   if (!fromItems) return;
   const fromIndex = findIndex(fromItems, fromNode!.itemData!.id as string);
   fromItems?.splice(fromIndex, 1);*/


   layoutTreeViewInstance.option("items", getLayoutTreeData());
  }
 }
 onCleanup(() => {
  batch(() => {
   setSelectedLayout({vertexId: -1});
   setSelectedComponent({vertexId: -1});
   setSelectedColl({vertexId: -1});
  })
 })

  const [className,setClassName]=createSignal("overflow:auto mx:auto w:412px h:914px border:1|solid|blue-60 m:1rem")
  const mobileClass="overflow:auto mx:auto w:412px h:914px border:1|solid|blue-60 m:1rem"
  const webClass="border:1|solid|blue-60 m:1rem"
  const tabs=["Mobile Preview","Web Preview"]

  const [activeTab,setActiveTab]=createSignal(tabs[0]);

  createEffect(() => {
    setClassName(activeTab()===tabs[0]?mobileClass:webClass)
  });

 const [leftColumns, setLeftColumns] = createSignal( ['components', 'collection'].map((column) => ({ id: column, name: column })));
 const [rightColumns, setRightColumns] = createSignal( ['layout', 'properties', 'form'].map((column) => ({ id: column, name: column })));

 const oneComponents = <OneComponents/>;
 const twoCollections = <TwoCollections/>;
 const fourLayout = <FourLayout/>;
 const fiveProperties = <FiveProperties/>;
 const abstractSingleForm = <AbstractSingleForm formId={"Page"} id={params.id} config={pageConfig} showMainFieldsOnly={true}
                                                importExportButtons={false}/>;
 const { dragHandleZone: dragHandleZone1, dragHandle: dragHandle1 } = createDragHandle();
 const { dragHandleZone: dragHandleZone2, dragHandle: dragHandle2 } = createDragHandle();
 // @ts-ignore
 dragHandleZone1, dragHandleZone2, dragHandle1, dragHandle2

 const Column = (props: {type: string, dragHandler: (node: HTMLElement) => void}) => {
  const dragHandle = (el:HTMLElement) => props.dragHandler(el)
  return <>
   <div class="border:1|solid|blue-60 p:10 m:5"
   >
    <Switch>
     <Match when={props.type === 'components'}>
      <div class="mb:10" use:dragHandle>Components:</div>
      {oneComponents}
     </Match>
     <Match when={props.type === 'collection'}>
      <div class="mb:10" use:dragHandle>Collection Fields:</div>
      {twoCollections}
     </Match>
     <Match when={props.type === 'layout'}>
      <div class={"mb:12"} use:dragHandle>Layout</div>
      {fourLayout}
     </Match>
     <Match when={props.type === 'properties'}>
      <div class="bt:1|solid|gray p:10 mt:5 flex-grow:1">
       <div class="mb:12 flex ai:center justify-content:space-between">
        <span use:dragHandle>Properties</span>
        <Show when={selectedLayout().vertexId !== -1}>
         <GenericField
           meta={{P: {component: "Button", props: {stylingMode: 'text', type: "danger", icon: "trash"}}} as any}
           onClick={deleteLayout}/>
        </Show>
       </div>
       {fiveProperties}
      </div>
     </Match>
     <Match when={props.type === 'form'}>
      <span  use:dragHandle>Form:</span>
      {abstractSingleForm}
     </Match>
    </Switch>
   </div>
  </>;
 }

 return <div class="flex">
  <div class="flex-col"
       // @ts-ignore
       use:dragHandleZone1={{items: ()=>leftColumns(), type: "column", flipDurationMs: 300}} on:consider={(e:any) => setLeftColumns(e.detail.items)} on:finalize={(e: any) => setLeftColumns(e.detail.items)}
  ><For each={leftColumns()}>{column => <Column dragHandler={dragHandle1} type={column.id}/>}</For></div>
  <div class="flex-grow:1 border:1|solid|blue-60 p:10 m:5 min-w:400">
    <div class="flex justify-content:center" ><TableTabs tabs={tabs}  setActiveTab={setActiveTab} /></div>

    <div class={className() as string}>
      <PageView number={count()} vertex={pageConfig[0].record?.vertex}/>
    </div>
  </div>

  <div class="flex-col"
       // @ts-ignore
       use:dragHandleZone2={{items: ()=>rightColumns(), type: "column", flipDurationMs: 300}} on:consider={(e:any) => setRightColumns(e.detail.items)} on:finalize={(e:any) => setRightColumns(e.detail.items)}

  ><For each={rightColumns()}>{column => <Column dragHandler={dragHandle2} type={column.id}/>}</For></div>
  </div>
  };

