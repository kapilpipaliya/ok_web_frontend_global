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

import { CardDetailRow, CardDetailsContainer } from "~/components/Card/CardDetails";
import { CardHeader } from "~/components/Card/CardHeader";
import { CardOptionsContainer } from "~/components/Card/CardOptions";
import { CardContainer, CardHeaderContainer } from "~/components/Card/SimpleCard";

import { TableActions } from "./TableActions";

type TableProps = {
  allConfiguredPermission: Vertex[];
  cardSize: number;
  data: Vertex[];
  defaultRowsPerPage?: number;
  headers: ColumnDef<any>[];
  isSearching: boolean;
  isShowLoadMore?: boolean;
  isShowPagination?: boolean;
  layout: 'card' | 'table';
  onLoadMore: (skip: number, limit: number) => void;
  rowsPerPageOptions?: number[];
  totalItems: number;
};

const getValue = (header: any, row: any) => {
  // path expression:
  return header.accessorKey.split(".").reduce((acc, key) => acc[key], row);
};

export function CommonTable(props: Readonly<TableProps>) {
  const [currentPage, setCurrentPage] = createSignal(0);
  const [rowsPerPage, setRowsPerPage] = createSignal(props.defaultRowsPerPage ?? 10);

  const totalPages = () => Math.ceil(props.totalItems / rowsPerPage());
  const displayedRows = () => {
    const startIndex = currentPage() * rowsPerPage();
    const endIndex = startIndex + rowsPerPage();
    return props.data.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages() - 1)));
  };

  const handleRowsPerPageChange = (e: Event) => {
    const newRowsPerPage = Number((e.target as HTMLSelectElement).value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const FallBack = () => (
    <div class={`display:flex grid-column-span:${props.headers.length} justify-content:center padding:1rem`}>
      No records to display
    </div>
  );

  const hideHeaders = () => props.headers.filter(
    (header) => !["Actions", "name"].includes(header.header) && !["Actions", "name"].includes(header.name)
  );

  return (
    <div class="border-radius:10px box-shadow:0|0|20px|rgba(0,0,0,0.15) p:4|10 width:100%">
      <Switch>
        <Match when={props.layout === 'table'}>
          <Table headers={props.headers.length}>
            <TableHead headers={props.headers} />
            <TableBody fallback={<FallBack />} headers={props.headers} rows={displayedRows()} />
          </Table>
        </Match>
        <Match when={props.layout === 'card'}>
          <CardGrid cardSize={props.cardSize}>
            <For each={displayedRows()} fallback={<FallBack />}>
              {(row) => (
                <CardContainer>
                  <CardHeaderContainer>
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
              )}
            </For>
          </CardGrid>
        </Match>
      </Switch>

      <Show when={props.isShowPagination}>
        <TableActions
          currentPage={currentPage}
          data={props.data}
          displayedRows={displayedRows}
          handleFirstPage={() => handlePageChange(0)}
          handleLastPage={() => handlePageChange(totalPages() - 1)}
          handleNextPage={() => handlePageChange(currentPage() + 1)}
          handlePreviousPage={() => handlePageChange(currentPage() - 1)}
          handleRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={props.rowsPerPageOptions}
          totalPages={totalPages}
        />
      </Show>
      <Show
        when={
          (currentPage() === totalPages() - 1 ||
            (currentPage() === 0 && props.data.length < props.totalItems)) &&
          props.isShowLoadMore &&
          !props.isSearching
        }
      >
        <LoadMoreButton onClick={() => props.onLoadMore(props.data.length, rowsPerPage())} />
      </Show>
    </div>
  );
}

function TableHead(props: Readonly<{ headers: ColumnDef<any>[] }>) {
  return (
    <For each={props.headers}>
      {(header) => <TableHeadCell>{header.header}</TableHeadCell>}
    </For>
  );
}

const Content = (props: { header: ColumnDef<any>, row: Vertex }) => (
  props.header.cell?.({
    getValue: () => getValue(props.header, props.row),
    row: { original: props.row },
  }) ?? null
);

function TableBody(props: Readonly<{ fallback: JSX.Element, headers: ColumnDef<any>[], rows: Vertex[] }>) {
  return (
    <For each={props.rows} fallback={props.fallback}>
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
  );
}

export function Table(props: Readonly<{ children: JSX.Element, headers: number }>) {
  return (
    <div class="{scrollbar-width:thin} overflow:visible position:relative r:10">
      <div class={`${props.class || ""} grid {scrollbar-width:thin} bb:2px|solid|#37c font-size:0.9em grid-template-columns:repeat(${props.headers},1fr) overflow:auto r:10 width:100%`}>
        {props.children}
      </div>
    </div>
  );
}

export function TableHeadCell(props: Readonly<{ children: JSX.Element }>) {
  return (
    <div class="bg:#37c border:1px|solid|#347fdd color:white font-weight:600 p:10px text-align:center">
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
    <div class={`${props.class ?? ""} @fade|.4s align-content:center h:50px padding:7px text:center`}
          classList={{
     
        "bg:#3478cc0d": props.index ? props.index % 2 !== 0 : false,
        "bg:white": props.index ? props.index % 2 === 0 : false,
    
      }}
    >
      {props.children}
    </div>
  );
}

function CardGrid(props: Readonly<{ cardSize: number, children: JSX.Element }>) {
  return (
    <div class={`display:grid gap-x:0.75rem gap-x:1rem@xl gap-y:1rem grid-cols:1 grid-cols:${props.cardSize}@lg mt:1.5rem`}>
      {props.children}
    </div>
  );
}

function LoadMoreButton(props: Readonly<{ onClick: () => void }>) {
  return (
    <div class="display:flex justify-content:end padding:5px|10px">
      <button class="bg:blue-50 br:5px cursor:pointer p:10px text:white" onClick={props.onClick}>
        Load More
      </button>
    </div>
  );
}
