import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
  useContext,
  on,
  getOwner,
  runWithOwner,
} from "solid-js";
import { SimpleTable } from "solid-simple-table"
// import { closestCenter, createSortable, DragDropProvider, DragDropSensors, DragEventHandler, SortableProvider, } from "@thisbeyond/solid-dnd";
import { css } from "solid-styled-components";
import { toTitle } from "case-switcher-js";
import {
  findVertexByLabelAndUniqueId,
  replaceVertexProperties,
} from "../../lib/Vertex";
import {
  getNewTxnId,
  graph,
  IdAttr,
  revertTransaction,
  Vertex,
} from "../../lib/graph";
import { WsContext } from "../../utils/ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent } from "../DynamicComponent";
import {
  addMeta,
  componentProps,
  getCollAttrs,
  getStringComponent,
  rowMetaInitialize,
} from "../../lib/Record";
import {
  getChildVertex,
  addNewRow,
  getSublistRows,
  addMetaVertexes,
  FieldAttribute,
  FormContext,
  deleteRow,
  getSelectionOptions,
  getChildVertexes,
} from "../../lib/Utils";
import { ComponentProps } from "../ComponentType";
import { Icon } from "@iconify-icon/solid";
import {
  PageRenderContext,
  PageRenderUtils,
  RepeaterContext,
} from "./GenaricField";
import { GenericField } from "./Components/GenericFieldComponent";
import { getLastItem } from "../../utils/functions";
import { MySimpleTable } from "../simple-table/solid-simple-table/demo/simple";
import { Separator } from "@kobalte/core";

