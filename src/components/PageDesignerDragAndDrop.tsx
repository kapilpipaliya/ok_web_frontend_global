// TODO: make multiple Fields Drag and Drop once.
import { useParams } from "@solidjs/router";
import { createStore, reconcile } from "solid-js/store";
import { getCompProps, getRowProps } from "../lib/Record";
import {
  addNewRow,
  addMetaVertexes,
  FieldAttribute,
  getChildVertex,
  getChildVertexes,
  Record,
  getSelectionOptions,
  setValueGlobal,
  getParentVertex,
} from "../lib/Utils";
import {
  batch,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  Switch,
  Match,
  onMount,
  Show,
  useContext,
  JSX,
  createMemo,
} from "solid-js";
import { PageView } from "./input/GenaricField";
import { GenericField } from "./input/Components/GenericFieldComponent";

import { deleteNestedLayout, getTreeData } from "../lib/Traverse";

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
import { AbstractSingleForm } from "./DynamicForm";
import { SelectInputField, setParentValue } from "./input/SelectInputField";
import {
  addNewVertex,
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties,
} from "../lib/Vertex";
import { WsContext } from "../utils/ws_events_dispatcher";
import { Portal } from "solid-js/web";
import { TableInputField } from "./input/TableInputField";
import { AttrsTableData } from "../lib/api";
import { GenericInputField } from "./input/GenaricInputField";
import JsxParser from "../lib/jsx_parser/source/components/JsxParser";
import { FormGroupProperties } from "../pages/FormsAdmin";
import { createDragHandle } from "./solid_dnd_directive";

import { TableTabs } from "./TableTabs";
import { Icon } from "@iconify-icon/solid";
import { hoverId, selectedId, setHoverId, setSelectedId } from "./pageStore";
import jsep from "jsep";
import { setSelectionValue } from "./input/SelectionUtils";
import { evaluate } from "../lib/jsep";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TextField,
} from "./solid-blocks/blocks";

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
    replaceVertexProperties(txnId, layoutRowId, initialValues);
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
    const attrMetaVertex = newVertex(getNewTxnId(), [], {
      name: "Attr",
      component: "Table",
      tab: "Attribute",
      props: {
        type: "Attr",
        label: "Attr",
      },
    });
    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      parentVertex,
      toIndex ? { pos: toIndex } : {},
      false,
      {} as any
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
      const attrCompMetaVertex = newVertex(getNewTxnId(), [], {
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
      // set Collection Attribute to the row
      const attMetaVertex = newVertex(getNewTxnId(), [], {
        name: "Att",
        displayName: "Attribute",
        component: "SelectBox",
        props: {
          displayExpr: "$P.displayName ($P.name)",
          collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
        },
      });
      setSelectionValue(txnId, rowVertex, attMetaVertex, fromVertex.id);
      // TODO add comp prop default values
      // addPropsToLayoutRow(pageConfig[0].record.txnId, rowVertex.id, formVertex);
    }

    return rowResult.vertexId!;
  }
  return -1;
};

export function sortChildren(childrenItems: dxTreeViewItem[], txnId: number) {
  if (!childrenItems) return;
  for (let i = 0; i < childrenItems.length; i++) {
    const child = childrenItems[i];
    mergeVertexProperties(txnId, child.id! as number, { pos: i + 1 });
  }
}

