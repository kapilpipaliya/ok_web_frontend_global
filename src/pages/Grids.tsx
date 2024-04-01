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
    useContext, Switch, Match
} from "solid-js";
import {
    Id,
    IdAttr,
    ProcessStatus,
    Vertex,
    commitTransaction,
    getNewTxnId,
    graph,
    transactions
} from "../lib/graph";

import {Icon} from "@iconify-icon/solid";
import { GenericField } from "../components/input/Components/GenericFieldComponent";
import {
    collectionNameDisplayExpr,
    selectedValue
} from "../components/input/SelectInputField";
import {getFormApiFromForm} from "../lib/Record";
import { FieldAttribute } from "../lib/Utils";
import { FormMetaData } from "../lib/Utils";
import { PageContext } from "../lib/Utils";
import { getSelectionOptions } from "../lib/Utils";
import { getChildVertexes } from "../lib/Utils";
import {deleteVertex, findVertexByLabelAndUniqueId} from "../lib/Vertex";
import {AttrsTableData} from "../lib/api";
import { AttrsAdminTableData } from "../lib/Utils";
import { isNumber } from "../lib/CommonUtils/isNumber";
import { capitalizeFirstLetter } from "../lib/Utils";
import {WsContext} from "../utils/ws_events_dispatcher";
import {AbstractSingleForm} from "../components/DynamicForm";
import CustomButton from "../components/solid-blocks/blocks/buttons";


interface DataGridProps {
    tableId: string;
}

// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/
export const DataGrid = (props: DataGridProps) => {
    const form = getFormApiFromForm(props.tableId);

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
    console.log(formNew);

    const deleteObject = (id: Id) => {
        if (confirm("are you sure")) {
            const txnId = getNewTxnId();
            const deleteResult = deleteVertex(txnId, id);
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
            props.info.row.original,
        );
        if (vertex[0]) {
            return getSelectionOptions([graph.vertexes[vertex[0]]], props.attribute.props?.displayExpr || collectionNameDisplayExpr(props.attribute.props?.collection) || `::'P.${IdAttr}'`).vertexes;
        }
        return "";
    }
    const TagValue = (props: { attribute: FieldAttribute, info: CellContext<any, any> }) => {
        const vertex = selectedValue(
            {
                P: props.attribute,
            } as unknown as Vertex,
            props.info.row.original,
        );
        if (vertex) {
            const textArray = [];
            for (const v of vertex) {
                const text = getSelectionOptions([graph.vertexes[v]], props.attribute.props?.displayExpr || `::'P.${IdAttr}'`).vertexes;
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
        cell: info =>
            // return <Link href={`/${props.tableId}/${info.row.original.id}`}><Icon icon="tabler:edit" />Edit</Link>;
        {
            return !formNew.isInlineEditable ?
                <A
                 href={`/${props.tableId}/${info.row.original.id}`}
                  replace={true}
                  class="r:5|5|5|5 p:5"
                >
                    <CustomButton variant={'custom'} class={'bg:red'}><Icon icon="fluent:edit-12-regular"/></CustomButton>
                </A> :
                <button onClick={() => {
                    if (rowId() === null) {
                        setRowId(info.row.original.id);
                    } else if (rowId() === info.row.original.id) {
                        setRowId(null);
                    } else {
                        setRowId(null);
                        setRowId(info.row.original.id)
                    }


                    let gridElement = document.getElementById(`grid${info.row.id}`)
                    let editElement = document.getElementById(`edit${rowId()}`)

                    if (editElement && gridElement) {
                        gridElement?.after(editElement)
                        editElement?.scrollIntoView(false)
                    }


                }} class="text-fill:#337ab7"><CustomButton variant={'custom'} class={'bg:red'}><Icon icon="fluent:edit-12-regular"/></CustomButton></button>

        }
    });
    tableColumns.push({
        accessorKey: 'Delete',
        header: '',
        footer: '',
        cell: info => <button onClick={/*@once*/ () => deleteObject(info.row.original.id as any)}
                              class="text-fill:red font:semibold	">
            <CustomButton variant={'custom'} class={'fg:rgb(252,0,0)'}><Icon  icon="fluent:delete-12-regular"
                                                                     class="color:red mr:1rem"/></CustomButton>
            </button>
    });
    console.log(tableColumns)

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

    const [data] = createSignal((graph.vertexLabelIdMap[coll] || []).map(vertexId => graph.vertexes[vertexId]))

    const table = createSolidTable({
        get data() {
            return data()
        },
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    })
    console.log(table.getHeaderGroups())
    return (
        <div class="py:5">

            <div class="p:2">
                <table class="b:1.5px|solid|rgb(190,211,238) w:full bg:rgb(232,237,241) r:5|5|5|5 ">
                    <thead class="r:5|5|5|5 ">
                    <For each={table.getHeaderGroups()}>
                        {headerGroup => (
                            <tr class="p:10 text:center h:50 ">
                                <For each={headerGroup.headers}>
                                    {(header,index) => (

                                        <th class={`w:${header.id.includes("Edit")||header.id.includes("Delete")?"2%":"2%"} p:10px bb:1px|solid|rgb(190,211,238)`}>
                                             {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    )}
                                </For>

                            </tr>

                        )}
                    </For>
                    </thead>
                    <tbody class="r:5|5|5|5 rounded-md">

                    <For each={table.getRowModel().rows}>
                        {(row,index) => (
                            <tr
                                id={`grid${row.id}`}
                                class={`h:50 text:center bg:${row.index % 2 === 0 ? "white" : "gray-5"} {bg:#E0F1FF;px:50}:hover `}
                            >
                                <For each={row.getVisibleCells()}>
                                    {cell => (
                                        <td class={'p:10px'}>

                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>

                                    )}

                                </For>

                            </tr>
                        )}

                    </For>
                    <Show when={rowId() != null}>
                        <tr id={`edit${rowId()}`}>

                            <td colSpan={"100%"}>

                                <div class="">

                                    <AbstractSingleForm
                                        formId={props.tableId}
                                        id={rowId() as unknown as string}
                                        // @ts-ignore
                                        config={{}}
                                        showMainFieldsOnly={true}
                                        importExportButtons={false}
                                        doMount={false}
                                    />

                                </div>

                            </td>

                        </tr>
                    </Show>


                    </tbody>
                </table>

            </div>
        </div>
    );
};

interface AbstractSingleGridProps {
    tableId: string;
}

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
                                    variant: "contained",
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
    const dashboard = findVertexByLabelAndUniqueId('Dashboard', IdAttr, params.name);
    if (!dashboard) {
        return "No Dashboard Found";
    }
    const allFormTableLayouts = getChildVertexes(['$0Form'], [dashboard]).vertexes || [];
    const allCollTableLayouts = getChildVertexes(['$0Coll'], [dashboard]).vertexes || [];

    const allTableLayouts = () => [...new Set([...allCollTableLayouts, ...allFormTableLayouts])];
    return (

        <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
          <For each={allTableLayouts()}>
            {(tableLayout) => (
              <div class="bg:gray-5 box-shadow:1|1|1|1|gray-20 pb:50 pt:50 r:7|7|7|7 r:10 flex">
                <h3 class="f:18@md font:semibold"></h3>
                <p class="mt:5 mb:0 mx:auto f:18@md font:semibold">
                  <A href={`/${tableLayout.P[IdAttr]}`}>
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
    const vertexes = () => graph.vertexLabelIdMap["Dashboard"] || [];
    return (
        <div class="">
            <For each={vertexes()}>{(vertexId) => <A
                href={`/grid/${graph.vertexes[vertexId].P[IdAttr]}`}>{graph.vertexes[vertexId].P[IdAttr]}</A>}</For>
        </div>
    );
}
