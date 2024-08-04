import type { ColumnDef, RowSelectionOptions } from "@tanstack/solid-table";

import { For, type JSX, Match, Show, Switch, createMemo, createSignal, } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { CardDetailRow, CardDetailsContainer } from "~/components/Card/CardDetails";
import { CardHeader } from "~/components/Card/CardHeader";
import { CardOptionsContainer } from "~/components/Card/CardOptions";
import { CardContainer, CardHeaderContainer } from "~/components/Card/SimpleCard";
import { Table, TableBodyCell, TableHeadCell } from "~/components/SimpleTable";

import { TableActions } from "./TableActions";

type TableProps = {
  allConfiguredPermission: Vertex[];
  cardSize: number;
  data: Vertex[];
  defaultRowsPerPage?: number;
  enableMultiRowSelection?: RowSelectionOptions<Vertex>['enableMultiRowSelection'];
  enableRowSelection?: RowSelectionOptions<Vertex>['enableRowSelection'];
  headers: ColumnDef<any>[];
  isSearching: boolean;
  isShowLoadMore?: boolean;
  isShowPagination?: boolean;
  layout: 'card' | 'table';
  onLoadMore: (skip: number, limit: number) => void;
  rowsPerPageOptions?: number[];
  selectedRows: Vertex[];
  setSelectedRows: (rows: Vertex[]) => void;
  totalItems: number;
};

const getValue = (header: any, row: Vertex) => {
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

  const handleRowSelect = (row: Vertex) => {
    const selected = props.selectedRows;
    const isSelected = selected.some(r => r.id === row.id);

    if (isSelected) {
      props.setSelectedRows(props.enableMultiRowSelection ? selected.filter(r => r.id !== row.id) : []);
    } else {
      props.setSelectedRows(props.enableMultiRowSelection ? [...selected, row] : [row]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      props.setSelectedRows(displayedRows());
    } else {
      props.setSelectedRows([]);
    }
  };

  const allSelected = createMemo(() => displayedRows().every(row => props.selectedRows.some(r => r.id === row.id)));
  const someSelected = createMemo(() => !allSelected() && displayedRows().some(row => props.selectedRows.some(r => r.id === row.id)));

  const FallBack = () => (
    <div class={`display:flex grid-column-span:${props.headers.length} justify-content:center padding:1rem`}>
      No records to display
    </div>
  );

  const hideHeaders = () => props.headers.filter(
    (header) => !["Actions", "name"].includes(header.header) && !["Actions", "name"].includes(header.name)
  );

  const isMultiRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableMultiRowSelection === 'function' ? props.enableMultiRowSelection(row) : props.enableMultiRowSelection;
  };

  const isRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableRowSelection === 'function' ? props.enableRowSelection(row) : props.enableRowSelection;
  };

  return (
    <div class="border-radius:10px box-shadow:0|0|20px|rgba(0,0,0,0.15) p:4|10 width:100%">
      <Switch>
        <Match when={props.layout === 'table'}>
          <Table headers={props.headers.length + (props.enableMultiRowSelection || props.enableRowSelection ? 1 : 0)}>
            <TableHead
              allSelected={allSelected()}
              enableMultiRowSelection={props.enableMultiRowSelection}
              enableRowSelection={props.enableRowSelection}
              headers={props.headers}
              onSelectAll={handleSelectAll}
              someSelected={someSelected()}
            />
            <TableBody
              enableMultiRowSelection={props.enableMultiRowSelection}
              enableRowSelection={props.enableRowSelection}
              fallback={<FallBack />}
              headers={props.headers}
              onRowSelect={handleRowSelect}
              rows={displayedRows()}
              selectedRows={props.selectedRows}
            />
          </Table>
        </Match>
        <Match when={props.layout === 'card'}>
          <CardGrid cardSize={props.cardSize}>
            <For each={displayedRows()} fallback={<FallBack />}>
              {(row) => (
                <CardContainer>
                  <CardHeaderContainer>
                    <CardHeader title={row.P.name} />
                    <Show when={isMultiRowSelectionEnabled(row) || isRowSelectionEnabled(row)}>
                      <input
                        checked={props.selectedRows.some(r => r.id === row.id)}
                        onChange={() => handleRowSelect(row)}
                        type="checkbox"
                      />
                    </Show>
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

function TableHead(props: Readonly<{ allSelected: boolean, enableMultiRowSelection?: RowSelectionOptions<Vertex>['enableMultiRowSelection'], enableRowSelection?: RowSelectionOptions<Vertex>['enableRowSelection'], headers: ColumnDef<any>[], onSelectAll: (checked: boolean) => void, someSelected: boolean }>) {
  return (
    <>
      <Show when={props.enableMultiRowSelection || props.enableRowSelection}>
        <TableHeadCell>
          <Show when={props.enableMultiRowSelection}>
            <input
              checked={props.allSelected}
              indeterminate={props.someSelected && !props.allSelected}
              onChange={(e) => props.onSelectAll((e.target as HTMLInputElement).checked)}
              type="checkbox"
            />
          </Show>
        </TableHeadCell>
      </Show>
      <For each={props.headers}>
        {(header) => <TableHeadCell>{header.header}</TableHeadCell>}
      </For>
    </>
  );
}

const Content = (props: { header: ColumnDef<any>, row: Vertex }) => (
  props.header.cell?.({
    getValue: () => getValue(props.header, props.row),
    row: { original: props.row },
  }) ?? null
);

function TableBody(props: Readonly<{ enableMultiRowSelection?: RowSelectionOptions<Vertex>['enableMultiRowSelection'], enableRowSelection?: RowSelectionOptions<Vertex>['enableRowSelection'], fallback: JSX.Element, headers: ColumnDef<any>[], onRowSelect: (row: Vertex) => void, rows: Vertex[], selectedRows: Vertex[] }>) {
  const isMultiRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableMultiRowSelection === 'function' ? props.enableMultiRowSelection(row) : props.enableMultiRowSelection;
  };

  const isRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableRowSelection === 'function' ? props.enableRowSelection(row) : props.enableRowSelection;
  };
  return (
    <For each={props.rows} fallback={props.fallback}>
      {(row, index) => (
        <>
          <Show when={props.enableMultiRowSelection || props.enableRowSelection}>
            <TableBodyCell class={props.selectedRows.includes(row) ? 'bg:blue-20' : ''} index={index()}>
              <Show when={isMultiRowSelectionEnabled(row) || isRowSelectionEnabled(row)}>
                <input
                  checked={props.selectedRows.includes(row)}
                  onChange={() => props.onRowSelect(row)}
                  type="checkbox"
                />
              </Show>
            </TableBodyCell>
          </Show>
          <For each={props.headers}>
            {(header: any) => (
              <TableBodyCell class={props.selectedRows.includes(row) ? 'bg:blue-20' : ''} index={index()}>
                <Content header={header} row={row} />
              </TableBodyCell>
            )}
          </For>
        </>
      )}
    </For>
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
