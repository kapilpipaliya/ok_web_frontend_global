import {createMemo, createSignal, For, Match, Switch} from "solid-js";
import {Show} from "solid-js";
import '../css/table.css'
import {capitalizeFirstLetter} from "~/lib/Utils";
import {Icon} from "@iconify-icon/solid";
import CustomButton from "~/components/solid-blocks/blocks/buttons";

// Helper function to create row data
function createData(name, calories, fat, carbs, protein, price, children?) {
    return {
        name,
        calories,
        fat,
        carbs,
        protein,
        price,
        children,
    };
}

// Row component for each data entry
function Row(props: { row: any,  index: any, headers: any }) {
    const [open, setOpen] = createSignal(false);
    const rowData = createMemo(() => {
        return props.headers.map(header => {
            console.log(props.row)
            if (header.accessorKey === 'Edit' || header.accessorKey === 'Delete') {
                return header.accessorKey;
            }
            const keys = header.accessorKey.split('.'); // Split accessorKey by '.'
            let value = props.row;
            for (const key of keys) {
                value = value[key];
            }
            return value;
        });
    });
    return (
        <>
            <TableBodyRow index={props.index}>
                <For each={rowData()}>
                    {(value, columnIndex) => {
                        return <TableData key={columnIndex()}>
                            <Switch>
                                <Match when={value === 'Edit'}>
                                    {/*{JSON.stringify(props.headers)}*/}
                                    {props.headers?.cell?.()}
                                </Match>
                                <Match when={value}>
                                    {value ? capitalizeFirstLetter(value.toString()) : value}
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
function CollapsibleTable(props: { headers: any, rows: any }) {
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
