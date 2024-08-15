import {
  type Accessor,
  createComputed,
  createMemo,
  createSignal,
  For,
  on,
  Show,
} from "solid-js";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/IconButton";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { rowMetaInitialize } from "~/lib/graph/mutate/form/rowMetaInitialize";

import { useFormContext } from "../../form/FormContext";
import { DisplayProperty } from "./DisplayProperty";


export const SortableRow = (
  props: Readonly<
    {
      dragFromIndex: Accessor<null | number>;
      dragToIndex: Accessor<null | number>;
      handleDrop: (event: DragEvent) => void;
      isNoPermissionCheck?: boolean;
      isRealTime: boolean;
      joinVertex: Vertex;
      rowIndex: number;
      setDragFromIndex: (index: number) => void;
      setDragToIndex: (index: number) => void;
      tableColumnsTemplate: Accessor<Vertex[]>;
      txnId: number;
    } & GenericComponentProps
  >,
) => {
  const [graph, setGraph] = useGraph();
  // if there is no parent FormContext, it should still work.
  const [formStore] = useFormContext();
  const [expanded, setExpanded] = createSignal(true);
  const [disabled] = createSignal(false);

  createComputed(
    on(props.tableColumnsTemplate, (tableColumnsTemplate) => {
      const metaTxnId = rowMetaInitialize(
        graph,
        setGraph,
        props.joinVertex,
        props.meta,
        tableColumnsTemplate,
      );
      if (metaTxnId && formStore?.cleanUpConfig) {
        const config = formStore.cleanUpConfig();
        if (!config.rowMetaTxnIds) {
          config.rowMetaTxnIds = [];
        }
        // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.

        if (!config.rowMetaTxnIds.includes(metaTxnId)) {
          config.rowMetaTxnIds.push(metaTxnId);
        }
      }
    }),
  );

  const instResult = createMemo(
    () => getChildVertex(graph, ["AttrInst"], props.joinVertex).vertex,
  );

  const getMetaVertex = (columnId: Id) => {
    const instRes = instResult();
    const rowId = instRes?.P?.rows[columnId];
    return rowId !== undefined && graph.vertexes[rowId]
      ? graph.vertexes[rowId]
      : ({ P: { componentName: "Error" } } as unknown as Vertex);
  };

  // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "Attr"], [p.joinVertex]));
  const rowColumnsMetaAttrs = createMemo(() =>
    props.tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"),
  );
  const expandVertex = createMemo(() =>
    props.tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"),
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
      <tr
        class="border-bottom:1px|solid|#dddddd border-radius:10px text-align:center transition:background-color|0.2s|ease width:50px"
        classList={{
          "background-color:#e0e0e0": props.rowIndex === props.dragFromIndex(),
          "background-color:#f0f0f0": props.rowIndex === props.dragToIndex(),
          "background-color:white":
            props.rowIndex !== props.dragFromIndex() &&
            props.rowIndex !== props.dragToIndex(),
          "border:1px|solid|#ddd": props.rowIndex !== props.dragToIndex(),
          "border:2px|solid|green": props.rowIndex === props.dragToIndex(),
        }}
        draggable={true}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDrop={props.handleDrop}
      >
        <td>
          <div class="flex ai:center jc:center">
            <IconButton
              class="cursor:grab"
              icon="material-symbols:drag-indicator"
              iconClass="transition:transform|2s|ease-in-out"
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                class="cursor:pointer"
                icon={expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}
                iconClass="transition:transform|2s|ease-in-out"
                onClick={toggleExpanded}
                size={20}
              />
            </Show>
            <IconButton
              class="color:red cursor:pointer m:5px"
              icon="mingcute:delete-line"
              onClick={handleDeleteRow}
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                class="color:green cursor:pointer"
                icon="icon-park-outline:plus"
                onClick={handleAddNewRow}
                size={20}
              />
            </Show>
          </div>
          {/*<Show when={!disabled}>*/}
          {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
          {/*</Show>*/}
        </td>
        <For each={rowColumnsMetaAttrs()}>
          {(column) => (
            <DisplayProperty
              column={column}
              disabled={disabled}
              getMetaVertex={getMetaVertex}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              joinVertex={props.joinVertex}
              onChange={props.onChange}
              txnId={props.txnId}
            />
          )}
        </For>
      </tr>
      {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
      {/*{getSelectionOptions([p.joinVertex], expandVertex.P.collection).vertexes?.length}*/}
      <Show when={expandVertex() && expanded()}>
        <tr class="border-bottom:1px|solid|#dddddd border-radius:10px">
          <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>
            <DynamicComponent
              componentName={"DynamicTable"}
              data={props.joinVertex}
              disabled={disabled()}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              isTableInside={false}
              // When we have a Table we pass original Table Meta Vertex
              meta={expandVertex()!}
              onChange={props.onChange}
              txnId={props.txnId}
            />
          </td>
        </tr>
      </Show>
    </>
  );
};
