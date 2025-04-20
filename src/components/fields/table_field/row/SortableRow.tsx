import { type Accessor, createMemo, createSignal, For, Show } from "solid-js";

import type { GenericComponentProps } from "~/components/fields/type/FieldType";
import type { Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { useGraph } from "~/lib/graph/GraphContext";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { deleteRow } from "~/lib/graph/mutate/vertex/delete/deleteRow";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../form/context/FormContext";
import { DisplayProperty } from "../cell/DisplayProperty";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export const SortableRow = (
  props: Readonly<
    GenericComponentProps & {
      dragFromIndex: Accessor<null | number>;
      dragToIndex: Accessor<null | number>;
      handleDrop: (event: DragEvent) => void;
      isNoPermissionCheck?: boolean;
      isRealTime: boolean;
      joinVertex: Vertex;
      meta: Vertex;
      metaInstance: Vertex;
      rowIndex: number;
      setDragFromIndex: (index: number) => void;
      setDragToIndex: (index: number) => void;
      tableColumnsTemplate: Accessor<Vertex[]>;
      txnId: number;
    }
  >,
) => {
  const [graph, setGraph] = useGraph();
  // if there is no parent FormContext, it should still work.
  const formId = useFormContext();
  const _formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const [expanded, setExpanded] = createSignal(true);
  const [disabled] = createSignal(false);

  const attributesResult = () => props.tableColumnsTemplate();

  const rowColumnsMetaAttrs = createMemo(
    () =>
      attributesResult()?.filter((vertex) => vertex.P.tab !== "expand") ?? [],
  );
  const expandVertex = createMemo(() =>
    attributesResult()?.find((vertex) => vertex.P.tab === "expand"),
  );

  const handleDragEnter = () => props.setDragToIndex(props.rowIndex);
  const handleDragOver = (event: DragEvent) => event.preventDefault();
  const handleDragStart = () => props.setDragFromIndex(props.rowIndex);
  const handleDeleteRow = () =>
    deleteRow(props.joinVertex, props.isRealTime, graph, setGraph, props.txnId);
  const handleAddNewRow = () =>
    addNewRow(
      props.txnId ?? 0,
      expandVertex()!,
      graph,
      setGraph,
      props.joinVertex,
      {},
      props.isRealTime ?? false,
    );
  const toggleExpanded = () => setExpanded(!expanded());

  return (
    <>
      <As
        as="tr"
        css={css`
        border-bottom: 1px solid #dddddd;
        border-radius: 10px;
        text-align: center;
        transition: background-color 0.2s ease;
        width: 50px;
        background-color: ${
          props.rowIndex === props.dragFromIndex()
            ? "#e0e0e0"
            : props.rowIndex === props.dragToIndex()
              ? "#f0f0f0"
              : "white"
        };
        border: ${
          props.rowIndex === props.dragToIndex()
            ? "2px solid green"
            : "1px solid #ddd"
        };
      `}
        draggable={true}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDrop={props.handleDrop}
      >
        <td>
          <As
            as="div"
            css={css`
  display: flex;
  align-items: center;
  justify-content: center;
`}
          >
            <IconButton
              css={css`
  cursor: grab;
  background-color: transparent;
  border: none;
`}
              icon="material-symbols:drag-indicator"
              iconCss={css`transition: transform 2s ease-in-out`}
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                css={css`
  cursor: pointer;
  background-color: transparent;
  border: none;
`}
                icon={expanded() ? "ph:caret-right" : "ph:caret-down"}
                iconCss={css`transition: transform 2s ease-in-out`}
                onClick={toggleExpanded}
                size={20}
              />
            </Show>
            <IconButton
              css={css`
  color: \${args.theme.var.color.error};
  cursor: pointer;
  margin: 5px;
  background-color: transparent;
  border: none;
`}
              icon="mingcute:delete-line"
              onClick={handleDeleteRow}
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                css={css`
  color: green;
  cursor: pointer;
  background-color: transparent;
  border: none;
`}
                icon="icon-park-outline:plus"
                onClick={handleAddNewRow}
                size={20}
              />
            </Show>
          </As>
          {/*<Show when={!disabled}>*/}
          {/*  <Icon icon="material-symbols:edit"  noobserver onClick={() => setDisabled((v) => !v)} />*/}
          {/*</Show>*/}
        </td>
        <For each={rowColumnsMetaAttrs()}>
          {(column) => (
            <DisplayProperty
              column={column}
              disabled={disabled}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              joinVertex={props.joinVertex}
              // onChange={props.onChange}
              txnId={props.txnId}
            />
          )}
        </For>
      </As>
      {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
      {/* {evalExpression("->$0", {
        graph,
        vertexes: [props.joinVertex],
      })?.length} */}
      <Show when={expandVertex() && expanded()}>
        <As
          as="tr"
          css={css`
  border-bottom: 1px solid #dddddd;
  border-radius: 10px;
`}
        >
          <As
            as="td"
            css={css`
  padding-left: 15px;
`}
            colspan={rowColumnsMetaAttrs().length + 2}
          >
            <DynamicComponent
              componentName={"DynamicTable"}
              data={props.joinVertex}
              disabled={disabled()}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              isTableInside={false}
              // When we have a Table we pass original Table Meta Vertex
              meta={expandVertex()!}
              // onChange={props.onChange}
            />
          </As>
        </As>
      </Show>
    </>
  );
};
