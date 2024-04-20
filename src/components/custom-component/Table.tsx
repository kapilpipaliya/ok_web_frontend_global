import {createMemo, createSignal, For, Match, Switch} from "solid-js";
import {Show} from "solid-js";
import '../css/table.css'
import {capitalizeFirstLetter} from "~/lib/Utils";
import {Vertex} from "~/lib/graph";
import {ColumnDef} from "@tanstack/solid-table";

// Row component for each data entry
function Row(props: { row: Vertex,  index: number, headers: ColumnDef<any>[] }) {
    const [open, setOpen] = createSignal(false);
    const getValue = (header: ColumnDef<any>) => {
                const keys = header.accessorKey.split('.'); // Split accessorKey by '.'
                let value = props.row;
                for (const key of keys) {
                    value = value[key];
                }
                return value;
    }
    return (
        <>
            <TableBodyRow index={props.index}>
                <For each={props.headers}>
                    {(header, columnIndex) => {
                        return <TableData>
                            <Switch>
                                <Match when={header.accessorKey === 'Edit' || header.accessorKey === 'Delete'}>
                                    {header.cell?.({row: {original: props.row}, getValue: () => getValue(header)})}
                                </Match>
                                <Match when={true}>
                                    {header.cell?.({row: {original: props.row}, getValue: () => getValue(header)})}
                                </Match>
                            </Switch>
                        </TableData>;
                    }}
                </For>
                <TableData>
                    <Show when={props.row.children}>
                        <button onClick={() => setOpen(!open())}>
                            {open() ? "↑" : "↓"}
                        </button>
                    </Show>
                </TableData>
            </TableBodyRow>
            <Show when={open()}>
                <For each={props.row.children}>{(row, index) => <Row row={row} index={index()}
                                                                     bodyCell={props.row.headers.map((header: any) => header.cell(row.id))}
                                                                     headerAccessorKey={props.row.headers.map((header: any) => header.accessorKey)}/>}</For>
            </Show>
        </>
    );
}

// Main component that renders the table
function CollapsibleTable(props: { headers: ColumnDef<any>[], rows: Vertex[] }) {
    return (
        <div class={'w:full'}>
            <Table>
                <TableHead>
                    <TableHeadRow>
                        <For each={props.headers}>
                            {(header) => {
                                return <TableHeader>{capitalizeFirstLetter(header.name || '')}</TableHeader>
                            }}
                        </For>
                        <TableHeader/>
                    </TableHeadRow>
                </TableHead>
                <TableBody>
                    <For each={props.rows}>{(row, index) => <Row row={row} index={index()}
                                                                 headers={props.headers}/>}</For>
                </TableBody>
            </Table>
        </div>
    );
}

const Table = (props: any) => <table {...props} class={'mt:5 styled-table w:100%'}>{props.children}</table>

const TableHeader = (props: any) => <th {...props}
                                        class={`font-weight:medium h:45 p:10px bb:1px|solid|rgb(190,211,238)`}>{props.children}</th>
const TableBody = (props: any) => <tbody {...props} class="r:5|5|5|5 rounded-md ">{props.children}</tbody>
const TableHead = (props: any) => <thead {...props} class="r:5|5|5|5 ">{props.children}</thead>
const TableHeadRow = (props: any) => <tr {...props} class="p:10 text:center">{props.children}</tr>
const TableBodyRow = (props: any) => <tr {...props}
                                         class={`h:50 text:center bg:${props.index % 2 === 0 ? "white" : "gray-5"} bg:#E0F1FF:hover`}>{props.children}</tr>
const TableData = (props: any) => <td {...props} class={'bb:1px|solid|rgb(227,231,236)'}>{props.children}</td>

export default CollapsibleTable;
