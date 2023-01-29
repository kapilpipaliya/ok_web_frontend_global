import { createSignal, For } from "solid-js";
import { css } from "solid-styled-components";
import { Column, ColumnDef, ColumnOrderState, createSolidTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, Table as SolidTable, VisibilityState, } from "@tanstack/solid-table";
import clsx from "clsx";
import { PersonProps } from "../models/table";
import { people } from "../utils/exampleData";

interface CustomTableProps {
  data: PersonProps[];
}

interface FilterProps {
  column: Column<unknown, unknown>;
  table: SolidTable<unknown>;
}

const defaultColumn: ColumnDef<PersonProps>[] = [
  {
    // header: "email",
    header: () => <span>Name</span>,
    accessorKey: "name",
  },
  {
    header: () => <span>Email</span>,
    accessorKey: "email",
  },
  {
    header: () => <span>Title</span>,
    accessorKey: "title",
  },
  {
    header: () => <span>Role</span>,
    accessorKey: "role",
  },
];

function Filter(props: FilterProps) {
  const firstValue = props.table.getPreFilteredRowModel().flatRows[0]?.getValue(props.column.id);

  const columnFilterValue = props.column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div
      class={css`
        //flex space-x-5xl;
      `}
    >
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) => props.column.setFilterValue((old: [number, number]) => [e.currentTarget.value, old?.[1]])}
        placeholder={"Min"}
        class={css`
          //w-24 border shadow rounded;
        `}
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) => props.column.setFilterValue((old: [number, number]) => [old?.[0], e.currentTarget.value])}
        placeholder={"Max"}
        class={css`
          //w-24 border shadow rounded;
        `}
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => props.column.setFilterValue(e.currentTarget.value)}
      placeholder={"Search..."}
      class={css`
        //w-48 h-10 mt-3 mb-3 border shadow rounded;
      `}
    />
  );
}

export const Table = (props: CustomTableProps) => {
  const [data, setData] = createSignal(props.data);
  const [columnOrder, setColumnOrder] = createSignal<ColumnOrderState>([]);
  const [sorting, setSorting] = createSignal<SortingState>([]);

  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({});
  const table = createSolidTable({
    columns: defaultColumn,
    data: people,
    state: {
      get columnOrder() {
        return columnOrder();
      },
      get columnVisibility() {
        return columnVisibility();
      },
      get sorting() {
        return sorting();
      },
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  // const headersArray = ;

  return (
    <>
      <div
        class={css`
          //px-4 sm:px-6 lg:px-8;
        `}
      >
        <div
          class={css`
            //mt-8 flex flex-col;
          `}
        >
          <div
            class={css`
              //my-2 -mx-4 sm:mx-6 lg:mx-8;
            `}
          >
            <div
              class={css`
                //inline-block min-w-full py-2 align-middle;
              `}
            >
              <div
                class={css`
                  //shadow-sm ring-1 ring-black ring-opacity-5;
                `}
              >
                {/* Select Visible columns */}
                <div
                  class={css`
                    //inline-block border border-black shadow rounded;
                  `}
                >
                  <div
                    class={css`
                      //px-1 border-b border-black;
                    `}
                  >
                    <label>
                      <input checked={table.getIsAllColumnsVisible()} onChange={table.getToggleAllColumnsVisibilityHandler()} type="checkbox" />
                      Toggle All
                    </label>
                  </div>
                  <For each={table.getAllLeafColumns()}>
                    {(column) => (
                      <div
                        class={css`
                          //px-1;
                        `}
                      >
                        <label>
                          <input checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} type="checkbox" /> {column.id}
                        </label>
                      </div>
                    )}
                  </For>
                </div>
                <table
                  class={css`
                    //min-w-full border-separate;
                  `}
                  style={{ borderSpacing: 0 }}
                >
                  <thead
                    class={css`
                      //bg-gray-50;
                    `}
                  >
                    <tr>
                      {/* at 0^th index we will have root header we can remove index and recursively call for child headers
                       * For more : https://tanstack.com/table/v8/docs/examples/solid/basic
                       */}
                      <For each={table.getHeaderGroups()[0].headers}>
                        {(header) => (
                          <th
                            colSpan={header.colSpan}
                            scope="col"
                            class={css`
                              //sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8;
                            `}
                          >
                            {header.isPlaceholder ? null : (
                              <div>
                                <div class={header.column.getCanSort() ? "cursor-pointer select-none" : undefined} onClick={header.column.getToggleSortingHandler()}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {{
                                    asc: " 🔼",
                                    desc: " 🔽",
                                  }[header.column.getIsSorted() as string] ?? null}
                                </div>
                                {header.column.getCanFilter() ? (
                                  <div>
                                    <Filter column={header.column} table={table} />
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </th>
                        )}
                      </For>
                    </tr>
                  </thead>
                  <tbody
                    class={css`
                      //bg-white;
                    `}
                  >
                    <For each={table.getRowModel().rows} fallback={<div> No data found</div>}>
                      {(row) => (
                        <tr>
                          <For each={row.getVisibleCells()}>
                            {(cell) => (
                              <td class={clsx(true ? "border-b border-gray-200" : "", "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8")}>
                                {cell.getValue()}
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
