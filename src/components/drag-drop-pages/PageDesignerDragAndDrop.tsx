// TODO: make multiple Fields Drag and Drop once.
import {useParams} from "@solidjs/router";
import {createStore} from "solid-js/store";
import {
    addMetaVertexes,
    FieldAttribute,
    FormContext,
    getChildVertex,
    getChildVertexes,
    Record,
    setValueGlobal,
} from "../../lib/Utils";
import {
    batch,
    createEffect,
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
import {PageView} from "../input/GenaricField";
import {GenericField} from "../input/Components/GenericFieldComponent";

import {getTreeData} from "../../lib/Traverse";

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
} from "../../lib/graph";
import {AbstractSingleForm} from "../DynamicForm";
import {SelectInputField} from "../input/SelectInputField";
import {addNewVertex, newVertex,} from "../../lib/Vertex";
import {WsContext} from "../../utils/ws_events_dispatcher";
import {Portal} from "solid-js/web";
import {TableInputField} from "../input/TableInputField";
import {AttrsTableData} from "../../lib/api";
import {GenericInputField} from "../input/GenaricInputField";
import JsxParser from "../../lib/jsx_parser/source/components/JsxParser";
import {FormGroupProperties} from "../../pages/FormsAdmin";

import {TableTabs} from "../TableTabs";
import {Icon} from "@iconify-icon/solid";
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
} from "../pageStore";
import {ModalBody, ModalContent, ModalFooter, ModalHeader, TextField, Tooltip,} from "../solid-blocks/blocks";
import {iconMap, nameExpr} from "../Utils";
import {toTitle} from "case-switcher-js";
import ShareSection from "./share";
import PreviewSection from "./preview";

function getIconByCategory(category: any, size?: any) {
    return (
        <Icon
            icon={iconMap[category] ?? "material-symbols:widgets-outline-rounded"}
            width={size || 20}
            height={size || 20}
        />
    ); // Returns null if category is not found
}


