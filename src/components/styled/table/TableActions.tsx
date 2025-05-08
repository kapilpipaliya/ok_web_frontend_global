import { type Accessor, For, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "../IconButton";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

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
  // Creates pagination button style based on disabled state
  const getPaginationButtonStyle = (isDisabled: boolean) => {
    return (args: FunctionArgumentType) => css`
      justify-content: center;
      padding: 0.375rem;
      background-color: ${
        isDisabled ? args.theme.var.color.base_05 : args.theme.var.color.base_10
      };
      border-radius: 4px;
      border: 1px solid ${
        isDisabled
          ? args.theme.var.color.base_15
          : args.theme.var.color.primary_20
      };
      color: ${
        isDisabled ? args.theme.var.color.base_40 : args.theme.var.color.primary
      };
      transition: all 0.2s ease;
      &:hover {
        background-color: ${
          isDisabled
            ? args.theme.var.color.base_05
            : args.theme.var.color.primary_10
        };
        ${!isDisabled && `border-color: ${args.theme.var.color.primary};`}
      }
    `;
  };

  // Create start navigation disabled state
  const isStartDisabled = () => props.currentPage() === 0;

  // Create end navigation disabled state
  const isEndDisabled = () => props.currentPage() === props.totalPages() - 1;

  return (
    <Show when={props.displayedRows().length > 0}>
      <As
        as="div"
        css={(args: FunctionArgumentType) => css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background-color: ${args.theme.var.color.base_05};
          border-radius: 0 0 10px 10px;
          box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
        `}
      >
        {/* Rows per page selector */}
        <As
          as="div"
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          <As
            as="label"
            html-for="rowsPerPage"
            css={(args: FunctionArgumentType) => css`
              font-size: 0.875rem;
              color: ${args.theme.var.color.base};
              margin-right: 0.5rem;
            `}
          >
            Rows per page:
          </As>
          <As
            as="select"
            css={(args: FunctionArgumentType) => css`
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              border: 1px solid ${args.theme.var.color.primary_20};
              background-color: ${args.theme.var.color.base_10};
              font-size: 0.875rem;
              cursor: pointer;
              outline: none;
              &:focus {
                border-color: ${args.theme.var.color.primary};
                box-shadow: 0 0 0 2px ${args.theme.var.color.primary_20};
              }
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

        {/* Page information */}
        <As
          as="div"
          css={(args: FunctionArgumentType) => css`
            font-size: 0.875rem;
            color: ${args.theme.var.color.base};
            font-weight: 500;
          `}
        >
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </As>

        {/* Pagination buttons */}
        <As
          as="div"
          css={css`
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <IconButton
            css={getPaginationButtonStyle(isStartDisabled())}
            disabled={isStartDisabled()}
            icon="icon-park-outline:go-start"
            onClick={props.handleFirstPage}
            size={18}
            title="First page"
          />
          <IconButton
            css={getPaginationButtonStyle(isStartDisabled())}
            disabled={isStartDisabled()}
            icon="icon-park-outline:left"
            onClick={props.handlePreviousPage}
            size={18}
            title="Previous page"
          />
          <IconButton
            css={getPaginationButtonStyle(isEndDisabled())}
            disabled={isEndDisabled()}
            icon="icon-park-outline:right"
            onClick={props.handleNextPage}
            size={18}
            title="Next page"
          />
          <IconButton
            css={getPaginationButtonStyle(isEndDisabled())}
            disabled={isEndDisabled()}
            icon="icon-park-outline:go-end"
            onClick={props.handleLastPage}
            size={18}
            title="Last page"
          />
        </As>
      </As>
    </Show>
  );
}
