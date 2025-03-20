import { type Accessor, For, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "../IconButton";

export function TableActions(
  props: Readonly<{
    currentPage: Accessor<number>;
    data: Vertex[];
    displayedRows: Accessor<Vertex[]>;
    handleFirstPage: () => void;
    handleLastPage: () => void;
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    handleRowsPerPageChange: (e: Event) => void;
    rowsPerPage: Accessor<number>;
    rowsPerPageOptions?: number[];
    totalPages: Accessor<number>;
  }>,
) {
  return (
    <Show when={props.displayedRows().length > 0}>
      <div class="align-items:center display:flex justify-content:space-between padding:.5rem|1rem">
        <div class="margin-right:1rem">
          <label html-for="rowsPerPage">Rows per page:</label>
          <select
            class="margin-left:0.5rem"
            id="rowsPerPage"
            onChange={props.handleRowsPerPageChange}
            value={props.rowsPerPage()}
          >
            <For each={props.rowsPerPageOptions || [10, 20, 50, 100]}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </select>
        </div>
        <div class="font-weight:500 margin-right:1rem">
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </div>
        <div class="flex gap:10px">
          <IconButton
            class="bg:#d3d3d345:hover jc:center p:4 r:50%"
            classList={{
              "color:black": props.currentPage() !== 0,
              "color:lightgrey": props.currentPage() === 0,
            }}
            disabled={props.currentPage() === 0}
            icon="icon-park-outline:go-start"
            onClick={props.handleFirstPage}
            size={22}
            title="Move first"
          />
          <IconButton
            class="bg:#d3d3d345:hover jc:center p:4 r:50%"
            classList={{
              "color:black": props.currentPage() !== 0,
              "color:lightgrey": props.currentPage() === 0,
            }}
            disabled={props.currentPage() === 0}
            icon="icon-park-outline:left"
            onClick={props.handlePreviousPage}
            size={22}
            title="Previous"
          />
          <IconButton
            class="bg:#d3d3d345:hover jc:center p:4 r:50%"
            classList={{
              "color:black": props.currentPage() !== props.totalPages() - 1,
              "color:lightgrey": props.currentPage() === props.totalPages() - 1,
            }}
            disabled={props.currentPage() === props.totalPages() - 1}
            icon="icon-park-outline:right"
            onClick={props.handleNextPage}
            size={22}
            title="Next"
          />
          <IconButton
            class="bg:#d3d3d345:hover jc:center p:4 r:50%"
            classList={{
              "color:black": props.currentPage() !== props.totalPages() - 1,
              "color:lightgrey": props.currentPage() === props.totalPages() - 1,
            }}
            disabled={props.currentPage() === props.totalPages() - 1}
            icon="icon-park-outline:go-end"
            onClick={props.handleLastPage}
            size={22}
            title="Move last"
          />
        </div>
      </div>
    </Show>
  );
}