export const PageDesignerDragAndDrop = () => {
    const params = useParams();
    const pageConfig = createStore({} as { record: Record });
    const [count, setCount] = createSignal(1);
    const {Ws} = useContext(WsContext);
    const [isFormOpen, setIsFormOpen] = createSignal(true);
    const [isLayoutOpen, setIsLayoutOpen] = createSignal(true);
    const [isPropertiesOpen, setIsPropertiesOpen] = createSignal(false);
    const [steps, setSteps] = createSignal([
        {id: 1, name: 'Job details', href: '#', status: 'current', active: true},
        {id: 2, name: 'Application form', href: '#', status: 'upcoming', active: false},
        {id: 3, name: 'Preview', href: '#', status: 'upcoming', active: false},
    ]);
    const [selectedStepId, setSelectedStepId] = createSignal(1); // Initially set to the first step
    const isSelectedLayoutId = createSelector(selectedId);
    const isSelectedHoverId = createSelector(hoverId);


    const rerender = () => {
        setCount((prev) => prev + 1);
    };

    function useExpansion(defaultValue = true) {
        const [expanded, setExpanded] = createSignal(defaultValue);
        const toggleExpansion = () => setExpanded(!expanded());
        return [expanded, toggleExpansion];
    }

    const [isComponentsExpanded, toggleComponentsExpansion] = useExpansion();
    const [isPagesExpanded, togglePagesExpansion] = useExpansion();
    const [isCollectionExpanded, toggleCollectionExpansion] = useExpansion();
    const [isLayoutExpanded, toggleLayoutExpansion] = useExpansion();
    const [isPropertiesExpanded, togglePropertiesExpansion] = useExpansion();
    const [isFormExpanded, toggleFormExpansion] = useExpansion();

    const ComponentPart = () => {
        const data = getTreeData({
            collection: "g:'CompCategory'",
            // TODO: Dont display "Form" Component
            child: {collection: "->CompCategoryComp"},
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
            };

            const hoverStyle = {
                "background-color": "#F2EDED",
                cursor: "move",
                boxShadow: "4px 4px 4px",
            };

            const itemStyle = () =>
                isHovered() ? {...baseStyle, ...hoverStyle} : baseStyle;

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
                    <div class="pt:5px">{getIconByCategory(props.child?.P.name)}</div>
                    <div style={{"font-size": "14px"}}>{props.child?.P.name}</div>
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
                                <ul style={{...listBoxStyle, ...listStyle}}>
                                    <For each={item.children}>
                                        {(child) => <ListItemComponent child={child}/>}
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
        const data = getTreeData({
            collection: "g:'Page'",
        });

        const [searchQuery, setSearchQuery] = createSignal("");
        const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

        const updateFilteredData = () => {
            if (!searchQuery()) {
                setFilteredData(data);
            } else {
                const filteredData = data
                    .filter((item) => {
                        return item.name
                            .toLowerCase()
                            .includes(searchQuery().toLowerCase());
                    }); // Filter out items with no matching children

                setFilteredData(filteredData);
            }
        };

        function ListItemComponent(props: { child: Vertex }) {
            const [isHovered, setIsHovered] = createSignal(false);

            const baseStyle = {
                "border-radius": ".2rem",
                "margin": "5px",
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
                isHovered() ? {...baseStyle, ...hoverStyle} : baseStyle;

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
                    <div style={{"font-size": "14px"}}>{toTitle((props.child))}</div>
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
                <div class="overflow-y:auto overflow-x:auto m:2px"
                     style={{display: "grid", "grid-template-columns": "repeat(2, 1fr)"}}>
                    <For
                        each={filteredData()}
                        fallback={
                            <div class="p:3 font-weight:bold">No Page Found !</div>
                        }
                    >
                        {(item, index) => (

                            <ListItemComponent child={item.name}/>

                        )}
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
                deleteLayout
            } = useDragDrop(pageConfig[0].record, props.vertex, collapsedKeys);
            const getComponent = () =>
                getChildVertex(["$0Comp"], props.vertex).vertex?.P.name;

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
                                ? "bg:lightblue"
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
                            "margin-bottom": children().length || !(isActiveItem() && indicatorPosition().position === "after") ? "0px" : "10px",
                            "box-shadow": children().length
                                ? "rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px"
                                : "0px",
                            "margin-top": isActiveItem() && indicatorPosition().position === "before" ? "10px" : "",
                            "border-top": isActiveItem() && indicatorPosition().position === "before" ? "2px solid green" : "",
                            "border-bottom": isActiveItem() && indicatorPosition().position === "after" ? "2px solid green" : "",
                            "border-left": children().length ? "" : "1px dashed black",
                            "align-items": "center",
                            "justify-content": "space-between",
                            display: "flex",
                        }}
                    >

                        <div style="display: flex;align-items: center;">
                            &nbsp;
                            <Show when={children().length}>
                                <Tooltip
                                    content={`${collapsedKeys().includes(props.vertex.id) ? "Expand" : "Collapse"}`}
                                    nowrap>
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
                                </Tooltip>
                            </Show>
                            &nbsp;
                            {getIconByCategory(getComponent(), 17)}&nbsp;&nbsp;
                            {nameExpr(props.vertex) || props.vertex.P.name}
                        </div>
                        <div>
                            <Show when={isSelectedLayoutId(props.vertex.id) || isSelectedHoverId(props.vertex.id)}>
                                <Tooltip content={'Duplicate'} nowrap><Icon icon={'mage:copy'} height={18} width={18}
                                                                            color={'black'}
                                                                            class={'cursor:pointer mr:5px opacity:.5 opacity:1:hover'}
                                                                            onclick={clone}/></Tooltip>
                                <Tooltip content={'Delete'} nowrap><GenericField
                                  meta={
                                      {
                                          P: {
                                              component: "Icon",
                                              props: {
                                                  style: {color: "red"},
                                                  onClick: () => deleteLayout(),
                                                  width: 18,
                                                  height: 18,
                                                  class: 'cursor:pointer  mr:5px opacity:.5 opacity:1:hover',
                                                  icon: "mage:trash",
                                              },
                                          },
                                      } as any
                                  }
                                /></Tooltip>
                            </Show>
                            <Tooltip content={`${!hiddenNodes().includes(props.vertex.id) ? "Hide" : "Show"}`} nowrap>
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
                                {(vertex) => <TreeView vertex={vertex}/>}
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
                <For each={rootVertexes()}>{(item) => <TreeView vertex={item}/>}</For>
            </>
        );
    };

    const PropertiesPart = () => {
        const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
        const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);

        if (!graph.vertexes[propertiesVertexId]) {
            const addNewVertexResult = addNewVertex(
                0,
                newVertex(propertiesVertexId, ["PropsJson"], {sample: true})
            );
            if (addNewVertexResult.error) {
                console.warn("error while inserting");
            }
        }

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
                return {error: true};
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
                                                        child: {collection: "->Attr"},
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
                P: {name: "jsx", props: {width: 700, height: 700}},
            });
            setGraph("vertexes", dataVertexId, {id: dataVertexId, P: {}});

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
                                children: "Import", variant: "primary", onClick: () => {
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
                        },
                    } as any
                },
                {
                    meta: {
                        P: {
                            component: "Button",
                            props: {type: "primary", children: "Submit", onClick: onImportsSubmit,},
                        },
                    } as any,

                },
                {
                    meta: {
                        P: {
                            component: "Button",
                            props: {variant: "secondary", children: "Cancel", onClick: onImportsCancel},
                        },
                    } as any,
                },
            ];
            return (
                <>
                    <Portal>
                        <div role="dialog" tabIndex={-1} class="sb-modal">
                            <ModalContent>
                                <ModalHeader>
                                    Import HTML
                                    <button
                                        variant="icon"
                                        onclick={toggleImportsModal}
                                        style={{float: "right"}}
                                    >
                                        ✕
                                    </button>
                                </ModalHeader>
                                <ModalBody>
                                    <GenericInputField
                                        txnId={dataVertexId}
                                        component="TextArea"
                                        meta={graph.vertexes[metaVertexId]}
                                        data={graph.vertexes[dataVertexId]}
                                        setValue={(attribute: Vertex, vertex: Vertex, data: any) =>
                                            setGraph("vertexes", vertex.id, "P", {jsx: data})
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
                                                <GenericField meta={item.meta}/>
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
                    <br/>
                    {/*<span>Collection:</span>*/}
                    <SelectInputField
                        data={graph.vertexes[selectedId()!]}
                        meta={collMetaVertex.vertexes![0]!}
                        disabled={false}
                        title={"Collection:"}
                        component={"SelectBox"}
                        txnId={pageConfig[0].record.txnId}
                        // passed setValue when we have a string value in select field
                        setValue={pageConfig[0].record.setValue}
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
                                    props: {children: "Rules", onClick: () => toggleRulesModal},
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
                    <CollAndData/>
                    <FormGroupProperties
                        txnId={pageConfig[0].record.txnId}
                        metaAttributes={selectedComponentProperties().vertexes || []}
                        vertex={graph.vertexes[propertiesVertexId]}
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
                                    <button
                                        variant="icon"
                                        onclick={toggleRulesModal}
                                        style={{float: "right"}}
                                    >
                                        ✕
                                    </button>
                                </ModalHeader>
                                <ModalBody>
                                    <RulesModalBody/>
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
                    <ImportModalBody/>
                </Show>
            </>
        );
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
            setSelectedComponent({vertexId: -1});
            setSelectedColl({vertexId: -1});
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
        ["components", "pages", "collection"].map((column) => ({
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

    const componentPart = <ComponentPart/>;
    const pagesPart = <PagesPart/>;
    const collectionPart = <div>No Collection Found</div>; //<TwoCollections/>;
    const layoutPart = <LayoutPart/>;
    const propertiesPart = <PropertiesPart/>;

    const abstractSingleForm = (
        <AbstractSingleForm
            formId={"Page"}
            id={params.id}
            config={pageConfig}
            showMainFieldsOnly={true}
            importExportButtons={false}
        />
    );

    const Column = (props: { type: string }) => {
        return (
            <>
                <div>
                    <Switch>
                        <Match when={props.type === "components"}>
                            {!isComponentsExpanded() && (
                                <div
                                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                    style="transition: opacity 0.3s ease-in-out;"
                                    onclick={toggleComponentsExpansion}
                                    title="Components"
                                >
                                    <Icon icon={"mynaui:components"} height={25} width={25}/>
                                </div>
                            )}
                            {isComponentsExpanded() && (
                                <div
                                    class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5"
                                    title="Close Components"
                                >
                                    <div
                                        class="mb:10px"
                                        style={{
                                            display: "flex",
                                            "justify-content": "space-between",
                                            "align-items": "center",
                                        }}
                                    >
                                        <div style="font-weight: bold">Components</div>
                                        <div class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px">
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
                                        </div>
                                    </div>
                                    {componentPart}
                                </div>
                            )}
                            {/*{oneComponents}*/}
                        </Match>
                        <Match when={props.type === "pages"}>
                            {!isPagesExpanded() && (
                                <div
                                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                    style="transition: opacity 0.3s ease-in-out;"
                                    onclick={togglePagesExpansion}
                                    title="Pages"
                                >
                                    <Icon icon={"iconoir:multiple-pages"} height={25} width={25}/>
                                </div>
                            )}
                            {isPagesExpanded() && (
                                <div
                                    class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5 "
                                    title="Close Pages"
                                >
                                    <div
                                        class="mb:10px"
                                        style={{
                                            display: "flex",
                                            "justify-content": "space-between",
                                            "align-items": "center",
                                        }}
                                    >
                                        <div style="font-weight: bold">Pages</div>
                                        <div class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px">
                                            {isPagesExpanded() && (
                                                <div
                                                    onClick={togglePagesExpansion}
                                                    class="cursor:pointer"
                                                >
                                                    <Icon
                                                        icon={"mingcute:left-line"}
                                                        height={25}
                                                        width={25}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {pagesPart}
                                </div>
                            )}
                        </Match>
                        <Match when={props.type === "collection"}>
                            {!isCollectionExpanded() && (
                                <div
                                    class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                    style="transition: opacity 0.3s ease-in-out;"
                                    onclick={toggleCollectionExpansion}
                                    title="Collection"
                                >
                                    <Icon
                                        icon={"fluent:collections-24-regular"}
                                        height={25}
                                        width={25}
                                    />
                                </div>
                            )}
                            {isCollectionExpanded() && (
                                <div class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5 w:21.5rem">
                                    <div
                                        class="mb:10px"
                                        style={{
                                            display: "flex",
                                            "justify-content": "space-between",
                                            "align-items": "center",
                                        }}
                                    >
                                        <div style="font-weight: bold">Collection Fields</div>
                                        <div
                                            class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                            title="Close Collection"
                                        >
                                            {isCollectionExpanded() && (
                                                <div
                                                    onClick={toggleCollectionExpansion}
                                                    class="cursor:pointer"
                                                >
                                                    <Icon
                                                        icon={"mingcute:left-line"}
                                                        height={25}
                                                        width={25}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {collectionPart}
                                </div>
                            )}
                        </Match>
                        <Match when={props.type === "layout"}>
                            <div style={{display: "flex", "justify-content": "end"}}>
                                {!isLayoutExpanded() && (
                                    <div
                                        class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                        style="transition: opacity 0.3s ease-in-out;"
                                        onclick={toggleLayoutExpansion}
                                        title="Layout"
                                    >
                                        <Icon icon={"tabler:layout"} height={25} width={25}/>
                                    </div>
                                )}

                                {isLayoutExpanded() && (
                                    <div class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5 w:25rem">
                                        <div
                                            class={`mb:${isLayoutOpen() ? "10px" : "0px"}`}
                                            style={{
                                                display: "flex",
                                                "justify-content": "space-between",
                                                "align-items": "center",
                                            }}
                                        >
                                            {isLayoutExpanded() && (
                                                <div
                                                    class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                                    title="Close Layout"
                                                >
                                                    {isLayoutExpanded() && (
                                                        <div
                                                            onClick={toggleLayoutExpansion}
                                                            class="cursor:pointer"
                                                        >
                                                            <Icon
                                                                icon={"mingcute:right-line"}
                                                                height={25}
                                                                width={25}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                class="mb:2px ml:5px"
                                                style="cursor: pointer; flex-grow: 1; font-weight: bold"
                                                onClick={onClickLayout}
                                            >
                                                Layout
                                            </div>
                                            <div
                                                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                                                <div style="cursor: pointer;" onClick={onClickLayout}>
                                                    <Icon
                                                        icon={"mdi:chevron-up"}
                                                        style={{
                                                            "font-size": "24px",
                                                            "border-radius": "50%",
                                                            "margin-left": "5px",
                                                            transition: "transform 0.2s linear",
                                                            transform: `${
                                                                isLayoutOpen()
                                                                    ? "rotate(0deg)"
                                                                    : "rotate(180deg)"
                                                            }`,
                                                        }}
                                                        class="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {isLayoutOpen() && layoutPart}
                                    </div>
                                )}
                            </div>
                        </Match>
                        <Match when={props.type === "properties"}>
                            <div style={{display: "flex", "justify-content": "end"}}>
                                {!isPropertiesExpanded() && (
                                    <div
                                        class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                        style="transition: opacity 0.3s ease-in-out;"
                                        onclick={togglePropertiesExpansion}
                                        title="Properties"
                                    >
                                        <Icon
                                            icon={"mingcute:settings-6-line"}
                                            height={25}
                                            width={25}
                                        />
                                    </div>
                                )}

                                {isPropertiesExpanded() && (
                                    <div class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5 w:25rem">
                                        <div
                                            class={`mb:${isPropertiesOpen() ? "10px" : "0px"}`}
                                            style={{
                                                display: "flex",
                                                "justify-content": "space-between",
                                                "align-items": "center",
                                            }}
                                        >
                                            {isPropertiesExpanded() && (
                                                <div
                                                    class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                                    title="Close Properties"
                                                >
                                                    {isPropertiesExpanded() && (
                                                        <div
                                                            onClick={togglePropertiesExpansion}
                                                            class="cursor:pointer"
                                                        >
                                                            <Icon
                                                                icon={"mingcute:right-line"}
                                                                height={25}
                                                                width={25}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                class="mb:2px ml:5px"
                                                style="cursor: pointer; flex-grow: 1; font-weight: bold"
                                                onClick={onClickProperties}
                                            >
                                                Properties
                                            </div>
                                            <div
                                                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                                                <div
                                                    class="mb:12"
                                                    style="cursor: pointer; display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out"
                                                >
                                                    <div
                                                        style="cursor: pointer;"
                                                        onClick={onClickProperties}
                                                    >
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
                                            </div>
                                        </div>
                                        {isPropertiesOpen() && propertiesPart}
                                    </div>
                                )}
                            </div>
                        </Match>
                        <Match when={props.type === "form"}>
                            <div style={{display: "flex", "justify-content": "end"}}>
                                {!isFormExpanded() && (
                                    <div
                                        class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                                        style="transition: opacity 0.3s ease-in-out;"
                                        onclick={toggleFormExpansion}
                                        title="Form"
                                    >
                                        <Icon
                                            icon={"fluent:form-multiple-24-regular"}
                                            height={25}
                                            width={25}
                                        />
                                    </div>
                                )}

                                {isFormExpanded() && (
                                    <div class="border:1|solid|blue-30 p:10 m:5 r:5|5|5|5 w:24.3rem">
                                        <div
                                            class={`mb:${isFormOpen() ? "10px" : "0px"}`}
                                            style={{
                                                display: "flex",
                                                "justify-content": "space-between",
                                                "align-items": "center",
                                            }}
                                        >
                                            {isFormExpanded() && (
                                                <div
                                                    class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                                    title="Close Form"
                                                >
                                                    {isFormExpanded() && (
                                                        <div
                                                            onClick={toggleFormExpansion}
                                                            class="cursor:pointer"
                                                        >
                                                            <Icon
                                                                icon={"mingcute:right-line"}
                                                                height={25}
                                                                width={25}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                class="mb:2px ml:5px"
                                                style="cursor: pointer; flex-grow: 1; font-weight: bold"
                                                onClick={onClickForm}
                                            >
                                                Form Configuration
                                            </div>
                                            <div
                                                style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
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
                                        </div>
                                        {isFormOpen() && abstractSingleForm}
                                    </div>
                                )}
                            </div>
                        </Match>
                    </Switch>
                </div>
            </>
        );
    };


    const onChangeStep = (selectedStepId: number) => {
        const newSteps = steps().map(step => {
            return {
                ...step,
                status: step.id < selectedStepId ? 'complete' : step.id === selectedStepId ? 'current' : 'upcoming',
                active: step.id === selectedStepId
            };
        });
        setSelectedStepId(selectedStepId);
        setSteps(newSteps);
    }
    const getStepId = () => {
        return steps().map(step => step.active ? step.id : null).find(id => id !== null);
    };
    return (
        <>
            <div class={'w:100% h:50px display:flex align-items:center justify-content:center'}>
                <nav aria-label="Progress">
                    <ol role="list" class="flex align-items:center">
                        <For each={steps()}>
                            {(step) => (<>

                                    <li
                                        class={`position:relative pr:${step.id !== 3 ? '2rem' : ''} pr:${step.id !== 3 ? '5rem@sm' : ''}`}>
                                        {/* Completed Step */}
                                        <div class="position:absolute  inset:0px flex align-items:center "
                                             aria-hidden="true">
                                            <Show when={step.id !== 3}>
                                                <div
                                                    class={`h:0.125rem width:100%  bg:${step.id < getStepId() ? 'rgb(79,70,229)' : 'rgb(229,231,235)'}`}/>
                                            </Show>
                                        </div>

                                        <Tooltip position={'n'} content={step.id === 1?'Edit Page':step.id === 2?'Preview':'Share'}><a href="#" onclick={() => onChangeStep(step.id)}
                                           class={`position:relative b:1px|solid|${step.status === 'current' ? 'rgb(79,70,229)' : 'rgb(229,231,235)'} flex h:2rem w:2rem align-items:center justify-content:center  border-radius:9999px  bg:${step.id >= getStepId() ? '#ffffff' : 'rgb(85,79,220)'}`}>
                                            <Icon
                                                icon={step.id === 1 ? 'material-symbols-light:edit-calendar-outline-rounded' : step.id === 2 ? 'solar:eye-broken' : 'grommet-icons:share-rounded'}
                                                style={{color: step.id < getStepId() ? 'white' : 'black'}}/>
                                            <span class="sr-only">Step 1</span>
                                        </a></Tooltip>
                                    </li>
                                </>
                            )}
                        </For>


                    </ol>
                </nav>
            </div>

            <Switch>


                <Match when={selectedStepId() === 1}>
                    <div class="flex">
                        <div class="flex-col max-width:25rem overflow:auto" style={{"max-height": '85vh'}}>
                            <For each={leftColumns()}>
                                {(column) => <Column type={column.id}/>}
                            </For>
                        </div>
                        <div class="flex-grow:1 border:1|solid|blue-60 mt:5 p:10 min-w:400 r:5|5|5|5 overflow:auto">
                            <div class="flex justify-content:center">
                                <TableTabs tabs={tabs} setActiveTab={setActiveTab}/>
                            </div>
                            <div class={className() as string}>
                                <FormContext.Provider value={{record: pageConfig[0].record}}>
                                    <PageView number={count()} vertex={pageConfig[0].record?.vertex}/>
                                </FormContext.Provider>
                            </div>
                        </div>
                        <div class="flex-col max-width:25rem overflow:auto" style={{"max-height": '85vh'}}>
                            <For each={rightColumns()}>
                                {(column) => <Column type={column.id}/>}
                            </For>
                        </div>
                    </div>
                </Match>
                <Match when={selectedStepId() === 2}>
                    <PreviewSection/>
                </Match>
                <Match when={selectedStepId() === 3}>
                    <ShareSection/>
                </Match>
            </Switch>
        </>
    );

};
