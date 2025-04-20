import { type Accessor, For, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "../IconButton";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
      <As as="div" css={css`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
`}>
        <As as="div" css={css`
  margin-right: 1rem;
`}>
          <label html-for="rowsPerPage">Rows per page:</label>
          <As as="select"
            css={css`
  margin-left: 0.5rem;
`}
            id="rowsPerPage"
            onChange={props.handleRowsPerPageChange}
            value={props.rowsPerPage()}
          >
            <For each={props.rowsPerPageOptions || [10, 20, 50, 100]}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </As>
        </As>
        <As as="div" css={css`
  font-weight: 500;
  margin-right: 1rem;
`}>
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </As>
        <As as="div" css={css`
  display: flex;
  gap: 10px;
`}>
          <IconButton
            css={css`
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border-radius: 50%;
  border: none;
  color: ${props.currentPage() === 0 ? "lightgrey" : "black"};
  &:hover {
    background-color: rgba(211, 211, 211, 0.27);
  }
`}
            disabled={props.currentPage() === 0}
            icon="icon-park-outline:go-start"
            onClick={props.handleFirstPage}
            size={22}
            title="Move first"
          />
          <IconButton
            css={css`
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border-radius: 50%;
  border: none;
  color: ${props.currentPage() === 0 ? "lightgrey" : "black"};
  &:hover {
    background-color: rgba(211, 211, 211, 0.27);
  }
`}
            disabled={props.currentPage() === 0}
            icon="icon-park-outline:left"
            onClick={props.handlePreviousPage}
            size={22}
            title="Previous"
          />
          <IconButton
            css={css`
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border-radius: 50%;
  border: none;
  color: ${props.currentPage() === props.totalPages() - 1 ? "lightgrey" : "black"};
  &:hover {
    background-color: rgba(211, 211, 211, 0.27);
  }
`}
            disabled={props.currentPage() === props.totalPages() - 1}
            icon="icon-park-outline:right"
            onClick={props.handleNextPage}
            size={22}
            title="Next"
          />
          <IconButton
            css={css`
  justify-content: center;
  padding: 4px;
  background-color: transparent;
  border-radius: 50%;
  border: none;
  color: ${props.currentPage() === props.totalPages() - 1 ? "lightgrey" : "black"};
  &:hover {
    background-color: rgba(211, 211, 211, 0.27);
  }
`}
            disabled={props.currentPage() === props.totalPages() - 1}
            icon="icon-park-outline:go-end"
            onClick={props.handleLastPage}
            size={22}
            title="Move last"
          />
        </As>
      </As>
    </Show>
  );
}
