// TODO: make multiple Fields Drag and Drop once.
import { useParams } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { PageContext, Record } from "../lib/Record";
import { createSignal, createUniqueId, onMount, Show } from "solid-js";
import { PageItemRender } from "./input/GenaricField";
import TreeView, {
 Item as dxTreeViewItem,
 Node
} from "devextreme/ui/tree_view";
import dxSortable, { DragEndEvent } from "devextreme/ui/sortable";
import {
 getChildVertex,
 getChildVertexes,
 getParentVertex,
 getTreeData
} from "../lib/Traverse";
import { graph, Id, Vertex } from "../lib/graph";
import dxDraggable from "devextreme/ui/draggable";
import { AbstractSingleForm } from "./DynamicForm";
import { setParentValue, setSelectionValue } from "./input/SelectInputField";
import { mergeVertexProperties, replaceVertexProperties } from "../lib/Vertex";

function sortChildren(childrenItems: dxTreeViewItem[], txnId: number) {
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
 const rerender = () => {
  setCount(prev => prev + 1);
 };

 // @Note:
 // From Component To Layout drag:
 // 1. Create a Row to proper parent.
 // 2. Sort properly
 const componentDrag = (componentVertexId: Id, index: number, parentVertex?: Vertex, childrenItems: dxTreeViewItem[]) => {
  // handle (toNode === null) case.
  if (componentVertexId) {
   parentVertex = parentVertex || pageConfig[0].record.vertex;
   // Add new Row
   const rowMetaAttrInst = getChildVertex(["AttrInst"], parentVertex);
   const attrMeta = getChildVertexes(['MetaAttr'], [rowMetaAttrInst.vertex || pageConfig[0].record.metaVertex]).vertexes;
   if (!attrMeta) return -1;
   const attrMetaVertex = attrMeta.find(vertex => vertex.P.name === "Attr");
   // if it's too many nested levels, it's not supported.
   if (!attrMetaVertex) {
    alert('too much nested layout not supported.');
    return -1;
   }
   const rowResult = pageConfig[0].record.addNewRowUI(attrMetaVertex, parentVertex, {pos: index});
   const rowVertex = graph.vertexes[rowResult.vertexId!];
   // set Component to the row
   const attrAttrMeta = getChildVertexes(['MetaAttr'], [rowMetaAttrInst.vertex || attrMetaVertex]).vertexes;
   if (!attrAttrMeta) return -1;
   const attrCompMetaVertex = attrAttrMeta.find(vertex => vertex.P.name === "Comp");
   if (!attrCompMetaVertex) {
    return -1;
   }
   setSelectionValue(pageConfig[0].record.txnId, rowVertex, attrCompMetaVertex, componentVertexId);
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

 const One = () => {
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


      let parentVertex: Vertex | undefined;
      let childrenItems: dxTreeViewItem[];
      if (e.dropInsideItem) {
       parentVertex = graph.vertexes[toNode?.itemData!.id!];
       childrenItems = toNode!.itemData![itemsExpr];
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
        parentVertex = graph.vertexes[toNode!.parent.itemData.id]
       } else if (toNode === null) {
        parentVertex = pageConfig[0].record?.vertex;
       }
      }

      const rowId = componentDrag(fromNode!.itemData!.id as number,  toIndex, parentVertex, childrenItems);
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
 const Two = () => {
  return      <div ref={el => {
   onMount(() => {
    new dxSortable(el, {
     data: "collectionFields", // identifier
     group: "componentDrag",
     allowDropInsideItem: true,
     allowReordering: true,
     filter: ".dx-treeview-item",
     onDragChange(e) {
      if (e.fromComponent === e.toComponent) {
       const nodes = e.element.querySelectorAll(".dx-treeview-node");
       if (!e.fromIndex || !e.toIndex) return;
       const parent = nodes[e.fromIndex];
       const child = nodes[e.toIndex];
       const isDescendant = parent.contains(child);
       if (isDescendant) {
        e.cancel = true;
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
      if (e.fromComponent === e.toComponent && e.fromIndex === e.toIndex) {
       return;
      }

      const fromTreeView = getTreeView(e.fromData);
      const toTreeView = getTreeView(e.toData);
      if (!fromTreeView || !toTreeView) return;

      const fromNode = findNode(fromTreeView, e.fromIndex);
      const toNode = findNode(toTreeView, calculateToIndex(e));

      const fromItems = fromTreeView.option("items");
      const toItems = toTreeView.option("items");

      // TODO: disable dropping Component Category Node
      // toNode === null means end of the list

      const fromTopVisibleNode = getTopVisibleNode(e.fromComponent as dxSortable);
      const toTopVisibleNode = getTopVisibleNode(e.toComponent as dxSortable);
      moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem);
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
      // This is very slow, because we have very big data.
      return;
      const data = getTreeData({
       collection: "Coll",
       // TODO: First level add Incoming Fields.
       child: { collection: "->Attr",
        child: {
         collection: "->Attr",
         child: { collection: "->Attr", child: { collection: "->Attr" } }
        }
       }
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
       // width: 200,
       // searchEnabled: true,
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

 const Four = () => {
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
       // add new adge.
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
       onItemClick(e) {

       }
      });
     });
    }}
   />
  </div>
 }
 return (
  <div class="flex">
   <div class="border:1|solid|blue-60 p:10 m:5 flex:col">
    <div class="mb:10">Components:</div>
    <One/>

    <div class="bt:1|solid|gray p:10 mt:5 flex-grow:1">
     Collection Fields
     <Two/>
    </div>
   </div>

   <div
    class="border:1|solid|blue-60 p:10 m:5 min-w:400 flex-grow:1"
    // Native Drop
    // ondragover={e => e.preventDefault()}
    // onDrop={e => {
    //  e.preventDefault();
    //  const vertexId = e.dataTransfer?.getData("text/plain");
    //  if (vertexId) {
    //   const attrMeta = getChildVertexes(["MetaAttr"], [pageConfig[0].record.metaVertex]).vertexes;
    //   if (!attrMeta) return;
    //   const attrMetaVertex = attrMeta.find(vertex => vertex.P.name === "Attr")!;
    //   const rowResult = pageConfig[0].record.addNewRowUI(attrMetaVertex, pageConfig[0].record.vertex, {});
    //   const rowVertex = graph.vertexes[rowResult.vertexId!];
    //   const attrAttrMeta = getChildVertexes(["MetaAttr"], [attrMetaVertex]).vertexes;
    //   if (!attrAttrMeta) return;
    //   const attrAttrMetaVertex = attrAttrMeta.find(vertex => vertex.P.name === "Comp")!;
    //   setSelectionValue(pageConfig[0].record.txnId, rowVertex, attrAttrMetaVertex, parseInt(vertexId));
    //  }
    // }}
    ref={el => {
     // https://js.devexpress.com/Demos/WidgetsGallery/Demo/TreeView/DragAndDropHierarchicalDataStructure/jQuery/Light/
     new dxDraggable(el, {
      data: "preview", // identifier
      group: "componentDrag",
      allowDropInsideItem: true,
      allowReordering: true,
      // filter: ".dx-treeview-item",
      // itemOrientation: "vertical",
      onDragChange(e) {
       if (e.fromComponent === e.toComponent) {
        const nodes = e.element.querySelectorAll(".dx-treeview-node");
        if (!e.fromIndex || !e.toIndex) return;
        const parent = nodes[e.fromIndex];
        const child = nodes[e.toIndex];
        const isDescendant = parent.contains(child);
        if (isDescendant) {
         e.cancel = true;
        }
       }
      },
      onDragStart: (e) => {
       console.log("start");
       // e.itemData = e.fromData[e.fromIndex];
       // if(e.itemData.Task_Status === "Not Started") {
       //  e.cancel = true;
       // }
      },
      onDragMove: (e) => {
       console.log("move");
      },
      onDragEnd: (e) => {
       console.log("end");
      }
     });
    }}
   >
    <div class={"text:center mb:12"} onClick={rerender}>Preview</div>
    <PageContext.Provider value={{ events: {} }}>
     <Show when={count() && pageConfig[0].record?.vertex && count()} keyed>
      <PageItemRender metaVertex={pageConfig[0].record.vertex} />
     </Show>
    </PageContext.Provider>
   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 flex flex:col">
    <Four/>

    <AbstractSingleForm
     formId={"Page"}
     id={params.id}
     config={pageConfig}
     // TODO: add dry option
    />
    <div class="bt:1|solid|gray p:10 mt:5 flex-grow:1">
     <div class={"mb:12"}>Properties</div>
    </div>
   </div>

  </div>
 );
};