import { createMemo, createSignal, For, Match, Switch } from "solid-js";
import { Show } from "solid-js";
import "~/css/table.css";
import { addNewRow, capitalizeFirstLetter } from "~/lib/Utils";
import { IdAttr, Vertex } from "~/lib/graph";
import { ColumnDef } from "@tanstack/solid-table";
import { toTitle } from "case-switcher-js";
import { Icon } from "@iconify-icon/solid";
import { TableRow } from "~/components/solid-blocks/blocks/table/table";

// Row component for each data entry
function CollapsibleTableRow(props: {
  row: Vertex;
  index: number;
  headers: ColumnDef<any>[];
}) {
  const [open, setOpen] = createSignal(false);
  const getValue = (header: ColumnDef<any>) => {
    const keys = header.accessorKey.split("."); // Split accessorKey by '.'
    let value = props.row;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  };
  return (
    <>
      <TableBodyRow index={props.index} id={`grid${props.row.id}   `}>
        <For each={props.headers}>
          {(header: any, columnIndex) => {
            return (
              <TableData>
                <Switch>
                  <Match
                    when={
                      header.accessorKey === "Edit" ||
                      header.accessorKey === "Delete"
                    }
                  >
                    {header.cell?.({
                      row: { original: props.row },
                      getValue: () => getValue(header),
                    })}
                  </Match>
                  <Match when={true}>
                    {header.cell?.({
                      row: { original: props.row },
                      getValue: () => getValue(header),
                    })}
                  </Match>
                </Switch>
              </TableData>
            );
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
        <For each={props.row.children}>
          {(row, index) => (
            <TableRow
              row={row}
              index={index()}
              bodyCell={props.row.headers.map((header: any) =>
                header.cell(row.id),
              )}
              headerAccessorKey={props.row.headers.map(
                (header: any) => header.accessorKey,
              )}
            />
          )}
        </For>
      </Show>
    </>
  );
}

// Main component that renders the table
export const CollapsibleTable = (props: {
  headers: ColumnDef<any>[];
  rows: Vertex[];
}) => {
  return (
    <div class={"w:full"}>
      <Table>
        <TableHead>
          <TableHeadRow>
            <For each={props.headers}>
              {(header) => {
                return (
                  <TableHeader>
                    {capitalizeFirstLetter(header.name || "")}
                  </TableHeader>
                );
              }}
            </For>
            <TableHeader />
          </TableHeadRow>
        </TableHead>
        <TableBody>
          <For each={props.rows}>
            {(row, index) => (
              <CollapsibleTableRow
                row={row}
                index={index()}
                headers={props.headers}
              />
            )}
          </For>
        </TableBody>
      </Table>
    </div>
  );
};

function DataTableRow(props: { index: any; vertex: any }) {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <TableBodyRow index={props.index}>
        <TableData>
          <button onClick={() => setOpen(!open())}>{open() ? "↑" : "↓"}</button>
        </TableData>
        <TableData>
          <div class={"flex ai:center jc:center"}>
            <Icon
              height={20}
              width={20}
              icon="mingcute:delete-line"
              class="cursor:pointer m:5px"
              style={{ color: "red" }}
            />
            <Icon
              height={20}
              width={20}
              icon="icon-park-outline:plus"
              class="cursor:pointer "
              style={{ color: "green" }}
            />
          </div>
        </TableData>
        <For each={["asd", "asd"]}>
          {(header, columnIndex) => {
            return <TableData>{header}</TableData>;
          }}
        </For>
      </TableBodyRow>
      <Show when={open()}>
        <TableBodyRow>
          <TableData colSpan={12}>asd</TableData>
        </TableBodyRow>
      </Show>
    </>
  );
}

export const DataTable = (props: { headers: any; rows: any }) => {
  return (
    <div class={"w:80vw overflow:auto"}>
      <Table>
        <Show when={props.rows.length > 0}>
          <TableHead>
            <TableHeadRow>
              <TableHeader />
              <TableHeader>Actions</TableHeader>
              <For each={props.headers}>
                {(attribute) => {
                  return (
                    <Switch>
                      <Match when={attribute.P.tab === "expand"}>
                        <span></span>
                      </Match>
                      <Match
                        when={!attribute.P.hidden || attribute.P.defaultValue}
                      >
                        <TableHeader
                          class={"font-weight:medium"}
                          style={{
                            "justify-content": "center",
                          }}
                        >
                          {toTitle(
                            attribute.P.displayName ||
                              attribute.P[IdAttr] ||
                              "",
                          )}
                        </TableHeader>
                      </Match>

                      <Match when={true}>
                        <TableHeader></TableHeader>
                      </Match>
                    </Switch>
                  );
                }}
              </For>
            </TableHeadRow>
          </TableHead>

          <TableBody>
            <For each={props.rows}>
              {(vertex, index) => (
                <DataTableRow vertex={vertex} index={index()} />
              )}
            </For>
          </TableBody>
        </Show>
      </Table>
    </div>
  );
};

export const Table = (props: any) => (
  <table {...props} class={"styled-table w:100%"}>
    {props.children}
  </table>
);

export const TableHeader = (props: any) => (
  <th
    {...props}
    class={`font-weight:medium h:45 p:10px bb:1px|solid|rgb(190,211,238)`}
  >
    {props.children}
  </th>
);
export const TableBody = (props: any) => (
  <tbody {...props} class="r:5|5|5|5 rounded-md ">
    {props.children}
  </tbody>
);
export const TableHead = (props: any) => (
  <thead {...props} class="r:5|5|5|5 ">
    {props.children}
  </thead>
);
export const TableHeadRow = (props: any) => (
  <tr {...props} class="p:10 text:center">
    {props.children}
  </tr>
);
export const TableBodyRow = (props: any) => (
  <tr
    {...props}
    class={`h:50 text:center bg:${props.index % 2 === 0 ? "white" : "#3478cc0d"} bg:#3478cc0d:hover`}
  >
    {props.children}
  </tr>
);
export const TableData = (props: any) => (
  <td
    {...props}
    style={{ "text-align-last": "center", padding: "inherit" }}
    class={"bb:1px|solid|rgb(227,231,236)"}
  >
    {props.children}
  </td>
);
