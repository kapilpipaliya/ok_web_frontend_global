import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { Match, Switch } from "solid-js";

import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { GraphInterface, Id } from "~/lib/graph/graph";

import { QuickEditModal } from "~/components/grid/QuickEditModal";
import { getSelectNameValue } from "~/components/grid/getSelectNameValue";
import { getTagValue } from "~/components/grid/getTagValue";
import { capitalizeFirstLetter } from "~/lib/utils";

export function setGridHeaders(
  formNew: IFormMetaData,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  setDeleteRowId: (id: Id) => void,
  navigate: (path: string) => void,
  tableId: string,
) {
  const tableColumns = [] as ColumnDef<any>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<any>;
    if (attribute.componentName === "Table") continue;
    // @ts-ignore
    column.accessorKey = `P.${attribute.name}`;
    column.id = attribute.name;
    column.cell = (info) => {
      return (
        <Switch>
          <Match
            when={
              attribute.componentName === "SelectBox" && !attribute.options
            }
          >
            {getSelectNameValue({
              attribute: attribute,
              graph: graph,
              info: info,
              setGraph: setGraph,
            })}
          </Match>

          <Match
            when={attribute.componentName === "TagBox" && !attribute.options}
          >
            {getTagValue({
              attribute: attribute,
              graph: graph,
              info: info,
              setGraph: setGraph,
            })}
          </Match>

          <Match when={attribute.componentName === "CheckBox"}>
            <span>
              {info.getValue() === true
                ? "Yes"
                : info.getValue() === false
                  ? "No"
                  : ""}
            </span>
          </Match>

          <Match when={true}>{info.getValue<string>()}</Match>
        </Switch>
      );
    };
    column.header = (info) =>
      capitalizeFirstLetter(
        attribute.label || attribute.title || attribute.displayName || attribute.name,
      );
    column.footer = (info) =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.name,
      );
    tableColumns.push(column);
  }
  tableColumns.push({
    accessorKey: "Actions",
    cell: (info) => {
      return (
        <Switch>
          <Match when={formNew.isInlineEditable}>
            <div class="flex ai:center cursor:pointer  gap:10px jc:center">
              <QuickEditModal
                graph={graph}
                info={info}
                setGraph={setGraph}
                tableId={tableId}
              />
              <Icon
                class="color:rgb(255,0,0)"
                height={22}
                icon="fluent:delete-12-regular"
                onclick={() => {
                  setDeleteRowId(info.row.original.id);
                }}
                width={22}
              />
            </div>
          </Match>

          <Match when={!formNew.isInlineEditable}>
            <div class="py:0.25rem">
              <div class="flex ai:center cursor:pointer  gap:10px jc:center r:7">
                <Icon
                  class={"color:#3477CC"}
                  height={21}
                  icon="fluent:edit-12-regular"
                  onClick={() => navigate(`./${info.row.original.id}`)}
                  width={21}
                />
                <Icon
                  class="color:rgb(255,0,0)"
                  height={22}
                  icon="fluent:delete-12-regular"
                  onclick={() => {
                    setDeleteRowId(info.row.original.id);
                  }}
                  width={22}
                />
              </div>
            </div>
          </Match>
        </Switch>
      );
    },
    footer: "",
    header: "Actions",
  });
  return tableColumns;
}
