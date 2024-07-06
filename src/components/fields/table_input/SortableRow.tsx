import { Icon } from "@iconify-icon/solid";
import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import {
  type Accessor,
  For,
  Match,
  Show,
  Switch,
  createComputed, createMemo,
  createSignal,
  getOwner,
  on,
  runWithOwner,
  useContext
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getPropsFromMetaExpressionMGCall } from "~/cypher/get/getPropsFromMetaExpressionMGCall";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { FormContext } from "~/lib/contexts";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getProps";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { getStringComponent } from "~/lib/graph/get/sync/getStringComponent";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, IdAttr, type Vertex } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import { addNewRow, getColumnProps, rowMetaInitialize } from "~/lib/graph/mutate/form/rowFunction";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";

// Todo dont allow duplicate value in the select field
export const SortableRow = (p: { dragFromIndex: Accessor<null | number>; dragToIndex: Accessor<null | number>; handleDrop: (event: DragEvent) => void; isRealTime: boolean; joinVertex: Vertex; rowIndex: number; setDragFromIndex: (index: number) => void; setDragToIndex: (index: number) => void; tableColumnsTemplate: Accessor<Vertex[]>; txnId: number; } & ComponentProps) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig, txnId: formTxnId } = useContext(FormContext);
  createComputed(on(p.tableColumnsTemplate, (columns) => {
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
  }));

  const instResult = createMemo(() => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex);
  const getMetaVertex = (columnId: Id) => {
    const instRes = instResult();
    const rowId = instRes?.P?.rows[columnId];
    if (rowId !== undefined && graph.vertexes[rowId]) {
      return graph.vertexes[rowId];
    } else {
      return { P: { component: "Error" } } as unknown as Vertex;
    }
  };

  // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
  const rowColumnsMetaAttrs = createMemo(() => p.tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"));
  const expandVertex = createMemo(() => p.tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"));
  const [expanded, setExpanded] = createSignal(true);
  const [disabled] = createSignal(false);

  const DisplayProperties = () => {

    return (
      <For each={rowColumnsMetaAttrs()}>
        {(column) => {
          const metaVertex = createMemo(() => getMetaVertex(column.id));
          const outerOwner = getOwner();

          // this is used to add props to meta when meta is configured in json
          if (metaVertex().P.meta) {
            // TODO: when meta changed realtime its not updating.
            createComputed(on(() => getPropsFromMetaExpression(graph, setGraph, metaVertex(), p.joinVertex), async (v) => {
              if (metaVertex().P.meta) {
                const mutationData = formTxnId ? commitTxn(formTxnId, graph) : undefined;
                const metaData = await getPropsFromMetaExpressionMGCall(metaVertex(), [p.joinVertex], mutationData, 10);
                const metaDataVal = removeUndefinedProperties(metaData, false, 10);

                const newMetaData = Object.assign(
                  // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
                  getColumnProps(graph.vertexes[metaVertex().P.templateId] ?? { P: {} }, graph),
                  metaDataVal
                );

                replaceVertexProperties(
                  0,
                  metaVertex().id,
                  graph,
                  setGraph,
                  newMetaData
                );
              }
            }));
          }

          const getComponent = (columnId: Id) => {
            const metaVertex = getMetaVertex(columnId);
            if (metaVertex.P.component.includes("-")) {
              createComputed(on(() => getSelectionOptions(graph, setGraph, metaVertex.P.component, [p.joinVertex]).vertexes, async (vertexes) => {
                const mutationData = formTxnId ? commitTxn(formTxnId, graph) : undefined;
                const res = await getSelectionOptionsMGCall([p.joinVertex], metaVertex.P.component, mutationData, 10);
                console.log("res", res);

                runWithOwner(outerOwner, () => {
                  if (isValidResponse(res) && typeof res.result === "string") {
                    setComponent(res.result);
                  } else {
                    setComponent(getStringComponent(graph)?.P.name);
                  }
                });
              }));
            } else {
              return metaVertex.P.component;
            }
          };

          const [component, setComponent] = createWritableMemo(() => getComponent(column.id));

          const DefaultValue = () => (
            <Show when={metaVertex().P.defaultValue}>
              {getSelectionOptions(graph, setGraph, metaVertex().P.defaultValue, [p.joinVertex]).vertexes}
            </Show>
          );

          const Content = () => (
            <>
              <Show when={component() === "Error"}>Error</Show>
              <DynamicComponent
                component={component()}
                data={p.joinVertex}
                disabled={disabled()}
                isRealTime={p.isRealTime}
                isTableInside={false}
                // When we have a Table we pass original Table Meta Vertex
                meta={component() === "DynamicTable" ? graph.vertexes[metaVertex().P.templateId] : metaVertex()}
                setValue={p.setValue}
                title={toTitle(column.P.displayName || column.P[IdAttr] || "")}
                txnId={p.txnId} />
            </>
          );

          return (
            <Switch>
              <Match when={metaVertex().P.hidden}>
                <td class="align-content:center">
                  <div class={`${getComponentClass(component())} flex ai:center jc:center`}>
                    <DefaultValue />
                  </div>
                </td>
              </Match>
              <Match when={component() === "DynamicTable"}>
                <td class="align-content:center">
                  <Show when={!disabled()}>
                    <div class={`${getComponentClass(component())} flex ai:center jc:center`}>
                      <DefaultValue />
                      <Content />
                    </div>
                  </Show>
                </td>
              </Match>
              <Match when={true}>
                <td class={`${getComponentClass(component())} align-content:center padding:1px`}>
                  <div class="align-items:center">
                    <DefaultValue />
                    <Content />
                  </div>
                </td>
              </Match>
            </Switch>
          );
        }}
      </For>
    );
  };

  return (
    <>
      <tr
        class="border-bottom:1px|solid|#dddddd border-radius:10px"
        draggable={true}
        onDragEnter={() => p.setDragToIndex(p.rowIndex)}
        onDragOver={(event) => event.preventDefault()}
        onDragStart={() => p.setDragFromIndex(p.rowIndex)}
        onDrop={p.handleDrop}
        style={{
          "background-color": getBackgroundColor(p.rowIndex, p.dragFromIndex(), p.dragToIndex()),
          border: getBorder(p.rowIndex, p.dragToIndex()),
          "text-align": "center",
          transition: "background-color 0.2s ease",
          width: "50px",
        }}
      >
        <td>
          <div class={"flex ai:center jc:center"}>
            <button class="cursor: grab;">
              <Icon class={"transform 2s ease-in-out"} icon="material-symbols:drag-indicator" />
            </button>
            <button class="cursor: pointer;" onClick={() => setExpanded(!expanded())}>
              <Icon class={"transform 2s ease-in-out"} icon={`${expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}`} style={{ "margin-top": "7px" }} />
            </button>
            <Icon class="cursor:pointer m:5px" height={20} icon="mingcute:delete-line" onClick={() => deleteRow(p.joinVertex, p.isRealTime!, graph, setGraph, p.txnId!)} style={{ color: "red" }} width={20} />
            <Show when={expandVertex()}>
              <Icon class="cursor:pointer " height={20} icon="icon-park-outline:plus" onClick={() => addNewRow(p.txnId ?? 0, expandVertex()!, graph, setGraph, p.joinVertex, {}, p.isRealTime ?? false)} style={{ color: "green" }} width={20} />
            </Show>
          </div>
          {/*<Show when={!disabled}>*/}
          {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
          {/*</Show>*/}
        </td>
        <DisplayProperties />
      </tr>
      {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
      {/*{getSelectionOptions([p.joinVertex], expandVertex.P.collection).vertexes?.length}*/}
      <Show when={expandVertex() && expanded()}>
        <tr class="border-bottom:1px|solid|#dddddd border-radius:10px">
          <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>
            <DynamicComponent
              component={"DynamicTable"}
              data={p.joinVertex}
              disabled={disabled()}
              isRealTime={p.isRealTime}
              isTableInside={false}
              // When we have a Table we pass original Table Meta Vertex
              meta={expandVertex()!}
              setValue={p.setValue}
              txnId={p.txnId} />
          </td>
        </tr>
      </Show>
    </>
  );
};

const getComponentClass = (component: string) => {
  switch (component) {
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

 const getBackgroundColor = (index: number, dragFromIndex: null | number, dragToIndex: null | number) => {
  if (dragFromIndex === index) return "#e0e0e0";
  if (dragToIndex === index) return "#f0f0f0";
  return "white";
};

 const getBorder = (index: number, dragToIndex: null | number) => {
  if (dragToIndex === index) return "2px solid green";
  return "1px solid #ddd";
};
