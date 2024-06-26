import {
  Switch,
  Match
} from "solid-js";
import type { GraphInterface, Id } from "~/lib/graph/graph";
import { Icon } from "@iconify-icon/solid";
import type { SetStoreFunction, Store } from "solid-js/store";
import { capitalizeFirstLetter } from "~/lib/utils";
import type { ColumnDef } from "@tanstack/solid-table";
import type { IFormMetaData } from "~/lib/FormMetadataType";
import { QuickEditModal } from "~/components/grid/QuickEditModal";
import { getSelectValue } from "~/components/grid/getSelectValue";
import { getTagValue } from "~/components/grid/getTagValue";

export function setGridHeaders(formNew: IFormMetaData, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, setDeleteRowId: (id: Id) => void, navigate: (path: string) => void, tableId: string) {
  const tableColumns = [] as ColumnDef<any>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<any>;
    if (attribute.component === "Table") continue;
    // @ts-ignore
    column.accessorKey = `P.${attribute.name}`;
    column.id = attribute.name;
    column.cell = (info) => {
      return (
        <Switch>
          <Match
            when={attribute.component === "SelectBox" && !attribute.props?.items}
          >
            {getSelectValue({
              attribute: attribute,
              info: info,
              graph: graph,
              setGraph: setGraph,
            })}
          </Match>

          <Match
            when={attribute.component === "TagBox" && !attribute.props?.items}
          >
            {getTagValue({
              attribute: attribute,
              info: info,
              graph: graph,
              setGraph: setGraph,
            })}
          </Match>

          <Match when={attribute.component === "CheckBox"}>
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
    column.header = (info) => capitalizeFirstLetter(
      attribute.title || attribute.displayName || attribute.name
    );
    column.footer = (info) => capitalizeFirstLetter(
      attribute.title || attribute.displayName || attribute.name
    );
    tableColumns.push(column);
  }
  tableColumns.push({
    accessorKey: "Actions",
    header: "Actions",
    footer: "",
    cell: (info) => {
      return (
        <Switch>
          <Match when={formNew.isInlineEditable}>
            <div class="flex gap:10px ai:center  jc:center cursor:pointer">
              <QuickEditModal
                info={info}
                graph={graph}
                setGraph={setGraph}
                tableId={tableId} />
              <Icon
                onclick={() => {
                  setDeleteRowId(info.row.original.id);
                }}
                icon="fluent:delete-12-regular"
                class="color:rgb(255,0,0)"
                height={22}
                width={22} />
            </div>
          </Match>

          <Match when={!formNew.isInlineEditable}>
            <div class="py:0.25rem">
              <div class="flex gap:10px ai:center  jc:center r:7 cursor:pointer">
                <Icon
                  onClick={() => navigate(`./${info.row.original.id}`)}
                  height={21}
                  width={21}
                  class={"color:#3477CC"}
                  icon="fluent:edit-12-regular" />
                <Icon
                  onclick={() => {
                    setDeleteRowId(info.row.original.id);
                  }}
                  icon="fluent:delete-12-regular"
                  class="color:rgb(255,0,0)"
                  height={22}
                  width={22} />
              </div>
            </div>
          </Match>
        </Switch>
      );
    },
  });
  return tableColumns;
}
