import {
    createComputed,
    createEffect,
    createMemo,
    createSignal,
    For,
    Match,
    onCleanup,
    Show,
    Switch,
    useContext,
    on,
    getOwner,
    runWithOwner,
} from "solid-js";
import '../css/table.css'
import {toTitle} from "case-switcher-js";
import {
    findVertexByLabelAndUniqueId,
    replaceVertexProperties,
} from "../../lib/Vertex";
import {
    getNewTxnId, GraphContext,
    IdAttr,
    revertTransaction,
    Vertex,
} from "../../lib/graph";
import {WsContext} from "../../utils/ws_events_dispatcher";
import {klona} from "klona";
import {DynamicComponent} from "../DynamicComponent";
import {
    addMeta,
    componentProps,
    getCollAttrs,
    getStringComponent,
    rowMetaInitialize,
} from "../../lib/Record";
import {
    getChildVertex,
    addNewRow,
    getSublistRows,
    addMetaVertexes,
    FormContext,
    deleteRow,
    getSelectionOptions,
    getChildVertexes,
} from "../../lib/Utils";
import {ComponentProps} from "../ComponentType";
import {Icon} from "@iconify-icon/solid";
import {
    PageRenderContext,
    PageRenderUtils,
    RepeaterContext,
} from "./GenaricField";
import {GenericField} from "./Components/GenericFieldComponent";
import {getLastItem} from "../../utils/functions";
import {FieldAttribute} from "../../lib/Type";
import '../../base.css'
import CollapsibleTable, {DataTable} from "~/components/custom-component/Table";

