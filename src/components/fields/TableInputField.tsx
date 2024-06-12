import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  Match,
  on,
  onCleanup,
  runWithOwner,
  Show,
  splitProps,
  Switch,
  useContext,
} from "solid-js";
import "~/components/fields/table.css";
import { toTitle } from "case-switcher-js";
import {
  mergeVertexProperties,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent } from "~/components/form/DynamicComponent";

import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import {
  addNewRow,
  getSublistRows
} from "~/lib/graph/mutate/form/rowFunction";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { Icon } from "@iconify-icon/solid";
import { GenericField } from "~/components/fields/GenericField";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import "~/css/base.css";
import {
  componentProps,
  getCollAttrs,
  getStringComponent,
} from "~/lib/graph/get/sync/graph_functions";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { addMeta } from "~/lib/graph/mutate/form/metaFunction";
import { rowMetaInitialize } from "~/lib/graph/mutate/form/rowFunction";
import { useToast } from "~/components/Toast";
import { FormContext, NewTxnIdContext } from "~/lib/contexts";
import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/page_item_render/Context";
import { getLastItem } from "~/components/page_item_render/getLastItem";
import {PageRenderUtils} from "~/components/page_item_render/PageRenderUtils";

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

  const getAttributes = () => {
    // If child vertexes, use it
    const childAttrVertex = getChildVertexes(
      graph,
      ["Attr", "$0Att"],
      [props.meta],
    ).vertexes;
    if (childAttrVertex?.length) {
      return childAttrVertex;
    }

    // else get attributes from a collection.
    const attrVertex = getChildVertex(graph, ["$0Att"], props.meta).vertex;
    if (!attrVertex) return;

    return getChildVertexes(graph, ["Attr"], [attrVertex]).vertexes;
  };

  const tableColumnsTemplate = createMemo(
    () =>
      getAttributes() ||
      getChildVertexes(graph, ["MetaAttr"], [props.meta]).vertexes ||
      [],
  );

  // add dynamic props.meta from separate collection.
  // If props.meta.P.attributes are not present and props.meta.collection is present then get attributes from the collection
  if (!props.meta.P.attributes && props.meta.P.meta) {
    const metaData = componentProps(graph, setGraph, props.meta, props.data!);
    if (metaData.collection) {
      // add metadata from separate collection.
      const collVertex = findVertexByLabelAndUniqueId(
        graph,
        "Coll",
        IdAttr,
        metaData.collection,
      );
      if (collVertex) {
        const vertexCollAttrResult = getChildVertexes(
          graph,
          ["Attr"],
          [collVertex],
        );
        if (!vertexCollAttrResult.error) {
          const vertexCollAttr = vertexCollAttrResult.vertexes!;
          const attrs = [] as FieldAttribute[] | any;
          for (const attr of vertexCollAttr) {
            const props = getCollAttrs(graph, setGraph, attr);
            if (!props.error) attrs.push(attr!);
          }
          const newProperties = klona(props.meta.P);
          newProperties.attributes = attrs;
          replaceVertexProperties(
            useContext(NewTxnIdContext),
            props.meta.id,
            graph,
            setGraph,
            newProperties,
          );

          const txnId = getNewTxnId(graph, setGraph);
          addMetaVertexes(graph, setGraph, txnId, props.meta, attrs);
          onCleanup(() => {
            revertTransaction(txnId);
          });
        }
      }
    }
  }
  const parentItems = useContext(PageRenderVertexContext);

  const parentData = createMemo(() => {
    return PageRenderUtils.getDataVertex(graph, getLastItem(parentItems, 1));
  });
  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(
      graph,
      props.meta,
      props.data || parentData(),
    );
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<number | null>(null);
  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: {joinVertex: Vertex; index: number }) => {
    const handleDrop = () => {
      if (
        dragFromIndex() !== null &&
        dragToIndex() !== null &&
        dragFromIndex() !== dragToIndex()
      ) {
        const updatedRows = [...sortedVertexes()];
        const [draggedRow] = updatedRows.splice(dragFromIndex()!, 1);
        updatedRows.splice(dragToIndex()!, 0, draggedRow);
        setSortedVertexes(updatedRows);
        updatedRows.forEach((vertex, index) => {
          mergeVertexProperties(props.txnId!, vertex.id, graph, setGraph, {
            pos: index + 1,
          });
        });
      }
      setDragFromIndex(null);
      setDragToIndex(null);
    };

    const getMetaVertex = (columnId: any, metaVertices = new Map()) => {
      if (!metaVertices.has(columnId)) {
        const instRes = instResult();
        const rowId = instRes?.P?.rows[columnId];
        if (rowId !== undefined && graph.vertexes[rowId]) {
          metaVertices.set(columnId, graph.vertexes[rowId]);
        } else {
          metaVertices.set(columnId, { P: { component: "Error" } });
        }
      }
      return metaVertices.get(columnId);
    };

    const getComponent = (columnId: any, components = new Map()) => {
      if (!components.has(columnId)) {
        const metaVertex = getMetaVertex(columnId);
        if (metaVertex.P.component.includes("-")) {
          const component =
            getSelectionOptions(
              graph,
              setGraph,
              [p.joinVertex],
              metaVertex.P.component,
            ).vertexes || getStringComponent(graph)?.P.name;
          components.set(columnId, component);
        } else {
          components.set(columnId, metaVertex.P.component);
        }
      }
      return components.get(columnId);
    };
    createComputed(
      on(tableColumnsTemplate, (columns) => {
        const metaTxnId = rowMetaInitialize(
          graph,
          setGraph,
          p.joinVertex,
          props.meta,
          columns,
        );

        if (metaTxnId) {
          if (cleanUpConfig) {
            if (!cleanUpConfig().rowMetaTxnIds) {
              cleanUpConfig().rowMetaTxnIds = [];
            }
            // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.
            if (cleanUpConfig().rowMetaTxnIds.includes(metaTxnId))
              cleanUpConfig().rowMetaTxnIds.push(metaTxnId);
          }
        }
      }),
    );

    const instResult = createMemo(
      () => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex,
    );
    // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
    const rowColumnsMetaAttrs = createMemo(() =>
      tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"),
    );
    const expandVertex = createMemo(() =>
      tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"),
    );
    const [expanded, setExpanded] = createSignal(false);

    const [disabled, _] = createSignal(false);

    const DisplayProperties = () => {
      return (
        <For each={rowColumnsMetaAttrs()}>
          {(column) => {
            const metaVertex = createMemo(() => getMetaVertex(column.id));

            const component = createMemo(() => getComponent(column.id));

            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(graph, setGraph, metaVertex(), p.joinVertex);
            });
            const DefaultValue = () => (
              <Show when={metaVertex().P.defaultValue}>
                {
                  getSelectionOptions(
                    graph,
                    setGraph,
                    [p.joinVertex],
                    metaVertex().P.defaultValue,
                  ).vertexes
                }
              </Show>
            );
            const Content = () => {
              return (
                <>
                  <Show when={component() === "Error"}>Error</Show>
                  <DynamicComponent
                    title={toTitle(
                      column.P.displayName || column.P[IdAttr] || "",
                    )}
                    isTableInside={false}
                    component={component()}
                    // When we have a Table we pass original Table Meta Vertex
                    meta={
                      component() === "Table2" || component() === "Table"
                        ? graph.vertexes[metaVertex().P.templateId]
                        : metaVertex()
                    }
                    data={p.joinVertex}
                    setValue={props.setValue}
                    disabled={disabled()}
                    txnId={props.txnId}
                    isRealTime={props.isRealTime}
                  />
                </>
              );
            };

            return (
              <Switch>
                <Match when={metaVertex().P.hidden}>
                  <td>
                    <div
                      class={`flex ai:center jc:center ${(() => {
                        const comp = component();
                        switch (comp) {
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
                      })()}`}
                    >
                      <DefaultValue />
                    </div>
                  </td>
                </Match>
                <Match when={component() === "Table2"}>
                  <td>
                    <Show when={!disabled()}>
                      <div
                        class={`flex ai:center jc:center ${(() => {
                          const comp = component();
                          switch (comp) {
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
                        })()}`}
                      >
                        <DefaultValue />
                        <Content />
                      </div>
                    </Show>
                  </td>
                </Match>
                <Match when={true}>
                  <td
                    class={`padding:1px ${(() => {
                      const comp = component();
                      switch (comp) {
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
                    })()}`}
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
          draggable={true}
          onDragStart={() => setDragFromIndex(p.index)}
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => setDragToIndex(p.index)}
          onDrop={handleDrop}
          style={{
            "text-align": "center",
            width: "50px",
            "background-color":
              dragFromIndex() === p.index
                ? "#e0e0e0"
                : dragToIndex() === p.index
                  ? "#f0f0f0"
                  : "white",
            transition: "background-color 0.2s ease",
            border:
              dragToIndex() === p.index
                ? "2px solid green"
                : "1px solid #ddd",
          }}
        >
          <td>
            <div class={"flex ai:center jc:center"}>
              <button class="cursor: grab;">
                <Icon
                  icon="material-symbols:drag-indicator"
                  class={"transform 2s ease-in-out"}
                />
              </button>
              {/* {p.joinVertex} */}
              {/* <Show when={sortedVertexes()}> */}
                <button
                  class="cursor: pointer;"
                  onClick={(e) => {
                    setExpanded(!expanded());
                  }}
                >
                  <Icon
                    icon={`${expanded() ? "mingcute:up-fill" : "mingcute:down-fill"}`}
                    class={"transform 2s ease-in-out"}
                    style={{
                      "margin-top": "7px",
                    }}
                  />
                </button>
              {/* </Show> */}
              <Icon
                height={20}
                width={20}
                icon="mingcute:delete-line"
                class="cursor:pointer m:5px"
                style={{ color: "red" }}
                onClick={() =>
                  deleteRow(
                    p.joinVertex,
                    props.isRealTime!,
                    graph,
                    setGraph,
                    props.txnId!,
                    Ws,
                  )
                }
              />
              <Show when={expandVertex()}>
                <Icon
                  height={20}
                  width={20}
                  icon="icon-park-outline:plus"
                  class="cursor:pointer "
                  style={{ color: "green" }}
                  onClick={() => {
                    return addNewRow(
                      props.txnId || 0,
                      expandVertex()!,
                      graph,
                      setGraph,
                      p.joinVertex,
                      {},
                      props.isRealTime ?? false,
                      Ws,
                    );
                  }}
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
          <tr>
            <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>

              <DynamicComponent
                component={"Table2"}
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
      addNewRow(
        props.txnId || 0,
        props.meta,
        graph,
        setGraph,
        props.data!,
        {},
        props.isRealTime ?? false,
        Ws,
      ),
    );
  };
  const AddNewButton = (isInTableButton: any) => {
    return (
      <GenericField
        meta={
          {
            P: {
              component: "Button",
              
                children: "Add",
                variant: "soft",
                onClick: () => insertNewRow(),
              
            },
          } as unknown as Vertex
        }
      />
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
        <Show when={props.isTableInside}>
          <AddNewButton />
        </Show>
        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
          <div
            class={" overflow:auto r:10 m:2"}
          style={{ 'border': sortedVertexes().length ? '1px solid #37c':'', "scrollbar-width": "thin" }}
          >
            <table class="styled-table b:none" style={{
              width: props.isTableInside ? '-webkit-fill-available' : ''
            }}>
            <Show when={sortedVertexes().length}>

              <thead>
                <tr
                  style={{
                    width: "max-content",
                  }}
                >
                  <td class={"font-weight:medium p:0px|10px"}
                    style={{
                      "text-align-last": "center",
                    }}>&nbsp;Actions</td>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => {
                      return (
                        <Switch>
                          {/*<Match when={attribute.P.skip}></Match>*/}
                          <Match when={attribute.P.tab === "expand"}>
                            <span />
                          </Match>
                          <Match
                            when={
                              !attribute.P.hidden || attribute.P.defaultValue
                            }
                          >
                            <th
                              class={"font-weight:medium p:0px|10px"}
                              style={{
                                "justify-content": "center",
                              }}
                            >
                              {toTitle(
                                attribute.P.displayName ||
                                attribute.P[IdAttr] ||
                                "",
                              )}
                            </th>
                          </Match>

                          <Match when={true}>
                            <th />
                          </Match>
                        </Switch>
                      );
                    }}
                  </For>
                </tr>
              </thead>
</Show>
              <tbody>
                {/*<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>*/}
                {/*  <DragDropSensors />*/}
                {/*  <SortableProvider ids={ids()}>*/}
                <For each={sortedVertexes()}>
                  {(vertex, index) => (
                    <RepeaterVertexContext.Provider
                      value={[vertex, ...useContext(RepeaterVertexContext)]}
                    >
                      
                      <SortableRow joinVertex={vertex} index={index()} />
                    </RepeaterVertexContext.Provider>
                  )}
                </For>
                {/*  </SortableProvider>*/}
                {/*</DragDropProvider>*/}
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