export function TableInputField(
  props: ComponentProps & { txnId?: number; isRealTime?: boolean }
) {
  const { Ws } = useContext(WsContext);
  // if there is no parent FormContext, it should still work.
  let { cleanUpConfig } = useContext(FormContext);
  const outerOwner = getOwner();
  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  // columns
  // finally remove props.getMetaAttributes(props.meta)

  const getAttributes = () => {
    // If child vertexes, use it
    const childAttrVertex = getChildVertexes(
      ["Attr", "$0Att"],
      [props.meta]
    ).vertexes;
    if (childAttrVertex?.length) {
      return childAttrVertex;
    }

    // else get attributes from a collection.
    const attrVertex = getChildVertex(["$0Att"], props.meta).vertex;
    if (!attrVertex) return;

    return getChildVertexes(["Attr"], [attrVertex]).vertexes;
  };
  const tableColumnsTemplate = createMemo(
    () =>
      getAttributes() ||
      getChildVertexes(["MetaAttr"], [props.meta]).vertexes ||
      []
  );

  // add dynamic meta from separate collection.
  // If props.meta.P.attributes are not present and props.meta.props.collection is present then get attributes from the collection
  if (!props.meta.P.attributes && props.meta.P.meta) {
    const metaData = componentProps(props.meta, props.data!);
    if (metaData.collection) {
      // add metadata from separate collection.
      const collVertex = findVertexByLabelAndUniqueId(
        "Coll",
        IdAttr,
        metaData.collection
      );
      if (collVertex) {
        const vertexCollAttrResult = getChildVertexes(["Attr"], [collVertex]);
        if (!vertexCollAttrResult.error) {
          const vertexCollAttr = vertexCollAttrResult.vertexes!;
          const attrs = [] as FieldAttribute[];
          for (const attr of vertexCollAttr) {
            const props = getCollAttrs(attr);
            if (!props.error) attrs.push(props.attr!);
          }
          const newProperties = klona(props.meta.P);
          newProperties.attributes = attrs;
          replaceVertexProperties(getNewTxnId(), props.meta.id, newProperties);

          const txnId = getNewTxnId();
          addMetaVertexes(txnId, props.meta, attrs);
          onCleanup(() => {
            revertTransaction(txnId);
          });
        }
      }
    }
  }
  const parentItems = useContext(PageRenderContext);

  const parentData = createMemo(() => {
    return PageRenderUtils.getDataVertex(getLastItem(parentItems, 1));
  });
  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(props.meta, props.data || parentData());
    setSortedVertexes(vertexes);
  });

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { joinVertex: Vertex; index: number }) => {
    // const sortable = createSortable(p.joinVertex.id);

    createComputed(
      on(tableColumnsTemplate, (columns) => {
        const metaTxnId = rowMetaInitialize(p.joinVertex, props.meta, columns);

        if (metaTxnId) {
          if (cleanUpConfig) {
            if (!cleanUpConfig.rowMetaTxnIds) {
              cleanUpConfig.rowMetaTxnIds = [];
            }
            // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.
            if (cleanUpConfig.rowMetaTxnIds.includes(metaTxnId))
              cleanUpConfig.rowMetaTxnIds.push(metaTxnId);
          }
        }
      })
    );

    const instResult = createMemo(
      () => getChildVertex(["AttrInst"], p.joinVertex).vertex
    );
    // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
    const rowColumnsMetaAttrs = createMemo(() =>
      tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand")
    );
    const expandVertex = createMemo(() =>
      tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand")
    );

    const [disabled, _] = createSignal(false);

    const DisplayProperties = () => {
      return (
        <For each={rowColumnsMetaAttrs()}>
          {(column) => {
            const metaVertex = createMemo(() =>
              instResult()
                ? graph.vertexes[instResult()!.P.rows[column.id]]
                : ({ P: { component: "String" } } as unknown as Vertex)
            );
            const component = createMemo(() => {
              if (metaVertex().P.component.includes("-")) {
                // Todo Fix: why this prints two times:
                console.log(
                  "refreshing");
                const component = getSelectionOptions(
                  [p.joinVertex],
                  metaVertex().P.component
                ).vertexes;
                if (component) {
                  return component;
                } else {
                  return getStringComponent()?.P.name;
                }
              } else {
                return metaVertex().P.component;
              }
            });
            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(metaVertex(), p.joinVertex);
            });
            const DefaultValue = () => (
              <>
                {metaVertex().P.props?.defaultValue &&
                  getSelectionOptions(
                    [p.joinVertex],
                    metaVertex().P.props.defaultValue
                  ).vertexes}
              </>
            );
            const Content = () => (
              <>
              
                <DynamicComponent
                  title={toTitle(
                    column.P.displayName || column.P[IdAttr] || ""
                  )}
                  component={component()}
                  // When we have a Table we pass original Table Meta Vertex
                  meta={
                    component() === "Table"
                      ? graph.vertexes[metaVertex().P.templateId]
                      : metaVertex()
                  }
                  data={p.joinVertex}
                  setValue={props.setValue!}
                  disabled={disabled()}
                  txnId={props.txnId}
                  isRealTime={props.isRealTime}
                />
              </>
            );

            return (
              <Switch>
                <Match when={metaVertex().P.props?.hidden}>
                  <td>
                    <div class="">
                      <DefaultValue />
                    </div>
                  </td>
                </Match>
                <Match when={component() === "Table"}>
                  <td style={{ padding: "1rem" }}>
                    <Show when={!props.disabled}>
                      <div class="">
                        <DefaultValue />
                        <Content />
                      </div>
                    </Show>
                  </td>
                </Match>
                <Match when={true}>
                  <td class="max-w:400px padding:1px">
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
          // use:sortable
          // classList={{ "opacity-25": sortable.isActiveDraggable }}
          style={{ "text-align": "center", width: "50px" }}
        >
          <td style={{}}>
            {p.joinVertex.P.pos}
            {/*<Icon icon="material-symbols:drag-indicator" width={25} height={25} />*/}

            {/*<Icon icon="mingcute:up-fill"  />*/}
            {/*<Icon icon="mingcute:down-fill"  />*/}
            {/*<Icon icon="material-symbols:add-box"  />*/}
            <div>
              <Icon
                icon="mingcute:delete-line"
                class="cursor:pointer"
                style={{ color: "red" }}
                onClick={() =>
                  deleteRow(p.joinVertex, props.isRealTime!, props.txnId!, Ws)
                }
              />
            </div>
            {/*<Show when={!props.disabled}>*/}
            {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
            {/*</Show>*/}

            <Show when={expandVertex()}>
              <Icon
                icon="icon-park-outline:plus"
                class="cursor:pointer "
                style={{ color: "green" }}
                onClick={() => {
                  return addNewRow(
                    props.txnId || 0,
                    expandVertex()!,
                    p.joinVertex,
                    {},
                    props.isRealTime ?? false,
                    Ws
                  );
                }}
              />
            </Show>
          </td>
          <DisplayProperties />
        </tr>
        {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
        {/*{getSelectionOptions([p.joinVertex], expandVertex.P.props.collection).vertexes?.length}*/}
        <Show when={expandVertex()}>
          <tr>
            <td class="pl:24" colspan={rowColumnsMetaAttrs().length + 1}>
              <DynamicComponent
                component={"Table"}
                // When we have a Table we pass original Table Meta Vertex
                meta={expandVertex()!}
                data={p.joinVertex}
                setValue={props.setValue!}
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

  // @commented drag and drop related code.
  // const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  // const ids = () => sortedVertexes().map((vertex) => vertex.id);
  // const onDragStart: DragEventHandler = ({ draggable }) => {
  //   setActiveDragItem(draggable.id);
  // };
  // const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
  //   if (draggable && droppable) {
  //     const currentItems = ids();
  //     const fromIndex = currentItems.indexOf(draggable.id as number);
  //     const toIndex = currentItems.indexOf(droppable.id as number);
  //     if (isRealTime) {
  //       txnId = getNewTxnId();
  //     }
  //     if (fromIndex !== toIndex) {
  //       const updatedItems = currentItems.slice();
  //       updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
  //       // runWithOwner(owner, () => {
  //       batch(() => {
  //         updatedItems.forEach((vertexId, index) => {
  //           const { error } = mergeVertexProperties(txnId, vertexId, {
  //             pos: index + 1,
  //           });
  //           if (error) alert(error);
  //         });
  //       });
  //     }
  //     if (isRealTime) commitTxn(txnId, Ws);
  //   }
  //   setActiveDragItem(null);
  // };

  const insertNewRow = () => {
    if (!props.data) {
      alert("Table data is not set");
      return;
    }

    return runWithOwner(outerOwner, () =>
      addNewRow(
        props.txnId || 0,
        props.meta,
        props.data!,
        {},
        props.isRealTime ?? false,
        Ws
      )
    );
  };
  const AddNewButton = (isInTableButton: any) => {
    // return <Icon icon="material-symbols:add-box" onClick={() => addNewRow(record.txnId, props.meta, props.data!, {},record.isRealTime, Ws)}/>
    return (
      <GenericField
        meta={
          {
            P: {
              component: "Button",
              props: {
                children: "Add",
                variant: "contained",
                onClick: () => insertNewRow(),
              },
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
        <div>
          {/*<Show when={props.meta.P.attributes}>*/}
          {/*  <FormGroup form={{title: '', label: props.meta.P.props.title || props.meta.P[IdAttr], attributes: props.meta.P.attributes}} vertex={props.vertex}/>*/}
          {/*</Show>*/}
          {/* <Show when={sortedVertexes().length}> */}
          <AddNewButton />
          {/* </Show> */}

          <div
            class={css`
              table,
              th,
              td {
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-collapse: collapse;
              }
            `}
            style={{ "margin-top": "5px" }}
          >
            <table
              style={{ "align-content": "center" }}
              classList={{
                "f:11": sortedVertexes().length === 0,
              }}
            >
              <Show when={sortedVertexes().length}>
                <thead>
                  <tr
                    class="bg:#C9DBFC"
                    style={{
                      width: "max-content",
                    }}
                  >
                    <td></td>
                    <For each={tableColumnsTemplate()}>
                      {(attribute) => {
                        return (
                          <Switch>
                            {/*<Match when={attribute.props?.skip}></Match>*/}
                            <Match when={attribute.P.tab === "expand"}>
                              <span></span>
                            </Match>
                            <Match
                              when={
                                !attribute.P.hidden || attribute.P.defaultValue
                              }
                            >
                              <th
                                style={{
                                  "padding-left": "15px",
                                  "padding-right": "15px",
                                  "justify-content": "center",
                                }}
                              >
                                {toTitle(
                                  attribute.P.displayName ||
                                    attribute.P[IdAttr] ||
                                    ""
                                )}
                              </th>
                            </Match>

                            <Match when={true}>
                              <th></th>
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
                    <RepeaterContext.Provider
                      value={[vertex, ...useContext(RepeaterContext)]}
                    >
                      <SortableRow joinVertex={vertex} index={index()} />
                    </RepeaterContext.Provider>
                  )}
                </For>
                {/*  </SortableProvider>*/}
                {/*</DragDropProvider>*/}
              </tbody>
            </table>
          </div>
        </div>

        {/*<Show when={props.page}>*/}
        {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}
