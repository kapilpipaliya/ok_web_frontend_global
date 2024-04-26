// Comment This Lines in web build
import {A, useNavigate, useParams} from "@solidjs/router";
import {
    CellContext,
    ColumnDef,
    createSolidTable,
    flexRender,
    getCoreRowModel,
} from '@tanstack/solid-table';
import {
    For,
    Show,
    createEffect,
    createSignal,
    onCleanup,
    splitProps,
    useContext, Switch, Match, Accessor, Setter
} from "solid-js";
import {
    Id,
    IdAttr,
    ProcessStatus,
    Vertex,
    commitTransaction,
    getNewTxnId,
    transactions, GraphContext, GraphInterface
} from "~/lib/graph";

import {Icon} from "@iconify-icon/solid";
import {GenericField} from "~/components/input/Components/GenericFieldComponent";
import {
    collectionNameDisplayExpr,
    selectedValue
} from "~/components/input/SelectInputField";
import {getFormApiFromForm} from "~/lib/Record";
import {APP_BASE_URL, PageContext} from "~/lib/Utils";
import {getSelectionOptions} from "~/lib/Utils";
import {getChildVertexes} from "~/lib/Utils";
import {deleteVertex, findVertexByLabelAndUniqueId} from "~/lib/Vertex";
import {AttrsTableData} from "~/lib/api";
import {isNumber} from "~/lib/CommonUtils/isNumber";
import {capitalizeFirstLetter} from "~/lib/Utils";
import {WsContext} from "~/utils/ws_events_dispatcher";
import {AbstractSingleForm} from "~/components/DynamicForm";
import CustomButton from "~/components/solid-blocks/blocks/buttons";
import {AttrsAdminTableData} from "~/lib/apiAdmin";
import {FieldAttribute, FormMetaData} from "~/lib/Type";
import {CollapsibleTable} from "~/components/custom-component/Table";
import Dismiss from "solid-dismiss";
import {SetStoreFunction} from "solid-js/store";

interface AbstractSingleGridProps {
    tableId: string;
}

interface DataGridProps {
    tableId: string;
}

