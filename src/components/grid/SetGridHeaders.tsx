import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";

import { Match, Show, Switch } from "solid-js";

import type { GraphInterface, Id } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { QuickEditModal } from "~/components/grid/QuickEditModal";
import { getSelectNameValue } from "~/components/grid/functions/getSelectNameValue";
import { getTagValue } from "~/components/grid/functions/getTagValue";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";

import type { DataGridState } from "./DataGridContext";

import { IconButton } from "../IconButton";

export function setGridHeaders(
  gridState: DataGridState,
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
        <div class={`${!formNew.isInlineEditable ? 'py:0.25rem r:7' : ''} flex ai:center gap:10px jc:center`}>
          <Switch>
            <Match when={gridState.formMetaData() && !gridState.hasEditPermission()}>
              <></>
            </Match>
            <Match when={formNew.isInlineEditable}>
              <QuickEditModal
                disabled={!!gridState.formMetaData() && !gridState.hasEditPermission()}
                graph={graph}
                info={info}
                setGraph={setGraph}
                tableId={tableId}
              />
            </Match>
            <Match when={true}>
              <IconButton
                disabled={!!gridState.formMetaData() && !gridState.hasEditPermission()}
                icon="fluent:edit-12-regular"
                iconClass="color:#3477CC"
                onClick={() => navigate(`./${info.row.original.id}`)}
                size={21}
              />
            </Match>
          </Switch>
          <Show
            when={!!gridState.formMetaData() && gridState.hasDeletePermission()}
          >
            <IconButton
              disabled={!!gridState.formMetaData() && !gridState.hasDeletePermission()}
              icon="fluent:delete-12-regular"
              iconClass="color:rgb(255,0,0)"
              onClick={() => setDeleteRowId(info.row.original.id)}
              size={22}
            />
          </Show>
        </div>
      );
    },
    footer: "",
    header: "Actions",
  });
  return tableColumns;
}
