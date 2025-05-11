import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";

import { Match, Show, Switch } from "solid-js";

import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { getSelectNameValue } from "~/features/grid/functions/getSelectNameValue";
import { getTagValue } from "~/features/grid/functions/getTagValue";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { STYLES } from "~/pages/settings/constants";

import type { DataGridState } from "../context/DataGridContext";

import { IconButton } from "../../../components/styled/IconButton";
import { TooltipWrapper } from "../../../components/styled/modal/TooltipWrapper";
import { selectedValue } from "../../../lib/graph/get/sync/edge/selectedValue";
import { ModifyJsonButton } from "../cell/ModifyJsonButton";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function ImageWrapper(props: { alt?: string; css?: string; src: string }) {
  return (
    <Show when={props.src}>
      <As
        as="img"
        alt={props.alt || "Preview"}
        css={props.css}
        src={props.src}
      />
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
  hideEditAction?: boolean,
) {
  const tableColumns = [] as ColumnDef<Vertex>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<Vertex>;
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
                arrowCss={STYLES.tooltip.arrowCss}
                content={
                  <As
                    as="div"
                    css={css`
                    border: 2px solid #ccc;
                  `}
                  >
                    <As
                      as="div"
                      css={css`
                      background: white;
                      padding: 8px;
                    `}
                    >
                      <ImageWrapper
                        alt="Preview"
                        src={getPreviewURL(attribute, info.row.original, graph)}
                      />
                    </As>
                  </As>
                }
                triggerAs="span"
                triggerCss={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <As
                  as="span"
                  css={css`
                  display: flex;
                  align-items: center;
                  gap: 8px;
                `}
                >
                  <ImageWrapper
                    alt="Preview"
                    css={css`
                      border-radius: 4px;
                      height: 30px;
                      object-fit: cover;
                    `}
                    src={getPreviewURL(attribute, info.row.original, graph)}
                  />
                </As>
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
                arrowCss={STYLES.tooltip.arrowCss}
                content={
                  <As as="div" css={STYLES.tooltip.contentCss}>
                    <ImageWrapper
                      alt="Preview"
                      css={css`
                        border-radius: 4px;
                        height: 200px;
                        object-fit: cover;
                      `}
                      src={getDownloadLink(info.row.original)}
                    />
                  </As>
                }
                triggerAs="span"
                triggerCss={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <As
                  as="span"
                  css={css`
                  display: flex;
                  align-items: center;
                `}
                >
                  <As
                    as="a"
                    href={getDownloadLink(info.row.original)}
                    target="_blank"
                    rel="noopener noreferrer"
                    css={css`
                      color: \${args.theme.var.color.primary};
                      text-decoration: none;
                      &:hover {
                        text-decoration: underline;
                      }
                    `}
                  >
                    {info.getValue<string>()}
                  </As>
                </As>
              </TooltipWrapper>
            </Match>
            <Match when={true}>{info.getValue<string>()}</Match>
          </Switch>
        );
      });
    column.header = () =>
      capitalizeFirstLetter(
        attribute.title ||
          attribute.label ||
          attribute.displayName ||
          attribute.key,
      );
    column.footer = () =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.key,
      );
    tableColumns.push(column);
  }

  // Check if any actions are available before adding the Actions column
  const hasEditAction =
    !hideEditAction &&
    (gridState.isNoPermissionCheck ||
      (gridState.formMetaData() &&
        (gridState.hasEditPermission() || gridState.hasViewPermission())));

  const hasDeleteAction =
    !hideDeleteAction &&
    (gridState.isNoPermissionCheck ||
      (gridState.formMetaData() && gridState.hasFullPermission()));

  const hasFormAction = tableId === "Page";

  const hasJsonAction = !(hideEditJsonAction || FormMetaData[tableId]);

  // Only add Actions column if at least one action is available
  if (hasEditAction || hasDeleteAction || hasFormAction || hasJsonAction) {
    tableColumns.push({
      accessorKey: "Actions",
      cell: (info) => {
        return (
          <As
            as="div"
            css={css`
            ${formNew.isInlineEditable ? "" : "padding: 0.25rem 0; border-radius: 7px;"}
            display: flex;
            align-items: center;
            gap: 4px;
            justify-content: center;
          `}
          >
            <Show
              when={
                !hideEditAction &&
                (gridState.isNoPermissionCheck ||
                  (gridState.formMetaData() &&
                    (gridState.hasEditPermission() ||
                      gridState.hasViewPermission())))
              }
            >
              <Switch>
                <Match when={formNew.isInlineEditable && !gridState.editSchema}>
                  No Schema Found
                </Match>
                <Match when={formNew.isInlineEditable}>
                  <SchemaRenderer
                    form={gridState.editSchema!}
                    formDataId={info.row.original.id}
                  />
                </Match>
                <Match when={true}>
                  <IconButton
                    disabled={
                      !gridState.isNoPermissionCheck &&
                      !!gridState.formMetaData() &&
                      !(
                        gridState.hasEditPermission() ||
                        gridState.hasViewPermission()
                      )
                    }
                    icon="ph:pen"
                    css={css`
                      color: \${args.theme.var.color.primary};
                      background-color: transparent;
                      border: none;
                      padding: 1px;
                      cursor: pointer;
                      &:hover {
                        color: \${args.theme.var.color.primary_400};
                      }
                    `}
                    onClick={() => {
                      return navigate(
                        `/admin/${tableId}/${info.row.original.id}`,
                      );
                    }}
                    size={21}
                  />
                </Match>
              </Switch>
            </Show>

            <Show
              when={
                !hideDeleteAction &&
                (gridState.isNoPermissionCheck ||
                  (!!gridState.formMetaData() && gridState.hasFullPermission()))
              }
            >
              <IconButton
                disabled={
                  !gridState.isNoPermissionCheck &&
                  !!gridState.formMetaData() &&
                  !gridState.hasFullPermission()
                }
                icon="ph:trash"
                css={css`color: \${args.theme.var.color.error};
                  background-color: transparent;
                  border: none;
                  padding: 1px;
                  cursor: pointer;
                  &:hover {
                    color: \${args.theme.var.color.error_400};
                  }
                `}
                onClick={() => setDeleteRowId(info.row.original.id)}
                size={22}
              />
            </Show>

            <Show when={tableId === "Page"}>
              <IconButton
                icon="ph:database"
                css={css`color: \${args.theme.var.color.primary};
                  background-color: transparent;
                  border: none;
                `}
                onClick={() => {
                  const newUrl = `/admin/${info.row.original.P.key}`;
                  window.open(newUrl, "_blank");
                }}
                size={21}
              />
            </Show>
            <Show when={!(hideEditJsonAction || FormMetaData[tableId])}>
              <ModifyJsonButton
                css={css`
                  color: \${args.theme.var.color.warning};
                  border: none;
                  padding: 1px;
                  cursor: pointer;
                  &:hover {
                    color: \${args.theme.var.color.warning_400};
                  }
                `}
                item={info.row.original}
                size={21}
              />
            </Show>
          </As>
        );
      },
      footer: "",
      header: "Actions",
    });
  }
  return tableColumns;
}
