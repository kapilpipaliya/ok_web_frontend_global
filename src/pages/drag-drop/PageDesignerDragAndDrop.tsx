import { useParams } from "@solidjs/router";
import { createStore } from "solid-js/store";
import {
  addMetaVertexes,
  FormContext,
  getChildVertex,
  getChildVertexes,
  iconMap,
  nameExpr,
  Record,
} from "~/lib/Utils";
import {
  batch,
  createSelector,
  createSignal,
  For,
  JSX,
  Match,
  onCleanup,
  Show,
  Switch,
  useContext,
} from "solid-js";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";

import { getTreeData } from "~/lib/Traverse";

import {
  getNewGraphId,
  getNewTxnId,
  GraphContext,
  Id,
  IdAttr,
  revertTransaction,
  revertTransactionUpTo,
  transactions,
  Vertex,
} from "~/lib/graph";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import { SelectInputField } from "~/components/dynamic/fields/input/SelectInputField";
import { addNewVertex, newVertex } from "~/lib/Vertex";
import { Portal } from "solid-js/web";
import { TableInputField } from "~/components/dynamic/fields/input/TableInputField";
import { AttrsTableData } from "~/lib/api";
import { GenericInputField } from "~/components/dynamic/fields/input/GenaricInputField";
import JsxParser from "~/lib/jsx_parser/source/components/JsxParser";
import { FormGroupProperties } from "~/pages/form/FormsAdmin";
import { Icon } from "@iconify-icon/solid";
import {
  hiddenNodes,
  hoverId,
  indicatorPosition,
  propertiesVertexId,
  selectedComponent,
  selectedId,
  setDraggedVertex,
  setHiddenNodes,
  setHoverId,
  setPropertyValueGlobal,
  setSelectedColl,
  setSelectedComponent,
  setSelectedId,
  useDragDrop,
} from "~/lib/pageStore";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TextField,
  Tooltip,
} from "../../components/solid-blocks/blocks";
import { toTitle } from "case-switcher-js";
import "~/css/sideBarSearch.css";
import ShareSection from "./Share";
import PreviewSection from "./Preview";
import ResizableContainer from "../../components/custom/ResizableDivView";
import { FieldAttribute } from "~/lib/Type";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";

