import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";

import { createSignal, Match, Show, Switch } from "solid-js";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { getSelectNameValue } from "~/components/grid/functions/getSelectNameValue";
import { getTagValue } from "~/components/grid/functions/getTagValue";
import { QuickEditModal } from "~/components/grid/QuickEditModal";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { PageDesignerLabels } from "~/features/page_designer/functions/PageDesignerLabels";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { FormMetaData } from "~/lib/meta/formMetaData";

import type { DataGridState } from "./DataGridContext";

import { selectedValue } from "../fields/utils/selectedValue";
import { STYLES } from "../styled/constants/styles";
import { IconButton } from "../styled/IconButton";
import { TooltipWrapper } from "../styled/TooltipWrapper";
import { ModifyJsonButton } from "./ModifyJsonButton";

function ImageWrapper(props: { alt?: string; class?: string; src: string }) {
  return (
    <Show when={props.src}>
      <img alt={props.alt || "Preview"} class={props.class} src={props.src} />
    </Show>
  );
}
const getPreviewVertex = (
  attribute: FieldAttribute,
  data: Vertex,
  graph: Store<GraphInterface>,
) => {
  const vertexId = selectedValue(
    {
      P: attribute,
    } as unknown as Vertex,
    data,
    graph,
  )?.[0];
  return vertexId ? graph.vertexes[vertexId] : undefined;
};
const getPreviewURL = (
  attribute: FieldAttribute,
  data: Vertex,
  graph: Store<GraphInterface>,
) => {
  const vertex = getPreviewVertex(attribute, data, graph);
  if (vertex) {
    return getDownloadLink(vertex);
  }
  return "";
};
export function CreateGridHeaders(
  gridState: DataGridState,
  formNew: IFormMetaData,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  setDeleteRowId: (id: Id) => void,
  navigate: (path: string) => void,
  tableId: string,
  hideDeleteAction?: boolean,
  hideEditJsonAction?: boolean,
) {
  const tableColumns = [] as ColumnDef<any>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<any>;
    if (
      attribute.hideInGrid ||
      attribute.componentName === "Table" ||
      attribute.componentName === "DynamicTable"
    ) {
      continue;
    }
    // @ts-expect-error ignore
    column.accessorKey = `P.${attribute.key}`;
    column.id = attribute.key;
    column.cell =
      attribute.cell ||
      ((info) => {
        return (
          <Switch>
            <Match
              when={
                (PageDesignerLabels.includes(tableId) ||
                  tableId === "Component") &&
                attribute.key === "Preview"
              }
            >
              <TooltipWrapper
                content={
                  <div class={STYLES.tooltip.content}>
                    <Show when={info.getValue<string>()}>
                      <div class={"f:14 font-weight:500"}>
                        {info.getValue<string>()}
                      </div>
                    </Show>
                    {
                      getPreviewVertex(attribute, info.row.original, graph)?.P
                        .fileName
                    }
                    <ImageWrapper
                      alt="Preview"
                      src={getPreviewURL(attribute, info.row.original, graph)}
                    />
                  </div>
                }
                triggerAs="span"
                triggerClass="flex ai:center"
              >
                <span class="flex ai:center gap:8px">
                  <ImageWrapper
                    alt="Preview"
                    class="r:4px h:30px object-fit:cover"
                    src={getPreviewURL(attribute, info.row.original, graph)}
                  />
                </span>
              </TooltipWrapper>
            </Match>
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

            <Match when={typeof info.getValue() === "boolean"}>
              <span>
                {info.getValue() === true
                  ? "Yes"
                  : info.getValue() === false
                    ? "No"
                    : ""}
              </span>
            </Match>
            <Match when={tableId === "File" && attribute.key === "fileName"}>
              <TooltipWrapper
                content={
                  <div class={STYLES.tooltip.content}>
                    <Show when={info.getValue<string>()}>
                      <div class={"f:14 font-weight:500"}>
                        {info.getValue<string>()}
                      </div>
                    </Show>
                    {getDownloadLink(info.row.original)}
                    <ImageWrapper
                      alt="Preview"
                      src={getDownloadLink(info.row.original)}
                    />
                  </div>
                }
                triggerAs="span"
                triggerClass="flex ai:center"
              >
                <span class="flex ai:center">{info.getValue<string>()}</span>
              </TooltipWrapper>
            </Match>
            <Match when={true}>{info.getValue<string>()}</Match>
          </Switch>
        );
      });
    column.header = (_info) =>
      capitalizeFirstLetter(
        attribute.title ||
          attribute.label ||
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
              !hideDeleteAction &&
              (gridState.isNoPermissionCheck ||
                (!!gridState.formMetaData() && gridState.hasDeletePermission()))
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
                window.open(newUrl, "_blank");
              }}
              size={21}
            />
          </Show>
          <Show when={!(hideEditJsonAction || FormMetaData[tableId])}>
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