export function TableInputField(
    props: ComponentProps & { txnId?: number; isRealTime?: boolean }
) {
    const {Ws} = useContext(WsContext);
    const [graph, setGraph] = useContext(GraphContext)!;
    // if there is no parent FormContext, it should still work.
    let {cleanUpConfig} = useContext(FormContext);
    const outerOwner = getOwner();
    const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

    const getAttributes = () => {
        // If child vertexes, use it
        const childAttrVertex = getChildVertexes(graph,
            ["Attr", "$0Att"],
            [props.meta]
        ).vertexes;
        if (childAttrVertex?.length) {
            return childAttrVertex;
        }

        // else get attributes from a collection.
        const attrVertex = getChildVertex(graph, ["$0Att"], props.meta).vertex;
        if (!attrVertex) return;

        return getChildVertexes(graph, ["Attr"], [attrVertex]).vertexes;
    };
    const tableColumnsTemplate = createMemo(
        () =>
            getAttributes() ||
            getChildVertexes(graph, ["MetaAttr"], [props.meta]).vertexes ||
            []
    );

    // add dynamic meta from separate collection.
    // If props.meta.P.attributes are not present and props.meta.props.collection is present then get attributes from the collection
    if (!props.meta.P.attributes && props.meta.P.meta) {
        const metaData = componentProps(graph, setGraph, props.meta, props.data!);
        if (metaData.collection) {
            // add metadata from separate collection.
            const collVertex = findVertexByLabelAndUniqueId(
                "Coll",
                IdAttr,
                metaData.collection, graph
            );
            if (collVertex) {
                const vertexCollAttrResult = getChildVertexes(graph, ["Attr"], [collVertex]);
                if (!vertexCollAttrResult.error) {
                    const vertexCollAttr = vertexCollAttrResult.vertexes!;
                    const attrs = [] as FieldAttribute[];
                    for (const attr of vertexCollAttr) {
                        const props = getCollAttrs(graph, setGraph, attr);
                        if (!props.error) attrs.push(props.attr!);
                    }
                    const newProperties = klona(props.meta.P);
                    newProperties.attributes = attrs;
                    replaceVertexProperties(getNewTxnId(), props.meta.id, graph, setGraph, newProperties);

                    const txnId = getNewTxnId();
                    addMetaVertexes(graph, setGraph, txnId, props.meta, attrs);
                    onCleanup(() => {
                        revertTransaction(txnId);
                    });
                }
            }
        }
    }
    const parentItems = useContext(PageRenderContext);

    const parentData = createMemo(() => {
        return PageRenderUtils.getDataVertex(graph, getLastItem(parentItems, 1));
    });
    // load data:
    // add row vertexes data to store
    createEffect(() => {
        // if a parent has data vertex use it,
        // TODO: else if it has a parent Form Container(Record) use it.
        const vertexes = getSublistRows(graph, props.meta, props.data || parentData());
        setSortedVertexes(vertexes);
    });

    // Todo dont allow duplicate value in the select field
    const SortableRow = (p: { joinVertex: Vertex; index: number }) => {
        // const sortable = createSortable(p.joinVertex.id);

        createComputed(
            on(tableColumnsTemplate, (columns) => {
                const metaTxnId = rowMetaInitialize(graph, setGraph, p.joinVertex, props.meta, columns);

                if (metaTxnId) {
                    if (cleanUpConfig) {
                        if (!cleanUpConfig.rowMetaTxnIds) {
                            cleanUpConfig.rowMetaTxnIds = [];
                        }
                        // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.
                        if (cleanUpConfig.rowMetaTxnIds.includes(metaTxnId))
                            cleanUpConfig.rowMetaTxnIds.push(metaTxnId);
                    }
                }
            })
        );

        const instResult = createMemo(
            () => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex
        );
        // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
        const rowColumnsMetaAttrs = createMemo(() =>
            tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand")
        );
        const expandVertex = createMemo(() =>
            tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand")
        );

        const [disabled, _] = createSignal(false);

        const DisplayProperties = () => {
            return (
                <For each={rowColumnsMetaAttrs()}>
                    {(column) => {
                        const metaVertex = createMemo(() =>
                            instResult()
                                ? graph.vertexes[instResult()!.P.rows[column.id]]
                                : ({P: {component: "String"}} as unknown as Vertex)
                        );
                        const component = createMemo(() => {
                            if (metaVertex().P.component.includes("-")) {
                                // Todo Fix: why this prints two times:
                                const component = getSelectionOptions(graph, setGraph,
                                    [p.joinVertex],
                                    metaVertex().P.component
                                ).vertexes;
                                if (component) {
                                    return component;
                                } else {
                                    return getStringComponent(graph)?.P.name;
                                }
                            } else {
                                return metaVertex().P.component;
                            }
                        });
                        // if mergeProps not keep reactivity use memo
                        createEffect(() => {
                            addMeta(graph, setGraph, metaVertex(), p.joinVertex);
                        });
                        const DefaultValue = () => (
                            <>
                                {metaVertex().P.props?.defaultValue &&
                                    getSelectionOptions(graph, setGraph,
                                        [p.joinVertex],
                                        metaVertex().P.props.defaultValue
                                    ).vertexes}
                            </>
                        );
                        const Content = () => (
                            <>
                                <DynamicComponent
                                    title={toTitle(
                                        column.P.displayName || column.P[IdAttr] || ""
                                    )}
                                    component={component()}
                                    // When we have a Table we pass original Table Meta Vertex
                                    meta={
                                        component() === "Table2"
                                            ? graph.vertexes[metaVertex().P.templateId]
                                            : metaVertex()
                                    }
                                    data={p.joinVertex}
                                    setValue={props.setValue}
                                    disabled={disabled()}
                                    txnId={props.txnId}
                                    isRealTime={props.isRealTime}
                                />
                            </>
                        );

                        return (
                            <Switch>
                                <Match when={metaVertex().P.props?.hidden}>
                                    <td>
                                        <div class={`padding:1px ${
                                            (() => {
                                                const comp = component();
                                                switch (comp) {
                                                    case 'TextBox':
                                                        return 'min-w:150px';
                                                    case 'TextArea':
                                                        return 'min-w:200px';
                                                    case 'CheckBox':
                                                        return 'min-w:50px';
                                                    case 'SelectBox':
                                                        return 'min-w:200px';
                                                    default:
                                                        return '';
                                                }
                                            })()}`}>
                                            <DefaultValue/>
                                        </div>
                                    </td>
                                </Match>
                                <Match when={component() === "Table2"}>
                                    <td style={{padding: "1rem"}}>
                                        <Show when={!props.disabled}>
                                            <div class={`padding:1px ${
                                                (() => {
                                                    const comp = component();
                                                    switch (comp) {
                                                        case 'TextBox':
                                                            return 'min-w:150px';
                                                        case 'TextArea':
                                                            return 'min-w:200px';
                                                        case 'CheckBox':
                                                            return 'min-w:50px';
                                                        case 'SelectBox':
                                                            return 'min-w:200px';
                                                        default:
                                                            return '';
                                                    }
                                                })()}`}>
                                                <DefaultValue/>
                                                <Content/>
                                            </div>
                                        </Show>
                                    </td>
                                </Match>
                                <Match when={true}>
                                    <td class={`padding:1px ${
                                        (() => {
                                            const comp = component();
                                            switch (comp) {
                                                case 'TextBox':
                                                    return 'min-w:150px';
                                                case 'TextArea':
                                                    return 'min-w:200px';
                                                case 'CheckBox':
                                                    return 'min-w:50px';
                                                case 'SelectBox':
                                                    return 'min-w:200px';
                                                default:
                                                    return '';
                                            }
                                        })()}`}>

                                        <div class="align-items:center">
                                            <DefaultValue/>
                                            <Content/>
                                        </div>
                                    </td>
                                </Match>
                            </Switch>
                        );
                    }}
                </For>
            );
        };

        return (
            <>
                <tr
                    // use:sortable
                    // classList={{ "opacity-25": sortable.isActiveDraggable }}
                    style={{"text-align": "center", width: "50px"}}
                >
                    <td>
                        {p.joinVertex.P.pos}
                        {/*<Icon icon="material-symbols:drag-indicator" width={25} height={25} />*/}

                        {/*<Icon icon="mingcute:up-fill"  />*/}
                        {/*<Icon icon="mingcute:down-fill"  />*/}
                        {/*<Icon icon="material-symbols:add-box"  />*/}
                        <div>
                            <Icon
                                height={20}
                                width={20}
                                icon="mingcute:delete-line"
                                class="cursor:pointer m:5px"
                                style={{color: "red"}}
                                onClick={() =>
                                    deleteRow(p.joinVertex, props.isRealTime!, graph, setGraph, props.txnId!, Ws)
                                }
                            />
                        </div>
                        {/*<Show when={!props.disabled}>*/}
                        {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
                        {/*</Show>*/}

                        <Show when={expandVertex()}>
                            <Icon
                                height={20}
                                width={20}
                                icon="icon-park-outline:plus"
                                class="cursor:pointer "
                                style={{color: "green"}}
                                onClick={() => {
                                    return addNewRow(
                                        props.txnId || 0,
                                        expandVertex()!, graph, setGraph,
                                        p.joinVertex,
                                        {},
                                        props.isRealTime ?? false,
                                        Ws
                                    );
                                }}
                            />
                        </Show>
                    </td>
                    <DisplayProperties/>
                </tr>
                {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
                {/*{getSelectionOptions([p.joinVertex], expandVertex.P.props.collection).vertexes?.length}*/}
                <Show when={expandVertex()}>
                    <tr>
                        <td class="pl:24" colspan={rowColumnsMetaAttrs().length + 1}>
                            <DynamicComponent
                                component={"Table2"}
                                // When we have a Table we pass original Table Meta Vertex
                                meta={expandVertex()!}
                                data={p.joinVertex}
                                setValue={props.setValue}
                                disabled={disabled()}
                                txnId={props.txnId}
                                isRealTime={props.isRealTime}
                            />
                        </td>
                    </tr>
                </Show>
            </>
        );
    };

    const insertNewRow = () => {
        if (!props.data) {
            alert("Table data is not set");
            return;
        }

        return runWithOwner(outerOwner, () =>
            addNewRow(
                props.txnId || 0,
                props.meta, graph, setGraph,
                props.data!,
                {},
                props.isRealTime ?? false,
                Ws
            )
        );
    };
    const AddNewButton = (isInTableButton: any) => {
        return (
            <GenericField
                meta={
                    {
                        P: {
                            component: "Button",
                            props: {
                                children: "Add",
                                variant: "soft",
                                onClick: () => insertNewRow(),
                            },
                        },
                    } as unknown as Vertex
                }
            />
        );
    };

    return (
        <Switch>
            <Match when={tableColumnsTemplate().length === 0}>
                Please Define table columns
            </Match>
            <Match when={true}>
                <div>
                    {/*<Show when={props.meta.P.attributes}>*/}
                    {/*  <FormGroup form={{title: '', label: props.meta.P.props.title || props.meta.P[IdAttr], attributes: props.meta.P.attributes}} vertex={props.vertex}/>*/}
                    {/*</Show>*/}
                    {/*<Show when={sortedVertexes().length}>*/}
                    <AddNewButton/>
                    {/*</Show>*/}

                    <DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>

                    <table class="styled-table mt:3">
                        {}
                        <Show when={sortedVertexes().length}>
                            <thead>
                            <tr
                                style={{
                                    width: "max-content",
                                }}
                            >
                                <td></td>
                                <For each={tableColumnsTemplate()}>
                                    {(attribute) => {
                                        return (
                                            <Switch>
                                                {/*<Match when={attribute.props?.skip}></Match>*/}
                                                <Match when={attribute.P.tab === "expand"}>
                                                    <span></span>
                                                </Match>
                                                <Match
                                                    when={
                                                        !attribute.P.hidden || attribute.P.defaultValue
                                                    }
                                                >
                                                    <th
                                                        class={'font-weight:medium'}
                                                        style={{
                                                            "justify-content": "center",
                                                        }}
                                                    >
                                                        {toTitle(
                                                            attribute.P.displayName ||
                                                            attribute.P[IdAttr] ||
                                                            ""
                                                        )}
                                                    </th>
                                                </Match>

                                                <Match when={true}>
                                                    <th></th>
                                                </Match>
                                            </Switch>
                                        );
                                    }}
                                </For>
                            </tr>
                            </thead>
                        </Show>
                        <tbody>
                        {/*<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>*/}
                        {/*  <DragDropSensors />*/}
                        {/*  <SortableProvider ids={ids()}>*/}
                        <For each={sortedVertexes()}>
                            {(vertex, index) => (
                                <RepeaterContext.Provider
                                    value={[vertex, ...useContext(RepeaterContext)]}
                                >
                                    <SortableRow joinVertex={vertex} index={index()}/>
                                </RepeaterContext.Provider>
                            )}
                        </For>
                        {/*  </SortableProvider>*/}
                        {/*</DragDropProvider>*/}
                        </tbody>
                    </table>

                </div>

                {/*<Show when={props.Page}>*/}
                {/*  <For each={Object.values(props.Page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
                {/*</Show>*/}
            </Match>
        </Switch>
    );
}