const Modal = (p: {
    graph: GraphInterface,
    setGraph: SetStoreFunction<GraphInterface>,
    rowId: Accessor<any>,
    setRowId: Setter<any>,
    tableId: any,
    info: any
}) => {
    const [open, setOpen] = createSignal(false);
    let btnEl;
    let btnPopUp;

    const closePopUp = () => {
        console.log(p.rowId())
        setOpen(false);
    };

    return (
        <>

            <Icon ref={btnEl} height={22} width={22} color={'grey'} aria-disabled={open()}
                  class={`cursor:pointer bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5 color:cornflowerblue`}
                  onClick={() => {
                      p.setRowId(p.info.row.original.id);

                      console.log(p.rowId())
                      setOpen(true)
                  }}
                  icon={'fluent:edit-12-regular'}>
            </Icon>
            <Show when={p.rowId()}>
                <Dismiss
                    closeWhenEscapeKeyIsPressed={true}
                    menuButton={btnEl}
                    open={open}
                    setOpen={setOpen}
                    menuPopup={btnPopUp}
                    animation={{name: "fade", appendToElement: "menuPopup"}}
                    modal
                >
                    <div
                        class="modal-container"
                        role="presentation"
                        ref={btnPopUp}
                    >
                        <div class="modal min-w:30% r:10px p:0" role="dialog" aria-modal="true" tabindex="-1">
                            <div class={'mb:4 font-weight:bold'}>
                                Quick Edit
                                <button
                                    title={'Close'}
                                    onClick={closePopUp}

                                    class={'bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5'}
                                    style={{float: "right"}}
                                >
                                    ✕
                                </button>
                            </div>
                            <hr class={'fg:lightgrey'}/>
                            <div class={'p:3 mt:10 max-h:50vh overflow:auto'}>
                                <AbstractSingleForm
                                    formId={p.tableId}
                                    graph={p.graph}
                                    id={p.rowId()}
                                    buttonAlign="end"
                                    isDialogContext={true}
                                    // @ts-ignore
                                    config={{}}
                                    showMainFieldsOnly={true}
                                    importExportButtons={false}
                                    doMount={false}
                                    setGraph={p.setGraph}/>
                            </div>
                        </div>
                    </div>
                </Dismiss>
            </Show>
        </>
    );
};
// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/
export const DataGrid = (props: DataGridProps) => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const form = getFormApiFromForm(graph, setGraph, props.tableId);
    let formNew: FormMetaData;
    let collection: string;

    if (form.error) {
        if (AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId]) {
            formNew = AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId];
            collection = props.tableId;
        } else {
            return form.error;
        }
    } else {
        formNew = form.form!;
        // @ts-ignore
        collection = form.form.collection as string;
    }

    const deleteObject = (id: Id) => {
        if (confirm("Are you sure you want to delete this item?")) {
            const txnId = getNewTxnId();
            const deleteResult = deleteVertex(txnId, id, graph, setGraph);
            // @ts-ignore
            if (deleteResult?.error) {
                alert(data);
                return;
            }
            transactions.get(txnId)!.status = ProcessStatus.Ready;
            commitTransaction(Ws);
        }
    };

    const tableColumns = [] as ColumnDef<any>[];
    const [rowId, setRowId] = createSignal(null);
    const SelectValue = (props: { attribute: FieldAttribute, info: CellContext<any, any> }) => {

        const vertex = selectedValue(
            {
                P: props.attribute,
            } as unknown as Vertex,
            props.info.row.original, graph
        );
        if (vertex[0]) {
            return getSelectionOptions(graph, setGraph, [graph.vertexes[vertex[0]]], props.attribute.props?.displayExpr || collectionNameDisplayExpr(graph, props.attribute.props?.collection) || `::'P.${IdAttr}'`).vertexes;
        }
        return "";
    }
    const TagValue = (props: { attribute: FieldAttribute, info: CellContext<any, any> }) => {
        const vertex = selectedValue(
            {
                P: props.attribute,
            } as unknown as Vertex,
            props.info.row.original, graph
        );
        if (vertex) {
            const textArray = [];
            for (const v of vertex) {
                const text = getSelectionOptions(graph, setGraph, [graph.vertexes[v]], props.attribute.props?.displayExpr || `::'P.${IdAttr}'`).vertexes;
                textArray.push(text);
            }
            return textArray.join(', ');
        }
        return "";
    }
    for (const attribute of formNew!.attributes) {

        const column = {...attribute} as unknown as ColumnDef<any>;
        if (attribute.component === "Table") continue;
        // if (attribute.props?.skip) continue;

        // @ts-ignore
        column.accessorKey = `P.${attribute.name}`;
        // column.accessorFn = row => row.lastName;
        column.id = attribute.name;
        column.cell = info => {
            return <Switch>
                <Match when={attribute.component === "SelectBox" && !attribute.props?.items}>
                    <SelectValue attribute={attribute} info={info}/>
                </Match>

                <Match when={attribute.component === "TagBox" && !attribute.props?.items}>
                    <TagValue attribute={attribute} info={info}/>
                </Match>

                <Match when={attribute.component === "CheckBox"}>
                    <span>{info.getValue() === true ? 'true' : info.getValue() === false ? 'false' : ''}</span>
                </Match>

                <Match when={true}>
                    {info.getValue<string>()}
                </Match>
            </Switch>
        };
        // @ts-ignore
        column.header = (info) => capitalizeFirstLetter(info.column.columnDef.displayName || info.column.columnDef.name);
        // @ts-ignore
        column.footer = info => capitalizeFirstLetter(info.column.columnDef.displayName || info.column.columnDef.name);

        // @ts-ignore
        tableColumns.push(column);
    }
    tableColumns.push({
        accessorKey: 'Edit',
        header: '',
        footer: '',
        cell: (info) =>
            <Show when={!formNew.isInlineEditable} fallback={
                <Modal info={info} graph={graph} setGraph={setGraph} rowId={rowId} setRowId={setRowId}
                       tableId={props.tableId}/>
            }>
                <A
                    href={`${APP_BASE_URL}/${props.tableId}/${info.row.original.id}`}
                    class="r:5|5|5|5 p:5"
                >
                    <CustomButton variant={'custom'}><Icon height={21} width={21} class={'color:#3477CC'}
                                                           icon="fluent:edit-12-regular"/></CustomButton>

                </A></Show>


    });
    tableColumns.push({
        accessorKey: 'Delete',
        header: '',
        footer: '',
        cell: info => <button onClick={/*@once*/ () => deleteObject(info.row.original.id as any)}
                              class="text-fill:red font:semibold	">
            <CustomButton variant={'custom'} class={'fg:rgb(252,0,0)'}><Icon height={21} width={21}
                                                                             icon="fluent:delete-12-regular"
                                                                             class="color:red mr:1rem"/></CustomButton>
        </button>
    });

    if (!collection) {
        return <>Incorrect Configuration</>
    }
    // console.log(1, JSON.stringify(props))
    const {Ws} = useContext(WsContext);
    let {events} = useContext(PageContext);
    events?.setTitle(formNew.title);
    onCleanup(() => events?.setTitle(''));


    const coll = isNumber(collection) ? graph.vertexes[collection].P[IdAttr] : collection;
    // if(!graph.vertexLabelIdMap[coll]) {
    //  alert(`collection not found ${coll}`)
    //  return;
    // }
    const [_] = splitProps(props, ["tableId"]);

    const [data] = createSignal((graph.vertexLabelIdMap[coll] || []).map((vertexId: any) => graph.vertexes[vertexId]))

    const table = createSolidTable({
        get data() {
            return data()
        },
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    })


    return (
        <div class="">
                <CollapsibleTable headers={tableColumns} rows={data()}/>
        </div>
    );
};

