import {
  createSignal,
  For,
  Show,
  Switch,
  Match,
  type Accessor,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "../solid-blocks/blocks";
import CustomButton from "../solid-blocks/blocks/button/buttons";
import { capitalizeFirstLetter } from "~/lib/Utils";

type TableProps<T> = {
  headers: any[];
  data: T[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onLoadMore: (skip: number, limit: number) => void;
  totalItems: number;
  isSearching: boolean;
  isShowLoadMore?: boolean;
};

export function CommonTable<T>(props: TableProps<T>) {
  const [currentPage, setCurrentPage] = createSignal(0);
  const [rowsPerPage, setRowsPerPage] = createSignal(
    props.defaultRowsPerPage || 10,
  );

  const totalPages = () => Math.ceil(props.totalItems / rowsPerPage());

  const handleNextPage = () => {
    // handlePageChange(Math.min(currentPage() + 1, totalPages() - 1));
    setCurrentPage(Math.min(currentPage() + 1));
  };

  const handlePreviousPage = () => {
    
    // handlePageChange(Math.max(currentPage() - 1, 0));
    setCurrentPage(Math.min(currentPage() - 1));
  };

  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages() - 1);
  };

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
              {capitalizeFirstLetter(header.name || "Actions")}
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
              {(header: any) => {
                return (
                  <TableBodyCell index={index()}>
                    <Switch>
                      <Match when={header === "Edit"}>
                        {header.cell?.({
                          row: { original: row },
                          getValue: () => getValue(header, row),
                        })}
                      </Match>
                      <Match when={true}>
                        {header.cell?.({
                          row: { original: row },
                          getValue: () => getValue(header, row),
                        })}
                      </Match>
                    </Switch>
                  </TableBodyCell>
                );
              }}
            </For>
          )}
        </For>
      </Table>
      <TableActions
        totalPages={totalPages}
        currentPage={currentPage}
        displayedRows={displayedRows}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handleFirstPage={handleFirstPage}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        handleLastPage={handleLastPage}
        data={props.data}
        rowsPerPage={rowsPerPage}
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
          <CustomButton
            variant="soft"
            onClick={() => props.onLoadMore(props.data.length, rowsPerPage())}
          >
            Load More
          </CustomButton>
        </div>
      </Show>
    </div>
  );
}

const TableActions = (props: {
  data: any;
  displayedRows: Accessor<any[]>;
  currentPage: Accessor<number>;
  rowsPerPage: Accessor<number>;
  handleRowsPerPageChange: (e: Event) => void;
  handleFirstPage: () => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handleLastPage: () => void;
  totalPages: Accessor<number>;
}) => {
  return (
    <Show when={props.displayedRows().length > 0}>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: .5rem 1rem;">
        <div style="margin-right: 1rem;">
          <label for="rowsPerPage">Rows per page:</label>
          <select
            name="page"
            id="page"
            onChange={props.handleRowsPerPageChange}
            value={props.rowsPerPage()}
            style="margin-left: 0.5rem;"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>
        <div style="margin-right: 1rem;" class="font-weight:500">
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </div>
        <div class="flex gap:10px">
          <Tooltip content="Move first">
            <button
              onClick={props.handleFirstPage}
              disabled={props.currentPage() === 0}
              style={{
                color: props.currentPage() === 0 ? "lightgrey" : "black",
              }}
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
              onClick={props.handlePreviousPage}
              disabled={props.currentPage() === 0}
              style={{
                color: props.currentPage() === 0 ? "lightgrey" : "black",
              }}
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
            >
              <Icon height={22} width={22} icon={"icon-park-outline:left"} />
            </button>
          </Tooltip>
          <Tooltip content="Next">
            <button
              onClick={props.handleNextPage}
              disabled={props.currentPage() === props.totalPages() - 1}
              style={{
                color:
                  props.currentPage() === props.totalPages() - 1
                    ? "lightgrey"
                    : "black",
              }}
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
            >
              <Icon height={22} width={22} icon={"icon-park-outline:right"} />
            </button>
          </Tooltip>
          <Tooltip content="Move last">
            <button
              onClick={props.handleLastPage}
              disabled={props.currentPage() === props.totalPages() - 1}
              style={{
                color:
                  props.currentPage() === props.totalPages() - 1
                    ? "lightgrey"
                    : "black",
              }}
              class="bg:#d3d3d345:hover r:50% flex ai:center jc:center p:4"
            >
              <Icon height={22} width={22} icon={"icon-park-outline:go-end"} />
            </button>
          </Tooltip>
        </div>
      </div>
    </Show>
  );
};

export function Table(props: {headers: number; children: any}) {
  return (
    <div
      class="overflow:visible rel r:10"
      style={{ "scrollbar-width": "thin" }}
    >
      <div
        class="grid bb:2px|solid|#37c"
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

export function TableBodyCell(props: { index?: number; children: any; class?: string}) {
  return (
    <div
      style="padding: 7px; align-content: center;"
      class={`h:50 text:center bg:${
        props.index ? props.index % 2 === 0 ? "white" : "#3478cc0d":''
      } @fade|.4s ${props.class}`}
    >
      {props.children}
    </div>
  );
}
