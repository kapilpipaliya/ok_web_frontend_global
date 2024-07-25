import type { ColumnDef } from "@tanstack/solid-table";

import {
  For,
  type JSX,
  Match,
  Show,
  Switch,
  createSignal,
} from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { CardDetailRow, CardDetailsContainer } from "~/pages/admin_dashboard/CardDetails";
import { CardHeader } from "~/pages/admin_dashboard/CardHeader";
import { CardOptionsContainer } from "~/pages/admin_dashboard/CardOptions";
import { CardContainer, CardHeaderContainer } from "~/pages/admin_dashboard/SimpleCard";

import { TableActions } from "./TableActions";

type TableProps = {
  cardSize: number;
  data: Vertex[];
  defaultRowsPerPage?: number;
  headers: ColumnDef<any>[];
  isSearching: boolean;
  isShowLoadMore?: boolean;
  layout: 'card' | 'table';
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
    const keys = header.accessorKey.split(".");
    let value = row;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  };

  const FallBack = () => <div
    class={`display:flex grid-column-span:${props.headers.length} justify-content:center padding:1rem`}
  >
    No records to display
  </div>

  const Content = (props: { header: ColumnDef<any>, row: Vertex }) => {
    return <>
        {props.header.cell?.({
          getValue: () => getValue(props.header, props.row),
          row: { original: props.row },
        })}
      </>
  }

  const hideHeaders = () => {
    return props.headers.filter((header) => !["Actions", "name"].includes(header.header) && !["Actions", "name"].includes(header.name));
  }


  return (
    <div class="border-radius:10px box-shadow:0|0|20px|rgba(0,0,0,0.15) p:4|10 width:100%">
      <Switch>
        <Match when={props.layout === 'table'}>
          <Table headers={props.headers.length}>
            <For each={props.headers}>
              {(header) => <TableHeadCell>{header.header}</TableHeadCell>}
            </For>
            <For
              each={displayedRows()}
              fallback={<FallBack />}
            >
              {(row, index) => (
                <For each={props.headers}>
                  {(header: any) => (
                    <TableBodyCell index={index()}>
                      <Content header={header} row={row} />
                    </TableBodyCell>
                  )}
                </For>
              )}
            </For>
          </Table>
        </Match>
        <Match when={props.layout === 'card'}>
          <div class={`display:grid gap-x:0.75rem gap-x:1rem@xl gap-y:1rem grid-cols:1 grid-cols:${props.cardSize}@lg mt:1.5rem`}>
            <For each={displayedRows()} fallback={<FallBack />}>{(row) => (
              <CardContainer>
                <CardHeaderContainer >
                  <CardHeader title={row.P.name} />
                  <Show when={props.headers.find((header) => header.header === "Actions")}>
                    {header => <CardOptionsContainer><Content header={header()} row={row} /></CardOptionsContainer>}
                  </Show>
                </CardHeaderContainer>
                <CardDetailsContainer>
                  <For each={hideHeaders()}>
                    {(header) => (
                      <CardDetailRow label={header.header}>
                        <Content header={header} row={row} />
                      </CardDetailRow>
                    )}
                  </For>
                </CardDetailsContainer>
              </CardContainer>
            )}</For>
          </div>
        </Match>
      </Switch>

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
        <div class="display:flex justify-content:end padding:5px|10px">
          <button
            class="bg:blue-50 br:5px cursor:pointer p:10px text:white"
            onClick={() => props.onLoadMore(props.data.length, rowsPerPage())}
          >
            Load More
          </button>
        </div>
      </Show>
    </div>
  );
}

export function Table(
  props: Readonly<{ children: JSX.Element; class?: string; headers: number }>,
) {
  return (
    <div class="{scrollbar-width:thin} overflow:visible position:relative r:10">
      <div
        class={`${props.class || ""} grid bb:2px|solid|#37c`}
        classList={{
          [`grid-template-columns:repeat(${props.headers},1fr)`]: true,
          "{scrollbar-width:thin}": true,
          "border-radius:10px": true,
          "font-size:0.9em": true,
          "overflow:auto": true,
          "width:100%": true,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export function TableHeadCell(props: Readonly<{ children: JSX.Element }>) {
  return (
    <div
      class="bg:#37c border:1px|solid|#347fdd color:white font-weight:600 p:10px"
      classList={{ "text-align:center": true }}
    >
      {props.children}
    </div>
  );
}

export function TableBodyCell(
  props: Readonly<{
    children: JSX.Element;
    class?: string;
    index?: number;
  }>,
) {
  return (
    <div
      class={`${props.class ?? ""} @fade|.4s`}
      classList={{
        "align-content:center": true,
        "bg:#3478cc0d": props.index ? props.index % 2 !== 0 : false,
        "bg:white": props.index ? props.index % 2 === 0 : false,
        "h:50": true,
        "padding:7px": true,
        "text:center": true,
      }}
    >
      {props.children}
    </div>
  );
}