export const PageDesignerDragAndDrop = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const params = useParams();
  const pageConfig = createStore({} as { record: Record });
  const [count] = createSignal(1);

  const [steps, setSteps] = createSignal([
    { id: 1, name: "Job details", href: "#", status: "current", active: true },
    {
      id: 2,
      name: "Application form",
      href: "#",
      status: "upcoming",
      active: false,
    },
    { id: 3, name: "Preview", href: "#", status: "upcoming", active: false },
  ]);

  // For Expand and collapse section
  const [selectedStepId, setSelectedStepId] = createSignal(1); // Initially set to the first step
  const [isFormOpen, toggleIsFormOpen] = useExpansion(true);
  const [isLayoutOpen, toggleIsLayoutOpen] = useExpansion(true);
  const [isComponentOpen, toggleComponentOpen] = useExpansion(true);
  const [isPagesOpen, togglePagesOpen] = useExpansion(true);
  const [isCollFieldsOpen, toggleCollFieldsOpen] = useExpansion(true);
  const [isPropertiesOpen, toggleIsPropertiesOpen] = useExpansion(true);

  // For Close section
  const [isComponentsExpanded, toggleComponentsExpansion] = useExpansion();
  const [isPagesExpanded, togglePagesExpansion] = useExpansion();
  const [isCollectionExpanded, toggleCollectionExpansion] = useExpansion();
  const [isLayoutExpanded, toggleLayoutExpansion] = useExpansion();
  const [isPropertiesExpanded, togglePropertiesExpansion] = useExpansion();
  const [isFormExpanded, toggleFormExpansion] = useExpansion();

  // @ts-ignore
  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "pages", "collection"].map((column) => ({
      id: column,
      name: column,
    })),
  );
  // @ts-ignore
  const [rightColumns, setRightColumns] = createSignal(
    ["layout", "properties", "form"].map((column) => ({
      id: column,
      name: column,
    })),
  );
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedHoverId = createSelector(hoverId);

  function handleKeyPressed(event: any) {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    if (
      (isMac && event.metaKey && event.key === "z") ||
      (!isMac && event.ctrlKey && event.key === "z")
    ) {
      console.log("CTRL+z");
    }
  }

  window.addEventListener("keydown", handleKeyPressed);
  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyPressed);
    batch(() => {
      setSelectedId(-1);
      setSelectedComponent({ vertexId: -1 });
      setSelectedColl({ vertexId: -1 });
    });
  });

  function useExpansion(defaultValue = true) {
    const [expanded, setExpanded] = createSignal(defaultValue);
    const toggleExpansion = () => setExpanded(!expanded());
    return [expanded, toggleExpansion];
  }

  const ComponentPart = () => {
    const data = getTreeData(graph, setGraph, {
      collection: "g:'CompCategory'",
      // TODO: Dont display "Form" Component
      child: { collection: "->CompCategoryComp" },
    });

    const [searchQuery, setSearchQuery] = createSignal("");
    const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

    const titleStyle: JSX.CSSProperties = {
      "font-size": "15px",
      "font-weight": "bolder",
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

    // Function to get icon by category

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
                },
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

    function ListItemComponent(props: { child: Vertex }) {
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
      } as JSX.CSSProperties;

      const hoverStyle = {
        "background-color": "#F2EDED",
        cursor: "move",
        boxShadow: "4px 4px 4px",
      } as JSX.CSSProperties;

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
            setDraggedVertex(graph.vertexes[props.child.id]);
          }}
        >
          <div class="pt:5px">
            <Icon
              icon={
                iconMap[props.child?.P.name] ??
                "material-symbols:widgets-outline-rounded"
              }
              width={20}
              height={20}
            />
          </div>
          <div style={{ "font-size": "14px" }}>{props.child?.P.name}</div>

          <Show when={isHovered()}>
            <Tooltip content={"Double click to Edit"}>
              {" "}
              <Icon
                ondblclick={() => {
                  const currentURL = window.location.href;
                  const navigateUrl =
                    currentURL.split("/").slice(0, -2).join("/") +
                    "/Comp/" +
                    props.child.id;
                  window.open(navigateUrl, "_blank");
                }}
                class={"cursor:pointer"}
                icon={"solar:settings-linear"}
              />
            </Tooltip>
          </Show>
        </div>
      );
    }

    return (
      <div>
        <nav class="bg:white 0px 0px 10px 10px w:full">
          <div class="group">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
              </g>
            </svg>
            <input
              placeholder="Search Component..."
              type="search"
              class="inputSearch f:14"
              value={searchQuery()}
              onInput={(e) => {
                setSearchQuery(e.target.value);
                updateFilteredData(); // Update filteredData when searchQuery changes
              }}
            />
          </div>
        </nav>
        <div class="p:10">
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
                    {(child) => <ListItemComponent child={child} />}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>
      </div>
    );
  };

  const PagesPart = () => {
    const data = getTreeData(graph, setGraph, {
      collection: "g:'Page'",
    });

    const [searchQuery, setSearchQuery] = createSignal("");
    const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

    const updateFilteredData = () => {
      if (!searchQuery()) {
        setFilteredData(data);
      } else {
        const filteredData = data.filter((item) => {
          return item.name.toLowerCase().includes(searchQuery().toLowerCase());
        }); // Filter out items with no matching children

        setFilteredData(filteredData);
      }
    };

    function ListItemComponent(props: { child: any }) {
      const [isHovered, setIsHovered] = createSignal(false);

      const baseStyle = {
        "border-radius": ".2rem",
        margin: "5px",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        padding: "10px",
        "background-color": "white",
        display: "flex",
        "flex-direction": "row",
        "align-items": "center",
        "justify-content": "space-between",
        height: "35px",
        "box-shadow": "rgba(0, 0, 0, 0.2) 1px 1px 1px 1px",
      } as JSX.CSSProperties;

      const hoverStyle = {
        "background-color": "#F2EDED",
        cursor: "move",
        boxShadow: "4px 4px 4px",
      } as JSX.CSSProperties;

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
            setDraggedVertex(graph.vertexes[props.child.id]);
          }}
        >
          <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
        </div>
      );
    }

    return (
      <div>
        <TextField
          label="Name"
          class="b:1|solid|blue-30 r:5|5|5|5 p:4"
          type="text"
          placeholder="Search Page..."
          value={searchQuery()}
          onInput={(e) => {
            setSearchQuery(e.target.value);
            updateFilteredData(); // Update filteredData when searchQuery changes
          }}
        />
        <div
          class="overflow-y:auto overflow-x:auto m:6px"
          style={{ display: "grid", "grid-template-columns": "repeat(2, 1fr)" }}
        >
          <For
            each={filteredData()}
            fallback={<div class="p:3 font-weight:bold">No Page Found !</div>}
          >
            {(item, index) => <ListItemComponent child={item} />}
          </For>
        </div>
      </div>
    );
  };

  const LayoutPart = () => {
    const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

    const toggleExpand = (itemId: number) => {
      setCollapsedKeys((prev) =>
        prev.includes(itemId)
          ? prev.filter((item) => item !== itemId)
          : [...prev, itemId],
      );
    };
    const toggleHidden = (itemId: number) => {
      setHiddenNodes((prev) =>
        prev.includes(itemId)
          ? prev.filter((item) => item !== itemId)
          : [...prev, itemId],
      );
    };
    const TreeView = (props: { vertex: Vertex }) => {
      const {
        children,
        isActiveItem,
        handleDragStart,
        handleDragEnter,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        onLayoutItemClick,
        clone,
        deleteLayout,
      } = useDragDrop(
        graph,
        setGraph,
        pageConfig[0].record,
        props.vertex,
        collapsedKeys,
      );
      const getComponent = () =>
        getChildVertex(graph, ["$0Comp"], props.vertex).vertex?.P.name;

      return (
        <div>
          <div
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            class={`${
              isSelectedLayoutId(props.vertex.id)
                ? "bg:rgb(197,221,255)"
                : isSelectedHoverId(props.vertex.id)
                  ? "bg:#F2EDED"
                  : ""
            } ${children().length ? "r:5|5|5|5" : "r:0|5|5|0"} f:14 ${
              children().length ? "box-shadow:1px|1px|1px|1px #F2EDED" : ""
            }`}
            classList={{
              "b:1px":
                isActiveItem() && indicatorPosition().position === "center",
            }}
            onClick={onLayoutItemClick}
            onMouseOver={(e) => {
              e.stopPropagation();
              setHoverId(props.vertex.id);
            }}
            onmouseleave={(e) => {
              e.stopPropagation();
              setHoverId(-1);
            }}
            style={{
              "font-weight": children().length ? "bold" : "normal",
              "margin-bottom":
                children().length ||
                !(isActiveItem() && indicatorPosition().position === "after")
                  ? "0px"
                  : "10px",
              "box-shadow": children().length
                ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
                : "0px",
              "margin-top":
                isActiveItem() && indicatorPosition().position === "before"
                  ? "10px"
                  : "",
              "border-top":
                isActiveItem() && indicatorPosition().position === "before"
                  ? "2px solid green"
                  : "",
              "border-bottom":
                isActiveItem() && indicatorPosition().position === "after"
                  ? "2px solid green"
                  : "",
              "border-left": children().length ? "" : "1px dashed black",
              "align-items": "center",
              "justify-content": "space-between",
              display: "flex",
            }}
          >
            <div style="display: flex;align-items: center;">
              &nbsp;
              <Show when={children().length}>
                <button
                  class="cursor: pointer;"
                  onClick={(e) => {
                    e.stopPropagation();

                    toggleExpand(props.vertex.id);
                  }}
                >
                  <Icon
                    icon="mingcute:down-fill"
                    class={"transform 2s ease-in-out"}
                    style={{
                      transition: "transform 0.2s linear",
                      "margin-top": "7px",
                      transform: `${
                        collapsedKeys().includes(props.vertex.id)
                          ? "rotate(0deg)"
                          : "rotate(180deg)"
                      }`,
                    }}
                  />
                </button>
              </Show>
              &nbsp;
              <Icon
                icon={
                  iconMap[getComponent()] ??
                  "material-symbols:widgets-outline-rounded"
                }
                width={17}
                height={17}
              />
              &nbsp;&nbsp;
              {nameExpr(props.vertex, graph) || props.vertex.P.name}
            </div>
            <div>
              <Show
                when={
                  isSelectedLayoutId(props.vertex.id) ||
                  isSelectedHoverId(props.vertex.id)
                }
              >
                <Tooltip content={"Duplicate"} nowrap>
                  <Icon
                    icon={"mage:copy"}
                    height={18}
                    width={18}
                    color={"black"}
                    class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
                    onclick={clone}
                  />
                </Tooltip>
                <Tooltip content={"Delete"} nowrap>
                  <GenericField
                    meta={
                      {
                        P: {
                          component: "Icon",
                          props: {
                            style: { color: "red" },
                            onClick: () => deleteLayout(getComponent()),
                            width: 18,
                            height: 18,
                            class:
                              "cursor:pointer  mr:5px opacity:.5 opacity:1:hover",
                            icon: "mage:trash",
                          },
                        },
                      } as any
                    }
                  />
                </Tooltip>
              </Show>
              <Show
                when={
                  isSelectedLayoutId(props.vertex.id) ||
                  isSelectedHoverId(props.vertex.id) ||
                  hiddenNodes().includes(props.vertex.id)
                }
              >
                <Tooltip
                  content={`${
                    !hiddenNodes().includes(props.vertex.id) ? "Hide" : "Show"
                  }`}
                  nowrap
                >
                  <button
                    class="opacity:.5 opacity:1:hover"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHidden(props.vertex.id);
                    }}
                  >
                    <Show
                      when={!hiddenNodes().includes(props.vertex.id)}
                      fallback={
                        <Icon
                          height={18}
                          width={18}
                          icon="mdi:eye-off-outline"
                          class="transition: 0.5s ease-in-out;"
                        />
                      }
                    >
                      <Icon
                        height={18}
                        width={18}
                        icon="mdi:eye-outline"
                        class="transition: 0.5s ease-in-out;"
                      />
                    </Show>
                  </button>
                </Tooltip>
                &nbsp;
              </Show>
            </div>
          </div>

          <Show
            when={
              !collapsedKeys().includes(props.vertex.id) &&
              children().length > 0
            }
          >
            <ul class="pl:8 pt:3 pb:5">
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

    return (
      <>
        <For each={rootVertexes()}>{(item) => <TreeView vertex={item} />}</For>
      </>
    );
  };

  const PropertiesPart = () => {
    const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
    const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);

    if (!graph.vertexes[propertiesVertexId]) {
      const addNewVertexResult = addNewVertex(
        0,
        newVertex(propertiesVertexId, ["PropsJson"], { sample: true }),
        graph,
        setGraph,
      );
      if (addNewVertexResult.error) {
        console.warn("error while inserting");
      }
    }

    const setPropertyValue = (meta: Vertex, value: any) => {
      if (selectedId() !== -1 && selectedComponent().vertexId !== -1) {
        return setPropertyValueGlobal(
          graph,
          setGraph,
          pageConfig[0].record.txnId,
          meta,
          graph.vertexes[selectedId()],
          graph.vertexes[selectedComponent().vertexId],
          value,
        );
      }
      return;
    };
    const selectedComponentProperties = () => {
      const selectedComp = graph.vertexes[selectedComponent().vertexId];

      if (!selectedComp) {
        return { error: true };
      }

      return getChildVertexes(graph, ["$0Prop"], [selectedComp]);
    };

    const toggleRulesModal = () => setIsRulesModalOpen((prev) => !prev);
    const toggleImportsModal = () => setIsImportModalOpen((prev) => !prev);
    let prevTxnIndex = -1;
    const onRulesSubmit = () => {
      // hack to refresh the select fields. no option is refereshing the label.
      setGraph("vertexes", selectedId(), "OUT", "Rules", (v) =>
        v ? [...v] : v,
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
        v ? [...v] : v,
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
        (x) => x.name === "Rules",
      );

      addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
          name: metaAttributes?.name,
          props: metaAttributes?.props,
        }),
        graph,
        setGraph,
      );
      const attributes: FieldAttribute[] = JSON.parse(
        JSON.stringify(metaAttributes!.attributes!),
      );

      for (const attribute of attributes) {
        if (attribute.name === "Rule") {
          for (const ruleattribute of attribute.attributes!) {
            if (ruleattribute.name === "cond") {
              for (const condAttribute of ruleattribute.attributes!) {
                if (condAttribute.name === "layout") {
                  const data = getTreeData(
                    graph,
                    setGraph,
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
                        const component = getChildVertex(graph, ["$0Comp"], v)
                          .vertex?.P.name;
                        return `${v.P.name}${
                          component ? ` (${component})` : ""
                        }`;
                      },
                    },
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

      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[metaVertexId],
        attributes,
      );
      onCleanup(() => {
        revertTransaction(txnId);
      });

      return (
        <TableInputField
          meta={graph.vertexes[metaVertexId]}
          data={graph.vertexes[selectedId()!]}
          txnId={pageConfig[0].record.txnId}
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
              props: {
                children: "Import",
                variant: "soft",

                onClick: () => {
                  const jsxParser = new JsxParser({
                    showWarnings: true,
                    txnId: pageConfig[0].record.txnId,
                    jsx: graph.vertexes[dataVertexId].P.jsx || "",
                    parent: graph.vertexes[selectedId()],
                  });
                  jsxParser.render(graph, setGraph);
                  // reset layout
                  // layoutTreeViewInstance.option("items", getLayoutTreeData());
                },
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",
              props: {
                children: "Submit",
                onClick: onImportsSubmit,
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",
              props: {
                children: "Cancel",
                class: "border-color:#FF0000 color:#FF0000",
                variant: "outlined",
                onClick: onImportsCancel,
              },
            },
          } as any,
        },
      ];
      return (
        <>
          <Portal>
            <div role="dialog" tabIndex={-1} class="sb-modal r:10|10|10|10">
              <ModalContent class={"min-w:30%"}>
                <ModalHeader>
                  Import HTML
                  <button
                    onclick={toggleImportsModal}
                    style={{ float: "right" }}
                  >
                    ✕
                  </button>
                </ModalHeader>
                <ModalBody class={"mt:1rem"}>
                  <GenericInputField
                    txnId={dataVertexId}
                    title={"Write HTML"}
                    component="TextArea"
                    meta={graph.vertexes[metaVertexId]}
                    data={graph.vertexes[dataVertexId]}
                    setValue={(data: any) =>
                      setGraph("vertexes", dataVertexId, "P", { jsx: data })
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
                      {(item) => <GenericField meta={item.meta} />}
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
        }),
        graph,
        setGraph,
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
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[metaVertexId],
        attributes,
      );
      onCleanup(() => {
        revertTransaction(txnId);
      });
      const metaVertex = graph.vertexes[metaVertexId];
      const collMetaVertex = getChildVertexes(
        graph,
        ["MetaAttr"],
        [metaVertex],
      );

      return (
        <>
          <br />
          {/*<span>Collection:</span>*/}
          <SelectInputField
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![0]!}
            disabled={false}
            title={"Collection:"}
            component={"SelectBox"}
            txnId={pageConfig[0].record.txnId}
            isRealTime={false}
          />
          {/*<span>Data:</span>*/}
          <SelectInputField
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![1]!}
            disabled={false}
            title={"Data:"}
            component={"SelectBox"}
            txnId={pageConfig[0].record.txnId}
            // passed setValue when we have a string value in select field
            isRealTime={false}
          />
          <span>Expression:</span>
          <GenericInputField
            txnId={txnId}
            title={""}
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![2]!}
            disabled={false}
            component={"TextBox"}
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
                  props: {
                    children: "Rules",
                    class: "mb:5",
                    onClick: toggleRulesModal,
                  },
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
                    onClick: toggleImportsModal,
                  },
                },
              } as any
            }
          />
          <CollAndData />
          <FormGroupProperties
            txnId={pageConfig[0].record.txnId}
            metaAttributes={selectedComponentProperties().vertexes || []}
            vertex={graph.vertexes[propertiesVertexId]}
            setValue={setPropertyValue}
            selectedLayout={graph.vertexes[selectedId()]}
          />
        </Show>
        <Show when={isRulesModalOpen()}>
          <Portal>
            <div role="dialog" tabIndex={-1} class="sb-modal">
              <ModalContent>
                <ModalHeader>
                  Header
                  <button onclick={toggleRulesModal} style={{ float: "right" }}>
                    ✕
                  </button>
                </ModalHeader>
                <ModalBody>
                  <RulesModalBody />
                </ModalBody>
                <ModalFooter>
                  {/*<button onclick={toggleRulesModal}>OK</Button>*/}
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
                              variant: "outlined",
                              class: "border-color:#FF0000 color:#FF0000",
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

  const componentPart = <ComponentPart />;
  const pagesPart = <PagesPart />;
  const collectionPart = <div>No Collection Found</div>; //<TwoCollections/>;
  const layoutPart = <LayoutPart />;
  const propertiesPart = <PropertiesPart />;

  const abstractSingleForm = (
    <AbstractSingleForm
      buttonAlign={"center"}
      formId={"Page"}
      id={params.id}
      graph={graph}
      config={pageConfig}
      showMainFieldsOnly={true}
      importExportButtons={false}
      setGraph={setGraph}
    />
  );

  const Column = (props: { type: string; index: number; vertex: Vertex }) => {
    const { deleteLayout } = useDragDrop(
      graph,
      setGraph,
      pageConfig[0].record,
      props.vertex,
    );
    return (
      <>
        <Show when={props.index > 0} fallback={<div />}>
          <Show
            when={props.type === "properties" && selectedId() === -1}
            fallback={<hr class="color:#ccc mt:5 mb:5" />}
          >
            <div />
          </Show>
        </Show>
        <div class={"p:5 direction:ltr"}>
          <Switch>
            <Match when={props.type === "components"}>
              <Show
                when={isComponentsExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={toggleComponentsExpansion}
                    title="Components"
                  >
                    <Icon icon={"mynaui:components"} height={25} width={25} />
                  </div>
                }
              >
                <div class="m:5">
                  <div
                    class="mb:10px"
                    onClick={toggleComponentOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style="font-weight: bold">Components</div>
                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                      <Icon
                        icon={"mdi:chevron-up"}
                        style={{
                          "font-size": "24px",
                          "border-radius": "50%",
                          "margin-left": "5px",
                          transition: "transform 0.2s linear",
                          transform: `${
                            isComponentOpen()
                              ? "rotate(0deg)"
                              : "rotate(180deg)"
                          }`,
                        }}
                        class="flex-1"
                      />
                    </div>
                    {/*<div class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                             title="Close Components">
                                            {isComponentsExpanded() && (
                                                <div
                                                    onClick={toggleComponentsExpansion}
                                                    class="cursor:pointer"
                                                >
                                                    <Icon
                                                        icon={"mingcute:left-line"}
                                                        height={25}
                                                        width={25}
                                                    />
                                                </div>
                                            )}
                                        </div>*/}
                  </div>

                  <Show when={isComponentOpen()}>
                    <hr class={"color:lightgrey m:.4rem|0"} />
                    {componentPart}
                  </Show>
                </div>
              </Show>
            </Match>
            <Match when={props.type === "pages"}>
              <Show
                when={isPagesExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={togglePagesExpansion}
                    title="Pages"
                  >
                    <Icon
                      icon={"iconoir:multiple-pages"}
                      height={25}
                      width={25}
                    />
                  </div>
                }
              >
                <div class="m:5 ">
                  <div
                    class="mb:10px"
                    onClick={togglePagesOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style="font-weight: bold">Pages</div>

                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                      <Icon
                        icon={"mdi:chevron-up"}
                        style={{
                          "font-size": "24px",
                          "border-radius": "50%",
                          "margin-left": "5px",
                          transition: "transform 0.2s linear",
                          transform: `${
                            isPagesOpen() ? "rotate(0deg)" : "rotate(180deg)"
                          }`,
                        }}
                        class="flex-1"
                      />
                    </div>
                  </div>
                  <Show when={isPagesOpen()}>
                    <hr class={"color:lightgrey m:.4rem|0"} />
                    {pagesPart}
                  </Show>
                </div>
              </Show>
            </Match>
            <Match when={props.type === "collection"}>
              <Show
                when={isCollectionExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={toggleCollectionExpansion}
                    title="Collection"
                  >
                    <Icon
                      icon={"fluent:collections-24-regular"}
                      height={25}
                      width={25}
                    />
                  </div>
                }
              >
                <div class="m:5">
                  <div
                    class="mb:10px"
                    onClick={toggleCollFieldsOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style="font-weight: bold">Collection Fields</div>
                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                      <Icon
                        icon={"mdi:chevron-up"}
                        style={{
                          "font-size": "24px",
                          "border-radius": "50%",
                          "margin-left": "5px",
                          transition: "transform 0.2s linear",
                          transform: `${
                            isCollFieldsOpen()
                              ? "rotate(0deg)"
                              : "rotate(180deg)"
                          }`,
                        }}
                        class="flex-1"
                      />
                    </div>
                  </div>
                  <Show when={isCollFieldsOpen()}>
                    <hr class={"color:lightgrey m:.4rem|0"} />
                    {collectionPart}
                  </Show>
                </div>
              </Show>
            </Match>
            <Match when={props.type === "layout"}>
              <Show
                when={isLayoutExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={toggleLayoutExpansion}
                    title="Layout"
                  >
                    <Icon icon={"tabler:layout"} height={25} width={25} />
                  </div>
                }
              >
                <div class="m:5">
                  <div
                    onClick={toggleIsLayoutOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      class="mb:2px ml:5px"
                      style="flex-grow: 1; font-weight: bold"
                    >
                      Layers
                    </div>
                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
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

                  <Show when={isLayoutOpen()}>
                    <hr class={"color:lightgrey m:.4rem|0"} />
                    {layoutPart}
                  </Show>
                </div>
              </Show>
            </Match>
            <Match when={props.type === "properties" && selectedId() !== -1}>
              <Show
                when={isPropertiesExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={togglePropertiesExpansion}
                    title="Properties"
                  >
                    <Icon
                      icon={"mingcute:settings-6-line"}
                      height={25}
                      width={25}
                    />
                  </div>
                }
              >
                <div class="ml:5 mr:5">
                  <div
                    onClick={toggleIsPropertiesOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      class="mb:2px ml:5px p:3|0"
                      style="flex-grow: 1; font-weight: bold"
                    >
                      Properties
                    </div>
                    <Tooltip content={"Delete"} nowrap>
                      <GenericField
                        meta={
                          {
                            P: {
                              component: "Icon",
                              props: {
                                style: { color: "red" },
                                onClick: () =>
                                  deleteLayout(
                                    getChildVertex(
                                      graph,
                                      ["$0Comp"],
                                      props.vertex,
                                    ).vertex?.P.name,
                                  ),
                                width: 18,
                                height: 18,
                                class: "cursor:pointer  mr:5px",
                                icon: "mage:trash",
                              },
                            },
                          } as any
                        }
                      />
                    </Tooltip>
                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                      <Icon
                        icon={"mdi:chevron-up"}
                        style={{
                          "font-size": "24px",
                          "border-radius": "50%",
                          "margin-left": "5px",
                          transition: "transform 0.2s linear",
                          transform: `${
                            isPropertiesOpen()
                              ? "rotate(0deg)"
                              : "rotate(180deg)"
                          }`,
                        }}
                        class="flex-1"
                      />
                    </div>
                  </div>
                  <Show when={isPropertiesOpen()}>
                    <Show when={selectedId() !== -1}>
                      <hr class={"color:lightgrey m:.4rem|0"} />
                    </Show>
                    {propertiesPart}
                  </Show>
                </div>
              </Show>
            </Match>
            <Match when={props.type === "form"}>
              <Show
                when={isFormExpanded()}
                fallback={
                  <div
                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                    style="transition: opacity 0.3s ease-in-out;"
                    onClick={toggleFormExpansion}
                    title="Form"
                  >
                    <Icon
                      icon={"fluent:form-multiple-24-regular"}
                      height={25}
                      width={25}
                    />
                  </div>
                }
              >
                <div class="m:5">
                  <div
                    class={`mb:${isFormOpen() ? "10px" : "0px"}`}
                    onClick={toggleIsFormOpen}
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      class="mb:2px ml:5px"
                      style="flex-grow: 1; font-weight: bold"
                    >
                      Form Configuration
                    </div>
                    <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
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
                  <Show when={isFormOpen()}>
                    <hr class={"color:lightgrey m:.4rem|0"} />
                    {abstractSingleForm}
                  </Show>
                </div>
              </Show>
            </Match>
          </Switch>
        </div>
      </>
    );
  };

  const onChangeStep = (selectedStepId: number) => {
    const newSteps = steps().map((step) => {
      return {
        ...step,
        status:
          step.id < selectedStepId
            ? "complete"
            : step.id === selectedStepId
              ? "current"
              : "upcoming",
        active: step.id === selectedStepId,
      };
    });
    setSelectedStepId(selectedStepId);
    setSteps(newSteps);
  };
  const getStepId = () => {
    return steps()
      .map((step) => (step.active ? step.id : null))
      .find((id) => id !== null);
  };
  // @ts-ignore
  const NavigationBar = ({ steps, getStepId, onChangeStep }) => (
    <nav aria-label="Progress">
      <ol role="list" class="flex align-items:center">
        <For each={steps()}>
          {(step) => (
            <li
              class={`position:relative pr:${step.id !== 3 ? "2rem" : ""} pr:${step.id !== 3 ? "5rem@sm" : ""}`}
            >
              {/* Completed Step */}
              <div
                class="position:absolute inset:0px flex align-items:center "
                aria-hidden="true"
              >
                <Show when={step.id !== 3}>
                  <div
                    class={`h:0.125rem width:100% bg:${step.id < getStepId() ? "rgb(79,70,229)" : "rgb(229,231,235)"}`}
                  />
                </Show>
              </div>
              <Tooltip
                position={"n"}
                content={
                  step.id === 1
                    ? "Edit Page"
                    : step.id === 2
                      ? "Preview"
                      : "Share"
                }
              >
                <a
                  href="#"
                  onClick={() => onChangeStep(step.id)}
                  class={`position:relative b:1px|solid|${step.status === "current" ? "rgb(79,70,229)" : "rgb(229,231,235)"} flex h:2rem w:2rem align-items:center justify-content:center  border-radius:9999px  bg:${step.id >= getStepId() ? "#ffffff" : "rgb(85,79,220)"}`}
                >
                  <Icon
                    icon={
                      step.id === 1
                        ? "material-symbols-light:edit-calendar-outline-rounded"
                        : step.id === 2
                          ? "solar:eye-broken"
                          : "grommet-icons:share-rounded"
                    }
                    style={{ color: step.id < getStepId() ? "white" : "black" }}
                  />
                  <span class="sr-only">Step {step.id}</span>
                </a>
              </Tooltip>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );

  const [isLeftOpen, toggleIsLeftOpen] = useExpansion(true);
  const [isRightOpen, toggleIsRightOpen] = useExpansion(true);

  return (
    <>
      <Switch>
        <Match when={selectedStepId() === 1}>
          <div class="flex mt:15">
            <div class={"rel"}>
              <div
                class={`h:100vh  flex-col overflow:auto border:1|solid|lightgrey m:5 r:5|5|5|5 ${isLeftOpen() ? "w:20rem" : "w:1.8rem"} direction:rtl`}
                style={{
                  "max-height": "calc(100vh - 100px)",
                  "scrollbar-width": "thin",
                  "scrollbar-color": "lightgrey",
                }}
              >
                <Show when={isLeftOpen()}>
                  <For each={leftColumns()}>
                    {(column, index) => (
                      <Column
                        type={column.id}
                        index={index()}
                        vertex={pageConfig[0].record?.vertex}
                      />
                    )}
                  </For>
                </Show>
              </div>
              <div class={`abs z-index:1 top:40vh right:1.2rem`}>
                <button
                  onClick={toggleIsLeftOpen}
                  type="button"
                  title={`${isLeftOpen() ? "Close" : "Open"}`}
                  class="top-1/2 right-1/2 transform translate-x-50 -translate-y-50 h:29 bg:white border-radius:9999px"
                  style={`background-color:white;style=z-index: 1;position: absolute;margin-top: 20%;${isLeftOpen() ? "margin-left: 20%" : "margin-left: 1%"};`}
                >
                  <Show
                    when={isLeftOpen()}
                    fallback={
                      <Icon
                        icon={"line-md:chevron-right-circle"}
                        height={30}
                        width={30}
                        style={{ color: "#c1c1c1" }}
                      />
                    }
                  >
                    <Icon
                      icon={"line-md:chevron-left-circle"}
                      height={30}
                      width={30}
                      style={{ color: "#c1c1c1" }}
                    />
                  </Show>
                </button>
              </div>
            </div>

            <div class="flex-grow:1 min-w:400 grid ji:center">
              <div
                class={
                  "ai:center align-items:center bg:#f3f3f4 display:flex flex h:50px jc:space-between mb:5 p:10 r:7 w:90%"
                }
              >
                <NavigationBar
                  steps={steps}
                  getStepId={getStepId}
                  onChangeStep={onChangeStep}
                />
                <div
                  class={"ai:center justify-content:space-between flex gap:5"}
                >
                  <Tooltip content={"Undo"} position={"n"}>
                    <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
                      <Icon
                        icon={"ci:arrow-undo-up-left"}
                        height={22}
                        width={22}
                      />
                    </div>
                  </Tooltip>
                  <Tooltip content={"Redo"} position={"n"}>
                    <div class="b:1px|solid|lightgrey color:#000:hover color:grey bg:white flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
                      <Icon
                        icon={"ci:arrow-undo-up-right"}
                        height={22}
                        width={22}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <ResizableContainer>
                <FormContext.Provider value={{ record: pageConfig[0].record }}>
                  <PageView
                    number={count()}
                    vertex={pageConfig[0].record?.vertex}
                  />
                </FormContext.Provider>
              </ResizableContainer>
            </div>
            <div class="rel mt:40vh mr:10px">
              <button
                onClick={toggleIsRightOpen}
                type="button"
                title={`${isRightOpen() ? "Close" : "Open"}`}
                class="absolute top-1/2 right-1/2 transform translate-x-50 -translate-y-50 h:29 bg:white border-radius:9999px"
                style={`background-color:white;style=z-index: 1;position: absolute;margin-top: 20%;${isRightOpen() ? "margin-left: 76.4%" : "margin-left: 96.3%"};`}
              >
                <Show
                  when={isRightOpen()}
                  fallback={
                    <Icon
                      icon={"line-md:chevron-left-circle"}
                      height={30}
                      width={30}
                      style={{ color: "#c1c1c1" }}
                    />
                  }
                >
                  <Icon
                    icon={"line-md:chevron-right-circle"}
                    height={30}
                    width={30}
                    style={{ color: "#c1c1c1" }}
                  />
                </Show>
              </button>
            </div>
            <div
              class={`flex-col overflow-x:auto border:1|solid|lightgrey m:5 r:5|5|5|5 ${isRightOpen() ? "w:24rem" : "w:1.8rem"}`}
              style={{
                "max-height": "calc(100vh - 100px)",
                "scrollbar-width": "thin",
                "scrollbar-color": "lightgrey",
              }}
            >
              <Show when={isRightOpen()}>
                <For each={rightColumns()}>
                  {(column, index) => (
                    <Column
                      type={column.id}
                      index={index()}
                      vertex={pageConfig[0].record?.vertex}
                    />
                  )}
                </For>
              </Show>
            </div>
          </div>
        </Match>
        <Match when={selectedStepId() === 2}>
          <div
            class={
              "w:100% h:50px display:flex align-items:center mb:10 justify-content:center"
            }
          >
            <NavigationBar
              steps={steps}
              getStepId={getStepId}
              onChangeStep={onChangeStep}
            />
          </div>
          <PreviewSection />
        </Match>
        <Match when={selectedStepId() === 3}>
          <div
            class={
              "w:100% h:50px display:flex align-items:center mb:10 justify-content:center"
            }
          >
            <NavigationBar
              steps={steps}
              getStepId={getStepId}
              onChangeStep={onChangeStep}
            />
          </div>
          <ShareSection />
        </Match>
      </Switch>
    </>
  );
};
