import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  Match,
  on,
  runWithOwner,
  Show,
  Switch,
  useContext,
} from "solid-js";

import { toTitle } from "case-switcher-js";
import {
  mergeVertexProperties,
} from "~/lib/graph/mutate/vertex";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { DynamicComponent } from "~/components/form/DynamicComponent";

import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import {
  addNewRow,
  getSublistRows
} from "~/lib/graph/mutate/form/rowFunction";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { Icon } from "@iconify-icon/solid";

import {
  getStringComponent,
} from "~/lib/graph/get/sync/graph_functions";
import { rowMetaInitialize } from "~/lib/graph/mutate/form/rowFunction";
import { useToast } from "~/components/Toast";
import { FormContext, } from "~/lib/contexts";
import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/page_attr_render/Context";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { AddNewButton } from "../grid/AddNew";

export function TableInputField(
  props: ComponentProps & {
    txnId?: number;
    isRealTime?: boolean;
    isTableInside?: boolean;
  },
) {
  const { Ws } = useContext(WsContext);
  const { showErrorToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig } = useContext(FormContext);
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

  const [dragToIndex, setDragToIndex] = createSignal<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<number | null>(null);

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
  const SortableRow = (p: { joinVertex: Vertex; index: number }) => {
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

    const getComponent = (columnId: any) => {
        const metaVertex = getMetaVertex(columnId);
        if (metaVertex.P.component.includes("-")) {
          return getSelectionOptions(graph, setGraph, [p.joinVertex], metaVertex.P.component).vertexes || getStringComponent(graph)?.P.name;
        } else {
          return metaVertex.P.component;
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
          const component = createMemo(() => getComponent(column.id));

          const DefaultValue = () => (
            <Show when={metaVertex().P.defaultValue}>
              {getSelectionOptions(graph, setGraph, [p.joinVertex], metaVertex().P.defaultValue).vertexes}
            </Show>
          );

          const Content = () => (
            <>
              <Show when={component() === "Error"}>Error</Show>
              <DynamicComponent
                title={toTitle(column.P.displayName || column.P[IdAttr] || "")}
                isTableInside={false}
                component={component()}
                // When we have a Table we pass original Table Meta Vertex
                meta={component() === "DynamicTable" || component() === "Table" ? graph.vertexes[metaVertex().P.templateId] : metaVertex()}
                data={p.joinVertex}
                setValue={props.setValue}
                disabled={disabled()}
                txnId={props.txnId}
                isRealTime={props.isRealTime}
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
          draggable={true}
          onDragStart={() => setDragFromIndex(p.index)}
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => setDragToIndex(p.index)}
          onDrop={handleDrop}
          class="border-radius:10px border-bottom:1px|solid|#dddddd"
          style={{
            "text-align": "center",
            width: "50px",
            "background-color": getBackgroundColor(p.index, dragFromIndex(), dragToIndex()),
            transition: "background-color 0.2s ease",
            border: getBorder(p.index, dragToIndex()),
          }}
        >
          <td>
            <div class={"flex ai:center jc:center"}>
              <button class="cursor: grab;">
                <Icon icon="material-symbols:drag-indicator" class={"transform 2s ease-in-out"} />
              </button>
              <button class="cursor: pointer;" onClick={() => setExpanded(!expanded())}>
                <Icon icon={`${expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}`} class={"transform 2s ease-in-out"} style={{ "margin-top": "7px" }} />
              </button>
              <Icon height={20} width={20} icon="mingcute:delete-line" class="cursor:pointer m:5px" style={{ color: "red" }} onClick={() => deleteRow(p.joinVertex, props.isRealTime!, graph, setGraph, props.txnId!, Ws)} />
              <Show when={expandVertex()}>
                <Icon height={20} width={20} icon="icon-park-outline:plus" class="cursor:pointer " style={{ color: "green" }} onClick={() => addNewRow(props.txnId || 0, expandVertex()!, graph, setGraph, p.joinVertex, {}, props.isRealTime ?? false, Ws)} />
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
                // When we have a Table we pass original Table Meta Vertex
                meta={expandVertex()!}
                isTableInside={false}
                data={p.joinVertex}
                setValue={props.setValue}
                disabled={disabled()}
                txnId={props.txnId}
                isRealTime={props.isRealTime}
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
                <tr style={{ width: "max-content" }} class="background-color:#37c   height:35px color:#ffffff text-align:center ">
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
                    <SortableRow joinVertex={vertex} index={index()} />
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

const getBackgroundColor = (index: number, dragFromIndex: number | null, dragToIndex: number | null) => {
  if (dragFromIndex === index) return "#e0e0e0";
  if (dragToIndex === index) return "#f0f0f0";
  return "white";
};

const getBorder = (index: number, dragToIndex: number | null) => {
  if (dragToIndex === index) return "2px solid green";
  return "1px solid #ddd";
};
