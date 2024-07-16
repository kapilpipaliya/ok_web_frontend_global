import { Icon } from "@iconify-icon/solid";
import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import {
  type Accessor,
  For,
  Match,
  Setter,
  Show,
  Switch,
  createComputed,
  createMemo,
  createSignal,
  getOwner,
  on,
  runWithOwner,
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { Drawer } from "~/components/Drawer";
import { ZIndex } from "~/components/ZIndex";
import { CSSPropertiesEditor } from "~/components/css_properties/CSSPropertiesEditor";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getPropsFromMetaExpressionMGCall } from "~/cypher/get/getPropsFromMetaExpressionMGCall";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { useFormContext } from "~/lib/contexts";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getPropsFromMetaExpression";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { getStringComponent } from "~/lib/graph/get/sync/getStringComponent";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import {
  addNewRow,
  getColumnProps,
  rowMetaInitialize,
} from "~/lib/graph/mutate/form/rowFunction";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";

// Todo dont allow duplicate value in the select field
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
  } & ComponentProps,
) => {
  const [graph, setGraph] = useGraph();
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig, txnId: formTxnId } = useFormContext();
  createComputed(
    on(p.tableColumnsTemplate, (columns) => {
      const metaTxnId = rowMetaInitialize(
        graph,
        setGraph,
        p.joinVertex,
        p.meta,
        columns,
      );
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

  const instResult = createMemo(
    () => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex,
  );
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
  const rowColumnsMetaAttrs = createMemo(() =>
    p.tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"),
  );
  const expandVertex = createMemo(() =>
    p.tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"),
  );
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
            createComputed(
              on(
                () =>
                  getPropsFromMetaExpression(
                    graph,
                    setGraph,
                    metaVertex(),
                    p.joinVertex,
                  ),
                async (v) => {
                  if (metaVertex().P.meta) {
                    let metaData;
                    if (formTxnId) {
                      const mutationData = formTxnId
                        ? commitTxn(formTxnId, graph)
                        : undefined;
                      metaData = await getPropsFromMetaExpressionMGCall(
                        metaVertex(),
                        [p.joinVertex],
                        mutationData,
                        10,
                      );
                    } else {
                      metaData = v;
                    }
                    const metaDataVal = removeUndefinedProperties(
                      metaData,
                      false,
                      10,
                    );

                    const newMetaData = Object.assign(
                      // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
                      getColumnProps(
                        graph.vertexes[metaVertex().P.templateId] ?? { P: {} },
                        graph,
                      ),
                      metaDataVal,
                    );

                    replaceVertexProperties(
                      0,
                      metaVertex().id,
                      graph,
                      setGraph,
                      newMetaData,
                    );
                  }
                },
              ),
            );
          }
          const [component, setComponent] = createWritableMemo(() =>
            getComponent(column.id),
          );
          function getComponent(columnId: Id) {
            const columnMetaVertex = getMetaVertex(columnId);
            if (columnMetaVertex.P.component.includes("-")) {
              createComputed(
                on(
                  () => getSelectionOptions(
                    graph,
                    setGraph,
                    columnMetaVertex.P.component,
                    [p.joinVertex]
                  ).vertexes,
                  async (vertexes) => {
                    let component = "";
                    if (formTxnId) {
                      const mutationData = formTxnId
                        ? commitTxn(formTxnId, graph)
                        : undefined;
                      const res = await getSelectionOptionsMGCall(
                        [p.joinVertex],
                        columnMetaVertex.P.component,
                        mutationData,
                        10
                      );
                      if (isValidResponse(res) &&
                        typeof res.result === "string") {
                        component = res.result;
                      }
                    } else {
                      component = vertexes;
                    }
                    if (!component) {
                      component = getStringComponent(graph)?.P.name;
                    }
                    setTimeout(() => {
                      runWithOwner(outerOwner, () => {
                        setComponent(component);
                      });
                    })
                  }
                )
              );
            } else {
              return columnMetaVertex.P.component;
            }
          }

          const DefaultValue = () => (
            <Show when={metaVertex().P.defaultValue}>
              {
                getSelectionOptions(
                  graph,
                  setGraph,
                  metaVertex().P.defaultValue,
                  [p.joinVertex],
                ).vertexes
              }
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
                meta={
                  component() === "DynamicTable"
                    ? graph.vertexes[metaVertex().P.templateId]
                    : metaVertex()
                }
                setValue={p.setValue}
                title={toTitle(column.P.displayName || column.P[IdAttr] || "")}
                txnId={p.txnId}
              />
            </>
          );
          const CssEditor = () => {
            const [showCssEditor, setShowCssEditor] = createSignal(false);
            return <>
              <button onClick={() => setShowCssEditor(true)} type="button">Edit CSS</button>
              <Show when={showCssEditor()}>
                <ZIndex>
                  <Drawer
                    customButton={() => false}
                    drawerClass={"padding:10px"}
                    open={showCssEditor}
                    setIsOpen={
                      ((v: boolean) =>
                        setShowCssEditor(v)) as Setter<boolean>
                    }
                  >
                    <CSSPropertiesEditor
                      data={p.joinVertex}
                      meta={metaVertex()}
                      setValue={data => {
                        setValueGlobal(
                          graph,
                          setGraph,
                          p.txnId,
                          metaVertex(),
                          p.joinVertex,
                          data,
                          false,
                        );
                      }}
                      txnId={p.txnId}
                    />
                  </Drawer>
                </ZIndex >
              </Show>
            </>
          }

          return (
            <Switch>
              <Match when={metaVertex().P.hidden}>
                <td class="align-content:center">
                  <div
                    class={`${getComponentClass(component())} flex ai:center jc:center`}
                  >
                    <DefaultValue />
                  </div>
                </td>
              </Match>
              <Match when={metaVertex()?.P.name === 'value' && ((p.joinVertex?.P.name ?? '').endsWith('Class') || (p.joinVertex?.P.name ?? '') === 'class')}>
                <td class="align-content:center">
                  <div
                    class={`flex ai:center jc:center`}
                  >
                    <CssEditor />
                  </div>
                </td>
              </Match>
              <Match when={component() === "DynamicTable"}>
                <td class="align-content:center">
                  <Show when={!disabled()}>
                    <div
                      class={`${getComponentClass(component())} flex ai:center jc:center`}
                    >
                      <DefaultValue />
                      <Content />
                    </div>
                  </Show>
                </td>
              </Match>
              <Match when={true}>
                <td
                  class={`${getComponentClass(component())} align-content:center padding:1px`}
                >
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
        classList={{
          "background-color:#e0e0e0": p.rowIndex === p.dragFromIndex(),
          "background-color:#f0f0f0": p.rowIndex === p.dragToIndex(),
          "background-color:white":
            p.rowIndex !== p.dragFromIndex() && p.rowIndex !== p.dragToIndex(),
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
              <Icon
                class={"transition:transform|2s|ease-in-out"}
                icon="material-symbols:drag-indicator"
              />
            </button>
            <button
              class="cursor:pointer;"
              onClick={() => setExpanded(!expanded())}
            >
              <Icon
                class={"transition:transform|2s|ease-in-out"}
                classList={{ "margin-top:7px": true }}
                icon={`${expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}`}
              />
            </button>
            <Icon
              class="color:red cursor:pointer m:5px"
              height={20}
              icon="mingcute:delete-line"
              onClick={() =>
                deleteRow(
                  p.joinVertex,
                  p.isRealTime!,
                  graph,
                  setGraph,
                  p.txnId!,
                )
              }
              width={20}
            />
            <Show when={expandVertex()}>
              <Icon
                class="color:green cursor:pointer"
                height={20}
                icon="icon-park-outline:plus"
                onClick={() =>
                  addNewRow(
                    p.txnId ?? 0,
                    expandVertex()!,
                    graph,
                    setGraph,
                    p.joinVertex,
                    {},
                    p.isRealTime ?? false,
                  )
                }
                width={20}
              />
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
              txnId={p.txnId}
            />
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