export const AbstractSingleGrid = (props: AbstractSingleGridProps) => {
    const navigate = useNavigate();
    // used to refresh table:
    const [tableId, setTableId] = createSignal("");
    createEffect(() => {
        // clear the state when routes parameter changes.
        setTableId("");
        props.tableId;
        setTimeout(() => setTableId(props.tableId));
    });

    return (
        <>
            <div class="flex justify-content:right	">
                <GenericField
                    meta={
                        {
                            P: {
                                component: "Button",
                                [IdAttr]: "meta",
                                props: {
                                    onClick: () => navigate("new"),
                                    variant: "soft",
                                    style: {"padding":"7px 10px"},
                                    leading: <Icon icon={'lets-Website Icons:add-round'} height={22} width={22}/>,
                                    children: "Add New",
                                },
                            },
                        } as unknown as Vertex
                    }
                />
            </div>
            <Show when={tableId()}>

                <DataGrid tableId={tableId()}/>
            </Show>
        </>
    );
};

export const TableDashboard = () => {
    const params = useParams();
    const [graph, setGraph] = useContext(GraphContext)!;
    const dashboard = findVertexByLabelAndUniqueId('Dashboard', IdAttr, params.name, graph);
    if (!dashboard) {
        return "No Dashboard Found";
    }
    const allFormTableLayouts =
        getChildVertexes(graph, ["$0Form"], [dashboard]).vertexes || [];
    const allCollTableLayouts =
        getChildVertexes(graph, ["$0Coll"], [dashboard]).vertexes || [];

    const allTableLayouts = () => [...new Set([...allCollTableLayouts, ...allFormTableLayouts])];
    return (

        <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
            <For each={allTableLayouts()}>
                {(tableLayout) => (
                    <div class="bg:gray-5 box-shadow:1|1|1|1|gray-20 pb:50 pt:50 r:7|7|7|7 r:10 flex">
                        <h3 class="f:18@md font:semibold"></h3>
                        <p class="mt:5 mb:0 mx:auto f:18@md font:semibold">
                            <A href={`${APP_BASE_URL}/${tableLayout.P[IdAttr]}`}>
                                {tableLayout.P.title || tableLayout.P[IdAttr]}
                            </A>
                        </p>
                    </div>
                )}
            </For>
        </div>
    );
};

export const AllDashboards = () => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const vertexes = () => graph.vertexLabelIdMap["Dashboard"] || [];
    return (
        <div class="">
            <For each={vertexes()}>{(vertexId) => <A
                href={`${APP_BASE_URL}/grid/${graph.vertexes[vertexId].P[IdAttr]}`}>{graph.vertexes[vertexId].P[IdAttr]}</A>}</For>
        </div>
    );
}
