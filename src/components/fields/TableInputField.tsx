import { Icon } from "@iconify-icon/solid";
import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import {
  For,
  Match,
  Show,
  Switch,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  on,
  runWithOwner,
  useContext,
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { useToast } from "~/components/Toast";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/page_attr_render/Context";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { getPropsFromMetaExpressionMGCall } from "~/cypher/get/getPropsFromMetaExpressionMGCall";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { FormContext, } from "~/lib/contexts";
import {
  getPropsFromMetaExpression,
} from "~/lib/graph/get/sync/getProps";
import { getStringComponent } from "~/lib/graph/get/sync/getStringComponent";
import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Id, IdAttr, type Vertex } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import {
  addNewRow, getColumnProps,
  getSublistRows, rowMetaInitialize
} from "~/lib/graph/mutate/form/rowFunction";
import {
  mergeVertexProperties, replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";

import { AddNewButton } from "../grid/AddNew";
import { isValidResponse } from "./isValidResponse";

export function TableInputField(
  props: {
    isRealTime?: boolean;
    isTableInside?: boolean;
    txnId?: number;
  } & ComponentProps,
) {
  const { showErrorToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig, txnId: formTxnId } = useContext(FormContext);
  const outerOwner = getOwner();
  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  const tableColumnsTemplate = createMemo(() =>
    getChildVertexes(graph, ["MetaAttr"], [props.meta]).vertexes || []
  );

  const parentItems = useContext(PageRenderVertexContext);
  const parentData = createMemo(() => getDataVertex(graph, getLastItem(parentItems, 1)));

  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(graph, props.meta, props.data || parentData());
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<null | number>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<null | number>(null);

  const handleDrop = () => {
    if (dragFromIndex() !== null && dragToIndex() !== null && dragFromIndex() !== dragToIndex()) {
      const updatedRows = [...sortedVertexes()];
      const [draggedRow] = updatedRows.splice(dragFromIndex()!, 1);
      updatedRows.splice(dragToIndex()!, 0, draggedRow);
      setSortedVertexes(updatedRows);
      updatedRows.forEach((vertex, index) => {
        mergeVertexProperties(props.txnId!, vertex.id, graph, setGraph, { pos: index + 1 });
      });
    }
    setDragFromIndex(null);
    setDragToIndex(null);
  };

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { index: number; joinVertex: Vertex }) => {
    createComputed(on(tableColumnsTemplate, (columns) => {
      const metaTxnId = rowMetaInitialize(graph, setGraph, p.joinVertex, props.meta, columns);
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
    const getMetaVertex = (columnId: any) => {
      const instRes = instResult();
      const rowId = instRes?.P?.rows[columnId];
      if (rowId !== undefined && graph.vertexes[rowId]) {
        return graph.vertexes[rowId];
      } else {
        return { P: { component: "Error" } } as unknown as Vertex;
      }
    };

    // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
    const rowColumnsMetaAttrs = createMemo(() => tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"));
    const expandVertex = createMemo(() => tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"));
    const [expanded, setExpanded] = createSignal(true);
    const [disabled, _] = createSignal(false);

    const DisplayProperties = () => (
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
                  getColumnProps(graph.vertexes[metaVertex().P.templateId] ?? {P: {}}, graph),
                  metaDataVal
                );

                replaceVertexProperties(
                  0,
                  metaVertex().id,
                  graph,
                  setGraph,
                  newMetaData,
                );
              }
            }));
          }

          const getComponent = (columnId: Id) => {
            const metaVertex = getMetaVertex(columnId);
            if (metaVertex.P.component.includes("-")) {
              createComputed(on(() => getSelectionOptions(graph, setGraph, [p.joinVertex], metaVertex.P.component).vertexes, async (vertexes) => {
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
              {getSelectionOptions(graph, setGraph, [p.joinVertex], metaVertex().P.defaultValue).vertexes}
            </Show>
          );

          const Content = () => (
            <>
              <Show when={component() === "Error"}>Error</Show>
              <DynamicComponent
                component={component()}
                data={p.joinVertex}
                disabled={disabled()}
                isRealTime={props.isRealTime}
                isTableInside={false}
                // When we have a Table we pass original Table Meta Vertex
                meta={component() === "DynamicTable" ? graph.vertexes[metaVertex().P.templateId] : metaVertex()}
                setValue={props.setValue}
                title={toTitle(column.P.displayName || column.P[IdAttr] || "")}
                txnId={props.txnId}
              />
            </>
          );

          return (
            <Switch>
              <Match when={metaVertex().P.hidden}>
                <td class="align-content:center">
                  <div class={`flex ai:center jc:center ${getComponentClass(component())}`}>
                    <DefaultValue />
                  </div>
                </td>
              </Match>
              <Match when={component() === "DynamicTable"}>
                <td class="align-content:center">
                  <Show when={!disabled()}>
                    <div class={`flex ai:center jc:center ${getComponentClass(component())}`}>
                      <DefaultValue />
                      <Content />
                    </div>
                  </Show>
                </td>
              </Match>
              <Match when={true}>
                <td class={`padding:1px align-content:center ${getComponentClass(component())}`}>
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

    return (
      <>
        <tr
          class="border-radius:10px border-bottom:1px|solid|#dddddd"
          draggable={true}
          onDragEnter={() => setDragToIndex(p.index)}
          onDragOver={(event) => event.preventDefault()}
          onDragStart={() => setDragFromIndex(p.index)}
          onDrop={handleDrop}
          style={{
            "background-color": getBackgroundColor(p.index, dragFromIndex(), dragToIndex()),
            border: getBorder(p.index, dragToIndex()),
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
              <Icon class="cursor:pointer m:5px" height={20} icon="mingcute:delete-line" onClick={() => deleteRow(p.joinVertex, props.isRealTime!, graph, setGraph, props.txnId!)} style={{ color: "red" }} width={20} />
              <Show when={expandVertex()}>
                <Icon class="cursor:pointer " height={20} icon="icon-park-outline:plus" onClick={() => addNewRow(props.txnId ?? 0, expandVertex()!, graph, setGraph, p.joinVertex, {}, props.isRealTime ?? false)} style={{ color: "green" }} width={20} />
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
          <tr class="border-radius:10px border-bottom:1px|solid|#dddddd">
            <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>
              <DynamicComponent
                component={"DynamicTable"}
                data={p.joinVertex}
                disabled={disabled()}
                isRealTime={props.isRealTime}
                isTableInside={false}
                // When we have a Table we pass original Table Meta Vertex
                meta={expandVertex()!}
                setValue={props.setValue}
                txnId={props.txnId}
              />
            </td>
          </tr>
        </Show>
      </>
    );
  };

  const insertNewRow = () => {
    if (!props.data) {
      showErrorToast("Table data is not set");
      return;
    }

    return runWithOwner(outerOwner, () =>
      addNewRow(props.txnId || 0, props.meta, graph, setGraph, props.data!, {}, props.isRealTime ?? false, Ws)
    );
  };

  return (
    <Switch>
      <Match when={tableColumnsTemplate().length === 0}>
        Please Define table columns
      </Match>
      <Match when={true}>
        {/*<Show when={props.meta.P.attributes}>*/}
        {/*  <FormGroup form={{title: '', label: props.meta.P.title || props.meta.P[IdAttr], attributes: props.meta.P.attributes}} vertex={vertex}/>*/}
        {/*</Show>*/}
        {/* <Show when={props.isTableInside}> */}
        <AddNewButton onClick={() => insertNewRow()} />
        {/* </Show> */}
        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
        <div class={"overflow:auto r:10 m:2"} style={{ 'border': sortedVertexes().length ? '1px solid #37c' : '', "scrollbar-width": "thin" }}>
          <table class="border-collapse:collapse font-size:0.9em b:none box-shadow:0|0|20px|rgba(0,0,0,0.15) border-radius:0.4rem" style={{ width: props.isTableInside ? '-webkit-fill-available' : '' }}>
            <Show when={sortedVertexes().length}>
              <thead>
                <tr class="background-color:#37c   height:35px color:#ffffff text-align:center " style={{ width: "max-content" }}>
                  <td class={"font-weight:medium p:0px|10px color:#ffffff text-align:left align-items:center align-content:center"} style={{ "text-align-last": "center" }}>&nbsp;Actions</td>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => (
                      <Switch>
                        {/*<Match when={attribute.P.skip}></Match>*/}
                        <Match when={attribute.P.tab === "expand"}>
                          <span />
                        </Match>
                        <Match when={!attribute.P.hidden || attribute.P.defaultValue}>
                          <th class={"font-weight:medium p:0px|10px"} style={{ "justify-content": "center" }}>
                            {toTitle(attribute.P.displayName || attribute.P[IdAttr] || "")}
                          </th>
                        </Match>
                        <Match when={true}>
                          <th />
                        </Match>
                      </Switch>
                    )}
                  </For>
                </tr>
              </thead>
            </Show>
            <tbody>
              <For each={sortedVertexes()}>
                {(vertex, index) => (
                  <RepeaterVertexContext.Provider value={[vertex, ...useContext(RepeaterVertexContext)]}>
                    <SortableRow index={index()} joinVertex={vertex} />
                  </RepeaterVertexContext.Provider>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {/*<Show when={Page}>*/}
        {/*  <For each={Object.values(Page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}

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
