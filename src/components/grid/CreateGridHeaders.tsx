import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";
import { clientOnly } from "@solidjs/start";
const Tooltip = clientOnly(() => import("~/components/ssr/tooltip/Tooltip"));
const TooltipTrigger = clientOnly(() => import("~/components/ssr/tooltip/TooltipTrigger"));
const TooltipPortal = clientOnly(() => import("~/components/ssr/tooltip/TooltipPortal"));
const TooltipContent = clientOnly(() => import("~/components/ssr/tooltip/TooltipContent"));
const TooltipArrow = clientOnly(() => import("~/components/ssr/tooltip/TooltipArrow"));
import { createSignal, Match, Show, Switch } from "solid-js";

import type { GraphInterface, Id } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getSelectNameValue } from "~/components/grid/functions/getSelectNameValue";
import { getTagValue } from "~/components/grid/functions/getTagValue";
import { QuickEditModal } from "~/components/grid/QuickEditModal";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { getDownloadLink } from "~/pages/file_manager/sidebar/getDownloadLink";

import type { DataGridState } from "./DataGridContext";

import { IconButton } from "../styled/IconButton";
import { ModifyJsonButton } from "./ModifyJsonButton";

export function CreateGridHeaders(
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
    if (attribute.componentName === "Table" || attribute.componentName === "DynamicTable") {
      continue;
    }
    // @ts-ignore
    column.accessorKey = `P.${attribute.key}`;
    column.id = attribute.key;
    column.cell = (info) => {
      return (
        <Switch>
          <Match
            when={attribute.componentName === "Select" && !attribute.options}
          >
            {getSelectNameValue({
              attribute: attribute,
              graph: graph,
              info: info,
              setGraph: setGraph,
            })}
          </Match>

          <Match
            when={
              attribute.componentName === "MultiSelect" && !attribute.options
            }
          >
            {getTagValue({
              attribute: attribute,
              graph: graph,
              info: info,
              setGraph: setGraph,
            })}
          </Match>

          <Match when={attribute.componentName === "CheckBox" || attribute.componentName === "CheckBox"}>
            <span>
              {info.getValue() === true
                ? "Yes"
                : info.getValue() === false
                  ? "No"
                  : ""}
            </span>
          </Match>
          <Match when={tableId === "File" && attribute.key === "fileName"}>
            <Tooltip
              floatingOptions={{
                flip: true,
                offset: 13,
                shift: true,
              }}
              openDelay={200}
              placement="top"
            >
              <TooltipTrigger
                as="span"
                class="flex ai:center"
              >
                {info.getValue<string>()}
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent class="rounded-lg bg-corvu-100 px-3 py-2 font-medium corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1">
                  <div
                    class={
                      "center bg:#333 color:#fff f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content p:3|10 r:5 text:nowrap w:full z-index:1"
                    }
                  >
                    <Show when={info.getValue<string>()}>
                      <div class={"f:14 font-weight:500"}>{info.getValue<string>()}</div>
                    </Show>
                    {getDownloadLink(info.row.original)}
                    <img alt="File Preview" src={getDownloadLink(info.row.original)} />
                  </div>
                  <TooltipArrow class="" />
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </Match>

          <Match when={true}>{info.getValue<string>()}</Match>
        </Switch>
      );
    };
    column.header = (_info) =>
      capitalizeFirstLetter(
        attribute.label ||
          attribute.title ||
          attribute.displayName ||
          attribute.key,
      );
    column.footer = (_info) =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.key,
      );
    tableColumns.push(column);
  }
  tableColumns.push({
    accessorKey: "Actions",
    cell: (info) => {
      const [isEditModalOpen, setIsEditModelOpen] = createSignal(false);
      return (
        <div
          class={`${formNew.isInlineEditable ? "" : "py:0.25rem r:7"} flex ai:center gap:10px jc:center`}
        >
          <Show
            when={
              gridState.isNoPermissionCheck ||
              (gridState.formMetaData() &&
                (gridState.hasEditPermission() ||
                  gridState.hasViewPermission()))
            }
          >
            <IconButton
              disabled={
                !gridState.isNoPermissionCheck &&
                !!gridState.formMetaData() &&
                !(
                  gridState.hasEditPermission() || gridState.hasViewPermission()
                )
              }
              icon="fluent:edit-12-regular"
              iconClass="color:#3477CC"
              onClick={() => {
                if (formNew.isInlineEditable) {
                  setIsEditModelOpen(true);
                } else {
                  return navigate(`/admin/${tableId}/${info.row.original.id}`);
                }
              }}
              size={21}
            />
            <Show when={isEditModalOpen()}>
              <QuickEditModal
                disabled={
                  !gridState.isNoPermissionCheck &&
                  !!gridState.formMetaData() &&
                  !gridState.hasEditPermission()
                }
                info={info}
                onClose={setIsEditModelOpen}
                tableId={tableId}
              />
            </Show>
          </Show>

          <Show
            when={
              gridState.isNoPermissionCheck ||
              (!!gridState.formMetaData() && gridState.hasDeletePermission())
            }
          >
            <IconButton
              disabled={
                !gridState.isNoPermissionCheck &&
                !!gridState.formMetaData() &&
                !gridState.hasDeletePermission()
              }
              icon="fluent:delete-12-regular"
              iconClass="color:rgb(255,0,0)"
              onClick={() => setDeleteRowId(info.row.original.id)}
              size={22}
            />
          </Show>

          <Show when={tableId === "Form"}>
            <IconButton
              icon="bxs:data"
              iconClass="color:#3477CC"
              onClick={() => {
                const newUrl = `/admin/${info.row.original.P.key}`;
                window.open(newUrl, '_blank');
              }}
              size={21}
            />
          </Show>
          <Show when={!FormMetaData[tableId]}>
            <ModifyJsonButton
              class="color:#FFA500"
              item={info.row.original}
              size={21}
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
