import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import "~/css/table.css";
import { capitalizeFirstLetter } from "~/lib/Utils";
import { IdAttr, Vertex } from "~/lib/graph/graph";
import { ColumnDef } from "@tanstack/solid-table";
import { toTitle } from "case-switcher-js";
import { Icon } from "@iconify-icon/solid";
import { TableRow } from "../solid-blocks/blocks/table/table";
import { Tooltip } from "../solid-blocks/blocks";

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
                  <Match when={header === "Edit"}>
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
        <Show when={props.row.children}>
          <TableData>
            <button onClick={() => setOpen(!open())}>
              {open() ? "↑" : "↓"}
            </button>
          </TableData>
        </Show>
      </TableBodyRow>
      <Show when={open()}>
        <For each={props.row.children}>
          {(row, index) => (
            <TableBodyRow
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
  const [currentPage, setCurrentPage] = createSignal(0);
  const [rowsPerPage, setRowsPerPage] = createSignal(10);

  const totalPages = () => Math.ceil(props.rows.length / rowsPerPage());

  const displayedRows = () => {
    const startIndex = currentPage() * rowsPerPage();
    return props.rows.slice(startIndex, startIndex + rowsPerPage());
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages() - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };
  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages() - 1);
  };
  const handleRowsPerPageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setRowsPerPage(Number(target.value));
    setCurrentPage(0); // Reset to the first page when rows per page changes
  };
  return (
    <div
      style={{ "box-shadow": "0 0 20px rgba(0, 0, 0, 0.15)", width: "100%" }}
      class="r:10px"
    >
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
          </TableHeadRow>
        </TableHead>
        <TableBody>
          <For
            each={displayedRows()}
            fallback={
              <tr>
                <td
                  colspan={props.headers.length + 1}
                  style="text-align: center; padding: 1rem;"
                >
                  No records to display
                </td>
              </tr>
            }
          >
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
      <Show when={displayedRows().length > 0}>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: .5rem 1rem;">
          <div style="margin-right: 1rem;">
            <label for="rowsPerPage">Rows per page:</label>
            <select
              name="page"
              id="page"
              onChange={handleRowsPerPageChange}
              value={rowsPerPage()}
              style="margin-left: 0.5rem;"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div style="margin-right: 1rem;" class="font-weight:500">
            <span>{`${currentPage() * rowsPerPage() + 1}-${Math.min(
              (currentPage() + 1) * rowsPerPage(),
              props.rows.length,
            )} of ${props.rows.length}`}</span>
          </div>
          <div class="flex gap:10px">
            <Tooltip content="Move first">
              <button
                onClick={handleFirstPage}
                disabled={currentPage() === 0}
                style={{ color: currentPage() === 0 ? "lightgrey" : "black" }}
                class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              >
                <Icon
                  height={22}
                  width={22}
                  icon={"icon-park-outline:go-start"}
                />
              </button>
            </Tooltip>
            <Tooltip content="Previous">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage() === 0}
                style={{ color: currentPage() === 0 ? "lightgrey" : "black" }}
                class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              >
                <Icon height={22} width={22} icon={"icon-park-outline:left"} />
              </button>
            </Tooltip>
            <Tooltip content="Next">
              <button
                onClick={handleNextPage}
                disabled={currentPage() === totalPages() - 1}
                style={{
                  color:
                    currentPage() === totalPages() - 1 ? "lightgrey" : "black",
                }}
                class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              >
                <Icon height={22} width={22} icon={"icon-park-outline:right"} />
              </button>
            </Tooltip>
            <Tooltip content="Move last">
              <button
                onClick={handleLastPage}
                disabled={currentPage() === totalPages() - 1}
                style={{
                  color:
                    currentPage() === totalPages() - 1 ? "lightgrey" : "black",
                }}
                class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              >
                <Icon
                  height={22}
                  width={22}
                  icon={"icon-park-outline:go-end"}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </Show>
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
  <div class="overflow:visible rel r:10" style={{ "scrollbar-width": "thin" }}>
    <table {...props} class={"styled-table w:100%"}>
      {props.children}
    </table>
  </div>
);

export const TableHeader = (props: any) => (
  <th
    {...props}
    class={`font-weight:medium h:45 p:10px bb:1px|solid|rgb(190,211,238) @fade|.4s`}
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
  <tr {...props} class="p:10 text:center @fade|.4s">
    {props.children}
  </tr>
);
export const TableBodyRow = (props: any) => (
  <tr
    {...props}
    class={`h:50 text:center bg:${props.index % 2 === 0 ? "white" : "#3478cc0d"} bg:#3478cc0d:hover @fade|.4s`}
  >
    {props.children}
  </tr>
);
export const TableData = (props: any) => (
  <td
    {...props}
    style={{ "text-align-last": "center", padding: "7px" }}
    class={"bb:1px|solid|rgb(227,231,236)"}
  >
    {props.children}
  </td>
);
