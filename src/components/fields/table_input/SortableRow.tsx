import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  For,
  Show,
  createComputed,
  createMemo,
  createSignal,
  on,
} from "solid-js";

import type { GenericComponentProps } from "~/components/fields/ComponentType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useFormContext } from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import {
  addNewRow,
  rowMetaInitialize,
} from "~/lib/graph/mutate/form/rowFunction";

import { DisplayProperty } from "./DisplayProperty";

// Utility function to get the component class based on the component name
export const getComponentClass = (componentName: string) => {
  switch (componentName) {
    case "TextBox":
      return "min-w:150px";
    case "TextArea":
      return "min-w:200px";
    case "CheckBox":
      return "min-w:50px";
    case "SelectBox":
      return "min-w:200px";
    default:
      return "";
  }
};

export const SortableRow = (
  p: {
    dragFromIndex: Accessor<null | number>;
    dragToIndex: Accessor<null | number>;
    handleDrop: (event: DragEvent) => void;
    isRealTime: boolean;
    joinVertex: Vertex;
    rowIndex: number;
    setDragFromIndex: (index: number) => void;
    setDragToIndex: (index: number) => void;
    tableColumnsTemplate: Accessor<Vertex[]>;
    txnId: number;
  } & GenericComponentProps,
) => {
  const [graph, setGraph] = useGraph();
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig } = useFormContext();

  createComputed(
    on(p.tableColumnsTemplate, (columns) => {
      const metaTxnId = rowMetaInitialize(graph, setGraph, p.joinVertex, p.meta, columns);
      if (metaTxnId && cleanUpConfig) {
        if (!cleanUpConfig().rowMetaTxnIds) {
          cleanUpConfig().rowMetaTxnIds = [];
        }
        // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.
        if (!cleanUpConfig().rowMetaTxnIds.includes(metaTxnId)) {
          cleanUpConfig().rowMetaTxnIds.push(metaTxnId);
        }
      }
    }),
  );

  const instResult = createMemo(() => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex);

  const getMetaVertex = (columnId: Id) => {
    const instRes = instResult();
    const rowId = instRes?.P?.rows[columnId];
    return rowId !== undefined && graph.vertexes[rowId]
      ? graph.vertexes[rowId]
      : ({ P: { componentName: "Error" } } as unknown as Vertex);
  };

  // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
  const rowColumnsMetaAttrs = createMemo(() =>
    p.tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"),
  );
  const expandVertex = createMemo(() =>
    p.tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"),
  );
  const [expanded, setExpanded] = createSignal(true);
  const [disabled] = createSignal(false);

  return (
    <>
      <tr
        class="border-bottom:1px|solid|#dddddd border-radius:10px"
        classList={{
          "background-color:#e0e0e0": p.rowIndex === p.dragFromIndex(),
          "background-color:#f0f0f0": p.rowIndex === p.dragToIndex(),
          "background-color:white": p.rowIndex !== p.dragFromIndex() && p.rowIndex !== p.dragToIndex(),
          "border:1px|solid|#ddd": p.rowIndex !== p.dragToIndex(),
          "border:2px|solid|green": p.rowIndex === p.dragToIndex(),
          "text-align:center": true,
          "transition:background-color|0.2s|ease": true,
          "width:50px": true,
        }}
        draggable={true}
        onDragEnter={() => p.setDragToIndex(p.rowIndex)}
        onDragOver={(event) => event.preventDefault()}
        onDragStart={() => p.setDragFromIndex(p.rowIndex)}
        onDrop={p.handleDrop}
      >
        <td>
          <div class={"flex ai:center jc:center"}>
            <button class="cursor:grab;">
              <Icon class={"transition:transform|2s|ease-in-out"} icon="material-symbols:drag-indicator" />
            </button>
            <button class="cursor:pointer;" onClick={() => setExpanded(!expanded())}>
              <Icon class={"transition:transform|2s|ease-in-out"} classList={{ "margin-top:7px": true }} icon={`${expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}`} />
            </button>
            <Icon class="color:red cursor:pointer m:5px" height={20} icon="mingcute:delete-line" onClick={() => deleteRow(p.joinVertex, p.isRealTime, graph, setGraph, p.txnId)} width={20} />
            <Show when={expandVertex()}>
              <Icon class="color:green cursor:pointer" height={20} icon="icon-park-outline:plus" onClick={() => addNewRow(p.txnId ?? 0, expandVertex()!, graph, setGraph, p.joinVertex, {}, p.isRealTime ?? false)} width={20} />
            </Show>
          </div>
          {/*<Show when={!disabled}>*/}
          {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
          {/*</Show>*/}
        </td>
        <For each={rowColumnsMetaAttrs()}>
          {(column) => {
            return (
              <DisplayProperty
                column={column}
                disabled={disabled}
                getMetaVertex={getMetaVertex}
                isRealTime={p.isRealTime}
                joinVertex={p.joinVertex}

                setValue={p.setValue}
                txnId={p.txnId}
              />
            );
          }}
        </For>
      </tr>
      {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
      {/*{getSelectionOptions([p.joinVertex], expandVertex.P.collection).vertexes?.length}*/}
      <Show when={expandVertex() && expanded()}>
        <tr class="border-bottom:1px|solid|#dddddd border-radius:10px">
          <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>
            <DynamicComponent
              componentName={"DynamicTable"}
              data={p.joinVertex}
              disabled={disabled()}
              isRealTime={p.isRealTime}
              isTableInside={false}
              // When we have a Table we pass original Table Meta Vertex
              meta={expandVertex()!}
              setValue={p.setValue}
              txnId={p.txnId}
            />
          </td>
        </tr>
      </Show>
    </>
  );
};
