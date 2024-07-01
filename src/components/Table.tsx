import type { ColumnDef } from "@tanstack/solid-table";

import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  For,
  type JSX,
  Match,
  Show,
  Switch, createSignal,
} from "solid-js";

import { Tooltip } from "~/components/solid_blocks";

type TableProps = {
  data: any[];
  defaultRowsPerPage?: number;
  headers: ColumnDef<any>[];
  isSearching: boolean;
  isShowLoadMore?: boolean;
  onLoadMore: (skip: number, limit: number) => void;
  rowsPerPageOptions?: number[];
  totalItems: number;
};

export function CommonTable(props: Readonly<TableProps>) {
  const [currentPage, setCurrentPage] = createSignal(0);
  const [rowsPerPage, setRowsPerPage] = createSignal(
    props.defaultRowsPerPage ?? 10,
  );

  const totalPages = () => Math.ceil(props.totalItems / rowsPerPage());

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages() - 1)));
  };

  const handleNextPage = () => handlePageChange(currentPage() + 1);
  const handlePreviousPage = () => handlePageChange(currentPage() - 1);
  const handleFirstPage = () => handlePageChange(0);
  const handleLastPage = () => handlePageChange(totalPages() - 1);

  const displayedRows = () => {
    const startIndex = currentPage() * rowsPerPage();
    const endIndex = startIndex + rowsPerPage();
    return props.data.slice(startIndex, endIndex);
  };

  const handleRowsPerPageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newRowsPerPage = Number(target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const getValue = (header: any, row: any) => {
    const keys = header.accessorKey.split("."); // Split accessorKey by '.'
    let value = row;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  };

  return (
    <div style="box-shadow: 0 0 20px rgba(0, 0, 0, 0.15); width: 100%; border-radius: 10px;">
      <Table headers={props.headers.length}>
        <For each={props.headers}>
          {(header) => (
            <TableHeadCell>
              {header.header}
            </TableHeadCell>
          )}
        </For>
        <For
          each={displayedRows()}
          fallback={
            <div
              class={`grid-column-span:${props.headers.length}`}
              style="display: flex; justify-content: center; padding: 1rem; "
            >
              No records to display
            </div>
          }
        >
          {(row, index) => (
            <For each={props.headers}>
              {(header: any) => (
                <TableBodyCell index={index()}>
                  <Switch>
                    <Match when={header === "Edit"}>
                      {header.cell?.({
                        getValue: () => getValue(header, row),
                        row: { original: row },
                      })}
                    </Match>
                    <Match when={true}>
                      {header.cell?.({
                        getValue: () => getValue(header, row),
                        row: { original: row },
                      })}
                    </Match>
                  </Switch>
                </TableBodyCell>
              )}
            </For>
          )}
        </For>
      </Table>
      <TableActions
        currentPage={currentPage}
        data={props.data}
        displayedRows={displayedRows}
        handleFirstPage={handleFirstPage}
        handleLastPage={handleLastPage}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        handleRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={props.rowsPerPageOptions}
        totalPages={totalPages}
      />
      <Show
        when={
          (currentPage() === totalPages() - 1 ||
            (currentPage() === 0 && props.data.length < props.totalItems)) &&
          props.isShowLoadMore &&
          !props.isSearching
        }
      >
        <div style="display: flex; justify-content: end; padding: 5px 10px;">
          <button
            onClick={() => props.onLoadMore(props.data.length, rowsPerPage())}
          >
            Load More
          </button>
        </div>
      </Show>
    </div>
  );
}

const TableActions = (props: Readonly<{
  currentPage: Accessor<number>;
  data: any;
  displayedRows: Accessor<any[]>;
  handleFirstPage: () => void;
  handleLastPage: () => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleRowsPerPageChange: (e: Event) => void;
  rowsPerPage: Accessor<number>;
  rowsPerPageOptions?: number[];
  totalPages: Accessor<number>;
}>) => {
  return (
    <Show when={props.displayedRows().length > 0}>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: .5rem 1rem;">
        <div style="margin-right: 1rem;">
          <label html-for="rowsPerPage">Rows per page:</label>
          <select
            id="rowsPerPage"
            onChange={props.handleRowsPerPageChange}
            style="margin-left: 0.5rem;"
            value={props.rowsPerPage()}
          >
            <For each={props.rowsPerPageOptions || [10,20,50,100]}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </select>
        </div>
        <div class="font-weight:500" style="margin-right: 1rem;">
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </div>
        <div class="flex gap:10px">
          <Tooltip content="Move first">
            <button
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              disabled={props.currentPage() === 0}
              onClick={props.handleFirstPage}
              style={{
                color: props.currentPage() === 0 ? "lightgrey" : "black",
              }}
            >
              <Icon
                height={22}
                icon={"icon-park-outline:go-start"}
                width={22}
              />
            </button>
          </Tooltip>
          <Tooltip content="Previous">
            <button
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              disabled={props.currentPage() === 0}
              onClick={props.handlePreviousPage}
              style={{
                color: props.currentPage() === 0 ? "lightgrey" : "black",
              }}
            >
              <Icon height={22} icon={"icon-park-outline:left"} width={22} />
            </button>
          </Tooltip>
          <Tooltip content="Next">
            <button
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              disabled={props.currentPage() === props.totalPages() - 1}
              onClick={props.handleNextPage}
              style={{
                color:
                  props.currentPage() === props.totalPages() - 1
                    ? "lightgrey"
                    : "black",
              }}
            >
              <Icon height={22} icon={"icon-park-outline:right"} width={22} />
            </button>
          </Tooltip>
          <Tooltip content="Move last">
            <button
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
              disabled={props.currentPage() === props.totalPages() - 1}
              onClick={props.handleLastPage}
              style={{
                color:
                  props.currentPage() === props.totalPages() - 1
                    ? "lightgrey"
                    : "black",
              }}
            >
              <Icon height={22} icon={"icon-park-outline:go-end"} width={22} />
            </button>
          </Tooltip>
        </div>
      </div>
    </Show>
  );
};

export function Table(props: Readonly<{ children: JSX.Element; class?: string; headers: number }>) {
  return (
    <div
      class="overflow:visible rel r:10"
      style={{ "scrollbar-width": "thin" }}
    >
      <div
        class={`grid bb:2px|solid|#37c ${props.class || ""}`}
        style={`grid-template-columns: repeat(${props.headers}, 1fr);width: 100%; border-radius: 10px;overflow: auto;scrollbar-width: thin;font-size: 0.9em;`}
      >
        {props.children}
      </div>
    </div>
  );
}

export function TableHeadCell(props: any) {
  return (
    <div
      class="font-weight:600 bg:#37c color:white p:10 border:1px|solid|#347fdd;"
      style="padding: 10px; text-align: center;"
    >
      {props.children}
    </div>
  );
}

export function TableBodyCell(props: Readonly<{
  children: JSX.Element;
  class?: string;
  index?: number;
}>) {
  return (
    <div
      class={`h:50 text:center bg:${
        props.index ? (props.index % 2 === 0 ? "white" : "#3478cc0d") : ""
      } @fade|.4s ${props.class}`}
      style="padding: 7px; align-content: center;"
    >
      {props.children}
    </div>
  );
}