// @ts-ignore

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
    if (valueSet ?? true) mergeVertexProperties(txnId, row.id, { value });
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
      const properties = valueSet ?? true ? { value } : {};
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
          { P: { name: "Name" } } as unknown as Vertex,
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
                                                            collection:
                                                              "->Attr",
                                                            child: {
                                                              collection:
                                                                "->Attr",
                                                              child: {
                                                                collection:
                                                                  "->Attr",
                                                                child: {
                                                                  collection:
                                                                    "->Attr",
                                                                  child: {
                                                                    collection:
                                                                      "->Attr",
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function getChildrenAttrs(child: Vertex) {
  return (evaluate(jsep("->Attr"), { vertexes: [child] }) || []).sort(
    (a, b) => a.P.pos - b.P.pos
  );
}

export const PageDesignerDragAndDrop = () => {
  const itemsExpr = "children";
  const params = useParams();
  const pageConfig = createStore({} as { record: Record });
  const [count, setCount] = createSignal(1);
  const { Ws } = useContext(WsContext);
  const [isFormOpen, setIsFormOpen] = createSignal(true);
  const [isLayoutOpen, setIsLayoutOpen] = createSignal(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = createSignal(false);

  const [selectedComponent, setSelectedComponent] = createSignal({
    vertexId: -1,
  });
  const [draggedVertex, setDraggedVertex] = createSignal<Vertex | null>(null);

  // @ts-ignore
  const [selectedColl, setSelectedColl] = createSignal({ vertexId: -1 });
  const rerender = () => {
    setCount((prev) => prev + 1);
  };

  /* let componentsTreeViewInstance: TreeView;
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
        return <div ref={el => {
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

                        const rowId = componentDrag(pageConfig[0].record.txnId, fromVertex, toIndex, parentAttrVertex || pageConfig[0].record.vertex);
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
                        const data = getTreeData({
                            collection: "g:'CompCategory'",
                            // TODO: Dont display "Form" Component
                            child: {collection: "->CompCategoryComp"}
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
    }*/

  const OneComponents0 = () => {
    const data = getTreeData({
      collection: "g:'CompCategory'",
      // TODO: Dont display "Form" Component
      child: { collection: "->CompCategoryComp" },
    });

    const [searchQuery, setSearchQuery] = createSignal("");
    const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

  
    const titleStyle: JSX.CSSProperties = {
      "font-size": "15px",
      "font-weight": "bold",
      "margin-bottom": "8px",
      "margin-top": "8px",
    };

    const listStyle: JSX.CSSProperties = {
      "list-style-type": "none",
      padding: "0",
    };

    const listBoxStyle: JSX.CSSProperties = {
      display: "grid",
      "grid-template-columns": "repeat(2, 1fr)",
      gap: "10px",
    };
    const iconMap = {
      TextInput: "streamline:input-box",
      Icon: "mynaui:letter-i-hexagon",
      Image: "mage:image",
      A: "ph:link-bold",
      Text: "ci:text",
      Repeater: "formkit:repeater",
      Page: "fluent:document-one-page-20-regular",
      Box: "radix-icons:box",
      ProgressBar: "carbon:progress-bar",
      LoadIndicator: "ep:loading",
      SelectBox: "radix-icons:dropdown-menu",
      TagBox: "radix-icons:dropdown-menu",
      Tabs: "material-symbols-light:tabs-outline",
      Button: "formkit:button",
      Breadcrumb: "tdesign:component-breadcrumb",
      Autocomplete: "fluent-mdl2:completed",
      CheckBox: "tabler:checkbox",
      ColorBox: "ic:outline-color-lens",
      DateBox: "circum:calendar-date",
      FileUploader: "arcticons:custom-uploader",
      Form: "lets-icons:form-duotone",
      NumberBox: "fluent-emoji-high-contrast:input-numbers",
      RadioGroup: "fluent:radio-button-16-filled",
      Switch: "iconoir:switch-off",
      HtmlEditor: "mdi:code-block-html",
      Table: "tabler:table",
      TextArea: "bi:textarea",
      TextBox: "ph:textbox",
      ScrollView: "mdi:scroll",
    };

    // Function to get icon by category
    function getIconByCategory(category: any) {
      return (
        <Icon
          icon={iconMap[category] ?? "material-symbols:widgets-outline-rounded"}
          width="20"
          height="20"
        />
      ); // Returns null if category is not found
    }
    const updateFilteredData = () => {
      if (!searchQuery()) {
        setFilteredData(data);
      } else {
        const filteredData = data
          .map((item) => {
            // Filter the children of each item based on the searchQuery
            const category = data.find((i) => i.name === item.name);

            if (category) {
              // Create a copy of the category's children array
              const filteredChildren = category.children.filter(
                (child: any) => {
                  return (
                    child.name &&
                    child.name
                      .toLowerCase()
                      .includes(searchQuery().toLowerCase())
                  );
                }
              );

              // Return a new object with the filtered children
              return {
                ...item,
                children: filteredChildren,
              };
            } else {
              return item;
            }
          })
          .filter((item) => item.children.length > 0); // Filter out items with no matching children

        setFilteredData(filteredData);
      }
    };
    function ListItemComponent({ child, getIconByCategory }) {
      const [isHovered, setIsHovered] = createSignal(false);

      const baseStyle = {
        "border-radius": ".2rem",
        "margin-left": "3px",
        "margin-right": "3px",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        padding: "10px",
        "background-color": "white",
        display: "flex",
        "flex-direction": "row",
        "align-items": "center",
        "justify-content": "space-between",
        height: "35px",
        "box-shadow": "rgba(0, 0, 0, 0.2) 1px 1px 1px 1px",
      };

      const hoverStyle = {
        "background-color": "#F2EDED",
        cursor: "move",
        boxShadow: "4px 4px 4px",
      };

      const itemStyle = () =>
        isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

      return (
        <div
          style={itemStyle()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedVertex(graph.vertexes[child.id]);
          }}
        >
          <div class="pt:5px">{getIconByCategory(child?.name)}</div>
          <div style={{ "font-size": "14px" }}>{child?.name}</div>
        </div>
      );
    }
    return (
      <div>
        <TextField
          label="Name"
          class="b:1|solid|blue-30 r:5|5|5|5 p:4"
          type="text"
          placeholder="Search Component..."
          value={searchQuery()}
          onInput={(e) => {
            setSearchQuery(e.target.value);
            updateFilteredData(); // Update filteredData when searchQuery changes
          }}
        />
        <div class="h:30rem w:20rem overflow-y:auto overflow-x:auto">
          <For
            each={filteredData()}
            fallback={
              <div class="p:3 font-weight:bold">No Component Found !</div>
            }
          >
            {(item) => (
              <div>
                <div style={titleStyle}>{item.name}</div>
                <ul style={{ ...listBoxStyle, ...listStyle }}>
                  <For each={item.children}>
                    {(child) => (
                      <ListItemComponent
                        child={child}
                        getIconByCategory={getIconByCategory}
                      />
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>
      </div>
    );
  };
  /*const TwoCollections = () => {
        return <div ref={el => {
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

                        const rowId = componentDrag(pageConfig[0].record.txnId, fromVertex, toIndex, parentAttrVertex!);
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
                        for (let i = 0; i < childrenItems.length; i++) {
                            const child = childrenItems[i];
                            mergeVertexProperties(pageConfig[0].record.txnId, child.id! as number, {pos: i + 1});
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
    }*/

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

  function getLayoutTreeData() {
    return getTreeData(
      getLayoutTreeJson(),
      pageConfig[0].record?.vertex ? [pageConfig[0].record.vertex] : [],
      {
        nameExpr: (v: Vertex) => {
          const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
          return `${v.P.name}${component ? ` (${component})` : ""}`;
        },
      }
    );
  }

  /*const FourLayout = () => {
        return <div ref={el => {
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

                        if (!e.dropInsideItem && fromNode?.parent === toNode?.parent) {
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
                                const toParentVertex = toNode === null ? pageConfig[0].record?.vertex : getParentVertex(['Attr'], graph.vertexes[toId!]).vertex;
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
                            onItemClick: function (args) {
                                // @ts-ignore
                                selectedElement = args.itemElement!.parentElement!
                                if (!args.itemData?.id) {
                                    alert('Layout Id not Found');
                                    return;
                                }
                                batch(() => {
                                    setSelectedId(-1);
                                    setSelectedComponent({vertexId: -1});
                                    setSelectedColl({vertexId: -1});

                                    setSelectedId(args.itemData!.id! as number);
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
    }*/

  const FourLayout1 = () => {
    const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);
    const [hiddenNodes, setHiddenNodes] = createSignal([] as Id[]);

    const [indicatorPosition, setIndicatorPosition] = createSignal({
      activeItem: null as null | Id,
      position: null as "before" | "after" | "center" | null,
    });

    const toggleExpand = (itemId: number) => {
      setCollapsedKeys((prev) =>
        prev.includes(itemId)
          ? prev.filter((item) => item !== itemId)
          : [...prev, itemId]
      );
    };
    const toggleHidden = (itemId: number) => {
      setHiddenNodes((prev) =>
        prev.includes(itemId)
          ? prev.filter((item) => item !== itemId)
          : [...prev, itemId]
      );
    };

    const TreeView = (props: { vertex: Vertex }) => {
      const child = () => graph.vertexes[props.vertex.id];
      const children = createMemo(() => getChildrenAttrs(child()));
      const isActiveItem = () =>
        indicatorPosition().activeItem === props.vertex.id;

      const indicatorStyles = `width:100% height:2px background-color:green z-index:9999`;
      // background-color: red; /* Change color as needed */
      // z-index: 9999; /* Ensure it's above other elements */

      const indicatorPositionStyles = () => {
        if (isActiveItem() && indicatorPosition().position === "before") {
          // return indicatorStyles + ' top:0'
        } else if (isActiveItem() && indicatorPosition().position === "after") {
          // return indicatorStyles + ' bottom:0';
        } else if (
          isActiveItem() &&
          indicatorPosition().position === "center"
        ) {
          // return indicatorStyles +  ` top:50% transform:translateY(-50%)`
        }
        return indicatorStyles;
      };

      const handleDragStart = (e: DragEvent) => {
        e.stopPropagation();
        setDraggedVertex(props.vertex);
      };

      const handleDragOverBase = (e: DragEvent) => {
        let position = getIndicatorPosition(e, e.currentTarget as HTMLElement);

        let activeItem: Id;
        if (position === "before") {
          activeItem = props.vertex.id;
        } else if (position === "after") {
          if (collapsedKeys().includes(props.vertex.id)) {
            // collapsed state
            activeItem = props.vertex.id;
          } else {
            // expanded State
            if (children().length) {
              activeItem = children()[0].id;
              position = "before";
            } else {
              activeItem = props.vertex.id;
            }
          }
        } else {
          // drop over
          activeItem = props.vertex.id;
        }

        setIndicatorPosition({ activeItem, position });
      };

      const handleDragEnter = (e: DragEvent) => {
        // e.stopPropagation();
        console.log("enter", props.vertex.id);
        handleDragOverBase(e);
      };

      const handleDragOver = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleDragOverBase(e);
      };

      const handleDragLeave = (e: DragEvent) => {
        // e.stopPropagation();
        // setIndicatorPosition({});
        // console.log('leave',props.vertex.id)
        // Do not uncomment this, because drag is called before on drop
        // setDraggedVertex(null);
      };

      const handleDrop = (e: DragEvent) => {
        console.log("drop");
        e.stopPropagation();

        let fromVertex = draggedVertex();
        const toVertexId = indicatorPosition().activeItem!;
        const toVertex = graph.vertexes[toVertexId]; // props.vertex;
        if (!fromVertex) {
          alert("from vertex not found");
          return;
        }
        const fromVertexLabel = fromVertex.L[0];
        const txnId = pageConfig[0].record.txnId;
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
          } else {
          }

          const parentVertex =
            position !== "center"
              ? getParentVertex(["Attr"], toVertex).vertex!
              : toVertex;

          const rowId = componentDrag(
            pageConfig[0].record.txnId,
            fromVertex,
            parentVertex || pageConfig[0].record.vertex
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

          ///sortChildren(childrenItems, pageConfig[0].record.txnId);
        } else {
          // remove previous incoming edge if present.
          if (fromParentVertex.vertex) {
            setParentValue(pageConfig[0].record.txnId, fromVertex, {
              P: { props: { type: "Attr" } },
            } as unknown as Vertex);
          }
          // add new edge.
          if (position === "center") {
            setParentValue(
              pageConfig[0].record.txnId,
              fromVertex,
              { P: { props: { type: "Attr" } } } as unknown as Vertex,
              toVertexId
            );
            mergeVertexProperties(txnId, fromVertex!.id, { pos: 9999999 }); // move to end
          } else {
            setParentValue(
              pageConfig[0].record.txnId,
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
      };

      const getIndicatorPosition = (e: MouseEvent, node: HTMLElement) => {
        const bounds = node.getBoundingClientRect();
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

      return (
        <div>
          <Show
            when={isActiveItem() && indicatorPosition().position === "before"}
          >
            <div class={`${indicatorPositionStyles()}`} />
          </Show>
          <div
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={
              props.vertex.id === selectedId()
                ? "bg:lightblue"
                : props.vertex.id === hoverId()
                ? "bg:lightgray"
                : ""
            }
            classList={{
              "b:1px":
                isActiveItem() && indicatorPosition().position === "center",
            }}
            onClick={(e) => {
              batch(() => {
                setSelectedId(-1);
                setSelectedComponent({ vertexId: -1 });
                setSelectedColl({ vertexId: -1 });

                setSelectedId(props.vertex.id);
                setIsPropertiesOpen(true);
                const collVertex = getChildVertex(
                  ["$0Coll"],
                  graph.vertexes[props.vertex!.id!]
                );
                setSelectedColl({ vertexId: collVertex?.vertex?.id || -1 });
                const componentVertex = getComponentFromLayoutRow(
                  props.vertex!.id!
                );
                setSelectedComponent({ vertexId: componentVertex?.id || -1 });
              });
            }}
            onMouseOver={(e) => {
              e.stopPropagation();
              setHoverId(props.vertex.id);
            }}
            style={{
              "font-weight": children().length ? "bold" : "normal",
              "margin-left": !children().length ? "10px" : "0px",
              "align-items": "center",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHidden(props.vertex.id);
              }}
            >
              <Show
                when={!hiddenNodes().includes(props.vertex.id)}
                fallback={
                  <Icon
                    icon="mdi:eye-off-outline"
                    class="transition: 0.5s ease-in-out;"
                  />
                }
              >
                <Icon
                  icon="mdi:eye-outline"
                  class="transition: 0.5s ease-in-out;"
                />
              </Show>
            </button>
            <Show when={children().length}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(props.vertex.id);
                }}
              >
                <Show
                  when={!collapsedKeys().includes(props.vertex.id)}
                  fallback={<Icon icon="mdi:plus" />}
                >
                  <Icon icon="mdi:minus" class={"transform 1s ease-in-out"} />
                </Show>
              </button>
            </Show>
            {nameExpr(child()) || child().P.name}
          </div>
          <Show
            when={isActiveItem() && indicatorPosition().position === "after"}
          >
            <div class={`${indicatorPositionStyles()}`} />
          </Show>
          <Show
            when={
              !collapsedKeys().includes(props.vertex.id) &&
              children().length > 0
            }
          >
            <ul class="p:10">
              <For each={children()}>
                {(vertex) => <TreeView vertex={vertex} />}
              </For>
            </ul>
          </Show>
        </div>
      );
    };

    const rootVertexes = () =>
      pageConfig[0].record?.vertex ? [pageConfig[0].record.vertex] : []; // Starting point(s)
    const nameExpr = (v: Vertex) => {
      const component = getChildVertex(["$0Comp"], v).vertex?.P.name;
      return `${v.P.name}${component ? ` (${component})` : ""}`;
    };

    return (
      <>
        <For each={rootVertexes()}>{(item) => <TreeView vertex={item} />}</For>
      </>
    );
  };

  const FiveProperties = () => {
    const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
    const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);
    const vertexId = getNewGraphId();
    const addNewVertexResult = addNewVertex(
      0,
      newVertex(vertexId, ["PropsJson"], { sample: true })
    );
    if (addNewVertexResult.error) {
      console.warn("error while inserting");
    }

    createEffect(
      on(selectedComponent, (v) => {
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
          setGraph("vertexes", vertexId, "P", reconcile(layoutPropRow));
        } else {
          setGraph("vertexes", vertexId, "P", reconcile({}));
        }
      })
    );

    const setPropertyValue = (
      meta: Vertex,
      data: Vertex,
      value: any,
      valueSet?: boolean
    ) => {
      if (selectedId() !== -1 && selectedComponent().vertexId !== -1) {
        if (valueSet ?? true)
          setGraph("vertexes", data.id, "P", meta.P.name, value);
        return setPropertyValueGlobal(
          pageConfig[0].record.txnId,
          meta,
          graph.vertexes[selectedId()],
          graph.vertexes[selectedComponent().vertexId],
          value,
          valueSet
        );
      }
      return;
    };
    const selectedComponentProperties = () => {
      const selectedComp = graph.vertexes[selectedComponent().vertexId];

      if (!selectedComp) {
        return { error: true };
      }

      return getChildVertexes(["$0Prop"], [selectedComp]);
    };

    const toggleRulesModal = () => setIsRulesModalOpen((prev) => !prev);
    const toggleImportsModal = () => setIsImportModalOpen((prev) => !prev);
    let prevTxnIndex = -1;
    const onRulesSubmit = () => {
      // hack to refresh the select fields. no option is refereshing the label.
      setGraph("vertexes", selectedId(), "OUT", "Rules", (v) =>
        v ? [...v] : v
      );
      toggleRulesModal();
    };
    const onRulesCancel = () => {
      if (prevTxnIndex !== -1)
        revertTransactionUpTo(pageConfig[0].record.txnId, prevTxnIndex);
      toggleRulesModal();
    };
    const onImportsSubmit = () => {
      // reset layout
      // layoutTreeViewInstance.option("items", getLayoutTreeData());
      // hack to refresh the select fields. no option is refereshing the label.
      setGraph("vertexes", selectedId(), "OUT", "Rules", (v) =>
        v ? [...v] : v
      );
      toggleImportsModal();
    };
    const onImportsCancel = () => {
      if (prevTxnIndex !== -1)
        revertTransactionUpTo(pageConfig[0].record.txnId, prevTxnIndex);
      // reset layout
      // layoutTreeViewInstance.option("items", getLayoutTreeData());
      toggleImportsModal();
    };

    const RulesModalBody = () => {
      prevTxnIndex =
        transactions.get(pageConfig[0].record.txnId)?.steps?.length || 0;

      const metaVertexId = getNewGraphId();
      const txnId = getNewTxnId();
      const metaAttributes = AttrsTableData.Coll.attributes.find(
        (x) => x.name === "Rules"
      );

      addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
          name: metaAttributes?.name,
          props: metaAttributes?.props,
        })
      );
      const attributes: FieldAttribute[] = JSON.parse(
        JSON.stringify(metaAttributes!.attributes!)
      );

      for (const attribute of attributes) {
        if (attribute.name === "Rule") {
          for (const ruleattribute of attribute.attributes!) {
            if (ruleattribute.name === "cond") {
              for (const condAttribute of ruleattribute.attributes!) {
                if (condAttribute.name === "layout") {
                  const data = getTreeData(
                    {
                      collection: "->Attr",
                      child: {
                        collection: "->Attr",
                        child: {
                          collection: "->Attr",
                          child: {
                            collection: "->Attr",
                            child: { collection: "->Attr" },
                          },
                        },
                      },
                    },
                    pageConfig[0].record?.vertex
                      ? [pageConfig[0].record.vertex]
                      : [],
                    {
                      nameExpr: (v: Vertex) => {
                        const component = getChildVertex(["$0Comp"], v).vertex
                          ?.P.name;
                        return `${v.P.name}${
                          component ? ` (${component})` : ""
                        }`;
                      },
                    }
                  );

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
                      selectionMode: "single",
                      // width: 200,
                      // searchEnabled: true,
                      // activeStateEnabled: false,
                      // focusStateEnabled: false,
                      expandNodesRecursive: false,
                    },
                  };
                }
              }
            }
          }
        }
      }

      addMetaVertexes(txnId, graph.vertexes[metaVertexId], attributes);
      onCleanup(() => {
        revertTransaction(txnId);
      });

      return (
        <TableInputField
          meta={graph.vertexes[metaVertexId]}
          data={graph.vertexes[selectedId()!]}
          txnId={pageConfig[0].record.txnId}
          setValue={pageConfig[0].record.setValue}
          isRealTime={false}
        />
      );
    };
    const ImportModalBody = () => {
      prevTxnIndex =
        transactions.get(pageConfig[0].record.txnId)?.steps?.length || 0;

      const metaVertexId = getNewGraphId();
      const dataVertexId = getNewGraphId();

      setGraph("vertexes", metaVertexId, {
        P: { name: "jsx", props: { width: 700, height: 700 } },
      });
      setGraph("vertexes", dataVertexId, { id: dataVertexId, P: {} });

      onCleanup(() => {
        // @ts-ignore
        setGraph("vertexes", metaVertexId, undefined);
        // @ts-ignore
        setGraph("vertexes", dataVertexId, undefined);
      });
      const footerButtons = [
        {
          meta: {
            P: {
              component: "Button",
              props: { children: "Import", variant: "primary" },
            },
          } as any,
          onClick: () => {
            const jsxParser = new JsxParser({
              showWarnings: true,
              txnId: pageConfig[0].record.txnId,
              jsx: graph.vertexes[dataVertexId].P.jsx || "",
              parent: graph.vertexes[selectedId()],
            });
            jsxParser.render();
            // reset layout
            // layoutTreeViewInstance.option("items", getLayoutTreeData());
          },
        },
        {
          meta: {
            P: {
              component: "Button",
              props: { type: "primary", children: "Submit" },
            },
          } as any,
          onClick: () => onImportsSubmit,
        },
        {
          meta: {
            P: {
              component: "Button",
              props: { variant: "secondary", children: "Cancel" },
            },
          } as any,
          onClick: () => onImportsCancel,
        },
      ];
      return (
        <>
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
                  <GenericInputField
                    txnId={dataVertexId}
                    component="TextArea"
                    meta={graph.vertexes[metaVertexId]}
                    data={graph.vertexes[dataVertexId]}
                    setValue={(attribute: Vertex, vertex: Vertex, data: any) =>
                      setGraph("vertexes", vertex.id, "P", { jsx: data })
                    }
                    disabled={false}
                  />
                </ModalBody>
                <ModalFooter>
                  <div
                    style={{
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <For each={footerButtons}>
                      {(item) => (
                        <GenericField meta={item.meta} onClick={item.onClick} />
                      )}
                    </For>
                  </div>
                </ModalFooter>
              </ModalContent>
            </div>
          </Portal>
        </>
      );
    };

    const CollAndData = () => {
      const metaVertexId = getNewGraphId();
      const txnId = getNewTxnId();

      addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
          name: "Attr",
          props: {
            type: "Attr",
            label: "Attr",
          },
        })
      );
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

      return (
        <>
          <br />
          <span>Collection:</span>
          <SelectInputField
            data={graph.vertexes[selectedId()!]}
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
            data={graph.vertexes[selectedId()!]}
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
            txnId={txnId}
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![2]!}
            disabled={false}
            component={"TextBox"}
            setValue={pageConfig[0].record.setValue}
          />
        </>
      );
    };

    return (
      <>
        <Show when={selectedId() !== -1}>
          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  props: { children: "Rules", onClick: () => toggleRulesModal },
                },
              } as any
            }
          />
          &nbsp;&nbsp;
          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  props: {
                    children: "Import",
                    onClick: () => toggleImportsModal,
                  },
                },
              } as any
            }
          />
          <CollAndData />
          <FormGroupProperties
            txnId={pageConfig[0].record.txnId}
            metaAttributes={selectedComponentProperties().vertexes || []}
            vertex={graph.vertexes[vertexId]}
            setValue={setPropertyValue}
            setValueGeneric={(attribute: Vertex, vertex: Vertex, data: any) =>
              setValueGlobal(
                pageConfig[0].record.txnId,
                attribute,
                vertex,
                data,
                Ws,
                pageConfig[0].record.isRealTime
              )
            }
            selectedLayout={graph.vertexes[selectedId()]}
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
                  <RulesModalBody />
                </ModalBody>
                <ModalFooter>
                  {/*<Button onclick={toggleRulesModal}>OK</Button>*/}
                  <div
                    style={{
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <GenericField
                      meta={
                        {
                          P: {
                            component: "Button",
                            props: {
                              children: "Submit",
                              onClick: () => onRulesSubmit,
                            },
                          },
                        } as any
                      }
                    />

                    <GenericField
                      meta={
                        {
                          P: {
                            component: "Button",
                            props: {
                              children: "Cancel",
                              onClick: () => onRulesCancel,
                            },
                          },
                        } as any
                      }
                    />
                  </div>
                </ModalFooter>
              </ModalContent>
            </div>
          </Portal>
        </Show>
        <Show when={isImportModalOpen()}>
          <ImportModalBody />
        </Show>
      </>
    );
  };
  const deleteLayout = () => {
    if (selectedId() !== -1) {
      const layoutVertexId = selectedId();
      batch(() => {
        setSelectedId(-1);
        setSelectedComponent({ vertexId: -1 });
        setSelectedColl({ vertexId: -1 });
      });

      deleteNestedLayout(pageConfig[0].record.txnId, [
        graph.vertexes[layoutVertexId],
      ]);
      /*
               const layoutItemIndex = selectedLayout().itemIndex;
               const fromNode = findNode(layoutTreeViewInstance, layoutItemIndex!);
               const fromItems = layoutTreeViewInstance.option("items");
               if (!fromItems) return;
               const fromIndex = findIndex(fromItems, fromNode!.itemData!.id as string);
               fromItems?.splice(fromIndex, 1);*/

      // reset layout
      // layoutTreeViewInstance.option("items", getLayoutTreeData());
    }
  };
  const onClickLayout = () => {
    setIsLayoutOpen(!isLayoutOpen());
  };

  const onClickForm = () => {
    setIsFormOpen(!isFormOpen());
  };

  const onClickProperties = () => {
    setIsPropertiesOpen(!isPropertiesOpen());
  };

  onCleanup(() => {
    batch(() => {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });
    });
  });

  const [className, setClassName] = createSignal(
    "overflow:auto mx:auto w:412px h:800px border:1|solid|blue-60 m:1rem r:5|5|5|5"
  );
  const mobileClass =
    "overflow:auto mx:auto w:412px h:800px border:1|solid|blue-60 m:1rem";
  const webClass =
    "border:1|solid|blue-60 m:1rem h:800px overflow:auto mx:auto";
  const tabs = ["Mobile Preview", "Web Preview"];

  const [activeTab, setActiveTab] = createSignal(tabs[0]);

  createEffect(() => {
    setClassName(activeTab() === tabs[0] ? mobileClass : webClass);
  });

  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "collection"].map((column) => ({
      id: column,
      name: column,
    }))
  );
  const [rightColumns, setRightColumns] = createSignal(
    ["layout", "properties", "form"].map((column) => ({
      id: column,
      name: column,
    }))
  );

  const oneComponents0 = <OneComponents0 />;
  // const oneComponents = <OneComponents/>;
  const twoCollections = <div></div>; //<TwoCollections/>;
  const fourLayout = <div />;
  const fourLayout1 = <FourLayout1 />;
  const fiveProperties = <FiveProperties />;
  const abstractSingleForm = (
    <AbstractSingleForm
      formId={"Page"}
      id={params.id}
      config={pageConfig}
      showMainFieldsOnly={true}
      importExportButtons={false}
    />
  );
  const { dragHandleZone: dragHandleZone1, dragHandle: dragHandle1 } =
    createDragHandle();
  const { dragHandleZone: dragHandleZone2, dragHandle: dragHandle2 } =
    createDragHandle();
  // @ts-ignore
  dragHandleZone1, dragHandleZone2, dragHandle1, dragHandle2;

  const Column = (props: {
    type: string;
    dragHandler: (node: HTMLElement) => void;
  }) => {
    const dragHandle = (el: HTMLElement) => props.dragHandler(el);
    return (
      <>
        <div class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5">
          <Switch>
            <Match when={props.type === "components"}>
              <div class="mb:10" style="font-weight: bold" use:dragHandle>
                Components
              </div>
              {oneComponents0}
              {/*{oneComponents}*/}
            </Match>
            <Match when={props.type === "collection"}>
              <div class="mb:10" style="font-weight: bold" use:dragHandle>
                Collection Fields
              </div>
              {twoCollections}
            </Match>
            <Match when={props.type === "layout"}>
              <div
                class="mb:12"
                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out"
              >
                <div
                  style="cursor: pointer; flex-grow: 1; font-weight: bold"
                  onClick={onClickLayout}
                >
                  Layout
                </div>
                <div style="cursor: pointer;" onClick={onClickLayout}>
                  <Icon
                    icon={"mdi:chevron-up"}
                    style={{
                      "font-size": "24px",
                      "border-radius": "50%",
                      "margin-left": "5px",
                      transition: "transform 0.2s linear",
                      transform: `${
                        isLayoutOpen() ? "rotate(0deg)" : "rotate(180deg)"
                      }`,
                    }}
                    class="flex-1"
                  />
                </div>
              </div>

              {isLayoutOpen() && fourLayout1}
            </Match>
            <Match when={props.type === "properties"}>
              <div
                class="mb:12"
                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out"
              >
                <div
                  style="cursor: pointer; flex-grow: 1; font-weight: bold"
                  onClick={onClickProperties}
                >
                  Properties
                </div>
                <Show when={selectedId() !== -1}>
                  <GenericField
                    meta={
                      {
                        P: {
                          component: "Icon",
                          props: {
                            style: { color: "red" },
                            onClick: () => deleteLayout(),
                            icon: "fluent:delete-12-regular",
                          },
                        },
                      } as any
                    }
                  />
                  <div style="cursor: pointer;" onClick={onClickProperties}>
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isPropertiesOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                </Show>
              </div>
              {isPropertiesOpen() && fiveProperties}
            </Match>
            <Match when={props.type === "form"}>
              <div
                class="mb:12"
                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out"
              >
                <div
                  style="cursor: pointer; flex-grow: 1; font-weight: bold"
                  onClick={onClickForm}
                >
                  Form
                </div>
                <div style="cursor: pointer;" onClick={onClickForm}>
                  <Icon
                    icon={"mdi:chevron-up"}
                    style={{
                      "font-size": "24px",
                      "border-radius": "50%",
                      "margin-left": "5px",
                      transition: "transform 0.2s linear",
                      transform: `${
                        isFormOpen() ? "rotate(0deg)" : "rotate(180deg)"
                      }`,
                    }}
                    class="flex-1"
                  />
                </div>
              </div>

              {isFormOpen() && abstractSingleForm}
            </Match>
          </Switch>
        </div>
      </>
    );
  };

  return (
    <div class="flex">
      <div
        class="flex-col"
        // @ts-ignore
        //use:dragHandleZone1={{items: ()=>leftColumns(), type: "column", flipDurationMs: 300}} on:consider={(e:any) => setLeftColumns(e.detail.items)} on:finalize={(e: any) => setLeftColumns(e.detail.items)}
      >
        <For each={leftColumns()}>
          {(column) => <Column dragHandler={dragHandle1} type={column.id} />}
        </For>
      </div>
      <div class="flex-grow:1 border:1|solid|blue-60 mt:5 p:10 min-w:400 r:5|5|5|5">
        <div class="flex justify-content:center">
          <TableTabs tabs={tabs} setActiveTab={setActiveTab} />
        </div>
        <div class={className() as string}>
          <PageView number={count()} vertex={pageConfig[0].record?.vertex} />
        </div>
      </div>
      <div
        class="flex-col"
        style={{ width: "30%" }}
        // @ts-ignore
        //use:dragHandleZone2={{items: ()=>rightColumns(), type: "column", flipDurationMs: 300}} on:consider={(e:any) => setRightColumns(e.detail.items)} on:finalize={(e:any) => setRightColumns(e.detail.items)}
      >
        <For each={rightColumns()}>
          {(column) => <Column dragHandler={dragHandle2} type={column.id} />}
        </For>
      </div>
    </div>
  );
};
